// ~app/api/auth/cafe24/access/authorization.tsx
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // db 객체 불러오기

export async function GET(req: NextRequest) {
  const { code: cafe24Code, state: cafe24State } = Object.fromEntries(req.nextUrl.searchParams);
  
  // 필요한 파라미터가 없으면 에러 처리
  if (!cafe24Code || !cafe24State) {
    return NextResponse.json({ error: 'Cafe24 authorization code or state missing' }, { status: 400 });
  }

  const cafe24ClientId = process.env.CAFE24_CLIENT_ID!;
  const cafe24ClientSecret = process.env.CAFE24_CLIENT_SECRET!;
  const cafe24RedirectUri = process.env.CAFE24_REDIRECT_URI!;
  
  // 액세스 토큰 요청을 위한 데이터
  const cafe24TokenUrl = `https://${cafe24State}.cafe24api.com/api/v2/oauth/token`;
  
  const cafe24Params = new URLSearchParams();
  cafe24Params.append('grant_type', 'authorization_code');
  cafe24Params.append('code', cafe24Code);
  cafe24Params.append('redirect_uri', cafe24RedirectUri);

  const cafe24AuthHeader = `Basic ${Buffer.from(`${cafe24ClientId}:${cafe24ClientSecret}`).toString('base64')}`;
  
  // 액세스 토큰 요청
  try {
    const cafe24Response = await fetch(cafe24TokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': cafe24AuthHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: cafe24Params.toString(),
    });

    // 상태 코드 확인
    if (!cafe24Response.ok) {
      console.error(`Error fetching Cafe24 access token: ${cafe24Response.status} ${cafe24Response.statusText}`);
      return NextResponse.json({ error: 'Failed to fetch Cafe24 access token' }, { status: 500 });
    }

    const cafe24Data = await cafe24Response.json();
    
    const { 
      access_token: cafe24AccessTokenRaw, 
      expires_at: cafe24ExpiresAt, 
      refresh_token: cafe24RefreshTokenRaw, 
      refresh_token_expires_at: cafe24RefreshTokenExpiresAt, 
      client_id: cafe24ClientIdResponse, 
      mall_id: cafe24MallId, 
      user_id: cafe24UserId, 
      scopes: cafe24Scopes, 
      issued_at: cafe24IssuedAt 
    } = cafe24Data;

    const cafe24AccessToken = `cafe24_${cafe24AccessTokenRaw}`;
    const cafe24RefreshToken = `cafe24_${cafe24RefreshTokenRaw}`;

    // SQL 쿼리 작성
    const cafe24TokensInsertQuery = `
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
    ON CONFLICT (mall_id) 
    DO UPDATE SET 
      access_token = $1, 
      expires_at = $2, 
      refresh_token = $3, 
      refresh_token_expires_at = $4, 
      client_id = $5, 
      user_id = $7,
      scopes = $8, 
      issued_at = $9;
    `;

    // DB에 데이터 삽입
    try {
      await db.query(cafe24TokensInsertQuery, [
        cafe24AccessToken,
        cafe24ExpiresAt,
        cafe24RefreshToken,
        cafe24RefreshTokenExpiresAt,
        cafe24ClientIdResponse,
        cafe24MallId,
        cafe24UserId,
        JSON.stringify(cafe24Scopes),
        cafe24IssuedAt,
      ]);

      console.log('Cafe24 token data saved successfully!');
    } catch (error) {
      console.error('Error saving Cafe24 token to database:', error);
      const errorMessage = (error as Error).message;
      return NextResponse.json({ error: 'Failed to save Cafe24 token data', details: errorMessage }, { status: 500 });
    }

    // 토큰 저장 후 리다이렉트
    const cafe24RedirectTo = `${req.nextUrl.origin}/dashboard?mall_id=${cafe24MallId}`;
    return NextResponse.redirect(`${req.nextUrl.origin}/dashboard?mall_id=${cafe24MallId}`);
  } catch (error) {
    console.error('Error fetching Cafe24 access token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
