// ~app/api/auth/cafe24/access/authorization.tsx
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // db 객체 불러오기
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const { code: cafe24Code, state: cafe24MallId } = Object.fromEntries(req.nextUrl.searchParams);
  
  // 필요한 파라미터가 없으면 에러 처리
  if (!cafe24Code || !cafe24MallId) {
    return NextResponse.json({ error: 'Cafe24 authorization code or state missing' }, { status: 400 });
  }

  const cafe24ClientId = process.env.CAFE24_CLIENT_ID!;
  const cafe24ClientSecret = process.env.CAFE24_CLIENT_SECRET!;
  const cafe24RedirectUri = process.env.CAFE24_REDIRECT_URI!;
  
  // 액세스 토큰 요청을 위한 데이터
  const cafe24TokenUrl = `https://${cafe24MallId}.cafe24api.com/api/v2/oauth/token`;
  
  const cafe24Params = new URLSearchParams();
  cafe24Params.append('grant_type', 'authorization_code');
  cafe24Params.append('code', cafe24Code);
  cafe24Params.append('redirect_uri', cafe24RedirectUri);

  const cafe24AuthHeader = `Basic ${Buffer.from(`${cafe24ClientId}:${cafe24ClientSecret}`).toString('base64')}`;
  console.log('cafe24Code:', cafe24Code);
  console.log('cafe24MallId:', cafe24MallId);
  console.log('cafe24AuthHeader:', cafe24AuthHeader);
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
      access_token: cafe24AccessToken, 
      expires_at: cafe24ExpiresAt, 
      refresh_token: cafe24RefreshToken, 
      refresh_token_expires_at: cafe24RefreshTokenExpiresAt, 
      client_id: cafe24ClientIdResponse, 
      mall_id: cafe24MallId, 
      user_id: cafe24UserId, 
      scopes: cafe24Scopes, 
      issued_at: cafe24IssuedAt 
    } = cafe24Data;
    
    // SQL 쿼리 작성
    const cafe24TokensInsertQuery = `
    INSERT INTO tokens (
      cafe24_access_token,
      cafe24_expires_at,
      cafe24_refresh_token,
      cafe24_refresh_token_expires_at,
      cafe24_client_id,
      cafe24_mall_id,
      cafe24_user_id,
      cafe24_scopes,
      cafe24_issued_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (cafe24_mall_id) 
    DO UPDATE SET 
      cafe24_access_token = $1,
      cafe24_expires_at = $2,
      cafe24_refresh_token = $3,
      cafe24_refresh_token_expires_at = $4,
      cafe24_client_id = $5,
      cafe24_user_id = $7,
      cafe24_scopes = $8,
      cafe24_issued_at = $9;
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

      const cookieStore = await cookies();
      const cookieData = {
        cafe24_mall_id: cafe24MallId,
        cafe24_access_token: cafe24AccessToken,
        cafe24_expires_at: cafe24ExpiresAt,
      };

      Object.entries(cookieData).forEach(([name, value]) => {
        cookieStore.set(name, value);
      });

    } catch (error) {
      console.error('Error saving Cafe24 token to database:', error);
      const errorMessage = (error as Error).message;
      return NextResponse.json({ error: 'Failed to save Cafe24 token data', details: errorMessage }, { status: 500 });
    }

    // 토큰 저장 후 리다이렉트
    return NextResponse.redirect(`${req.nextUrl.origin}/dashboard`);
  } catch (error) {
    console.error('Error fetching Cafe24 access token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
