import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import axios from 'axios';

const CLIENT_ID = process.env.CAFE24_CLIENT_ID;
const CLIENT_SECRET = process.env.CAFE24_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const currentCafe24Token = cookieStore.get('cafe24_access_token')?.value;

  if (!currentCafe24Token) {
    return NextResponse.json({ error: 'No access token found' }, { status: 401 });
  }

  try {
    // 현재 액세스 토큰으로 DB에서 정보 조회
    const result = await db.query(
      'SELECT * FROM tokens WHERE cafe24_access_token = $1',
      [currentCafe24Token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Token not found in database' }, { status: 404 });
    }

    const token = result.rows[0];
    const cafe24_mall_id = token.cafe24_mall_id;
    const cafe24_refresh_token = token.cafe24_refresh_token;

    let response;
    try {
      response = await axios.post(
        `https://${cafe24_mall_id}.cafe24api.com/api/v2/oauth/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: cafe24_refresh_token,
        }),
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } catch (axiosError) {
      console.error('Cafe24 Token Refresh Error:', axiosError);
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 });
    }

    const {
      access_token: cafe24AccessToken,
      expires_at: cafe24ExpiresAt,
      refresh_token: cafe24RefreshToken,
      refresh_token_expires_at: cafe24RefreshTokenExpiresAt,
      client_id: cafe24ClientId,
      mall_id: cafe24MallId,
      user_id: cafe24UserId,
      scopes: cafe24Scopes,
      issued_at: cafe24IssuedAt
    } = response.data;

    // DB 업데이트
    await db.query(
      `UPDATE tokens SET 
        cafe24_access_token = $1,
        cafe24_expires_at = $2,
        cafe24_refresh_token = $3,
        cafe24_refresh_token_expires_at = $4,
        cafe24_client_id = $5,
        cafe24_user_id = $6,
        cafe24_scopes = $7,
        cafe24_issued_at = $8
        WHERE cafe24_mall_id = $9`,
      [
        cafe24AccessToken,
        cafe24ExpiresAt,
        cafe24RefreshToken,
        cafe24RefreshTokenExpiresAt,
        cafe24ClientId,
        cafe24UserId,
        JSON.stringify(cafe24Scopes),
        cafe24IssuedAt,
        cafe24MallId,
      ]
    );

    // 새로운 쿠키 설정
    cookieStore.set('cafe24_access_token', cafe24AccessToken);
    cookieStore.set('cafe24_expires_at', cafe24ExpiresAt);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

