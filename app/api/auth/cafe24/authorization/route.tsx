import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // db 객체 불러오기

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  
  // 필요한 파라미터가 없으면 에러 처리
  if (!code || !state) {
    return NextResponse.json({ error: 'Authorization code or state missing' }, { status: 400 });
  }

  const clientId = process.env.CAFE24_CLIENT_ID!;
  const clientSecret = process.env.CAFE24_CLIENT_SECRET!;
  const redirectUri = process.env.CAFE24_REDIRECT_URI!;
  
  // 액세스 토큰 요청을 위한 데이터
  const tokenUrl = `https://${state}.cafe24api.com/api/v2/oauth/token`;
  
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);

  const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  
  // 액세스 토큰 요청
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
    });

    // 상태 코드 확인
    if (!response.ok) {
      console.error(`Error fetching access token: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: 'Failed to fetch access token' }, { status: 500 });
    }

    const data = await response.json();
    
    const { access_token, expires_at, refresh_token, refresh_token_expires_at, client_id, mall_id, user_id, scopes, issued_at } = data;

    // SQL 쿼리 작성
    const insertQuery = `
      INSERT INTO tokens (
        access_token, 
        expires_at, 
        refresh_token, 
        refresh_token_expires_at, 
        client_id, 
        mall_id, 
        user_id, 
        scopes, 
        issued_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    // DB에 데이터 삽입
    try {
      await db.query(insertQuery, [
        access_token,
        new Date(expires_at).getTime(),
        refresh_token,
        new Date(refresh_token_expires_at).getTime(),
        client_id,
        mall_id,
        user_id,
        JSON.stringify(scopes), // 배열을 JSON 문자열로 저장
        new Date(issued_at).getTime(),
      ]);

      console.log('Token data saved successfully!');
    } catch (error) {
      console.error('Error saving token to database:', error);
      return NextResponse.json({ error: 'Failed to save token data' }, { status: 500 });
    }

    // 토큰 저장 후 리다이렉트
    const host = req.nextUrl.origin;
    const redirectTo = `${host}/token-display?access_token=${access_token}`;
    return NextResponse.redirect(redirectTo);
    
  } catch (error) {
    console.error('Error fetching access token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
