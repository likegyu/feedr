import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/lib/db';

// Cafe24 API 요청에 필요한 상수들
const CLIENT_ID = process.env.CAFE24_CLIENT_ID!;
const CLIENT_SECRET = process.env.CAFE24_CLIENT_SECRET!;

// CRON Route Handler
export async function GET(req: NextRequest) {
  try {
    // 보안 검증
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // DB에서 모든 리프레시 토큰과 mall_id 가져오기
    let tokens = [];
    try {
      const { rows } = await db.query('SELECT * FROM tokens');
      tokens = rows;
    } catch (dbError) {
      const error = dbError as Error;
      console.error('Failed to fetch tokens from database. Error details:', error.message, error.stack);
      return NextResponse.json({ error: 'Database Query Failed' }, { status: 500 });
    }

    // 각 리프레시 토큰에 대해 병렬로 액세스 토큰 갱신 요청 보내기
    const tokenPromises = await Promise.all(tokens.map(async (token) => {
      const { mall_id, refresh_token } = token;

      try {
        // Cafe24 API로 액세스 토큰 재발급 요청
        let response;
        try {
          response = await axios.post(
            `https://${mall_id}.cafe24api.com/api/v2/oauth/token`,
            new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refresh_token,
            }),
            {
              headers: {
                Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          );
        } catch (axiosError) {
          const error = axiosError as Error;
          console.error(`Failed to request new token for mall_id ${mall_id}. Error details:`, error.message, error.stack);
          return;
        }

        // 응답 데이터에서 새 토큰 정보 추출
        const {
          access_token,
          expires_at,
          refresh_token: new_refresh_token,
          refresh_token_expires_at,
          client_id,
          user_id,
          scopes,
          issued_at,
        } = response.data;

        // DB에 업데이트
        await db.query(
          `
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
          `,
          [
            access_token,
            expires_at,
            new_refresh_token,
            refresh_token_expires_at,
            client_id,
            mall_id,
            user_id,
            JSON.stringify(scopes),
            issued_at,
          ]
        );
      } catch (error) {
        const err = error as Error;
        console.error(`Failed to refresh token for mall_id ${mall_id}. Error details:`, err.message, err.stack);
      }
    }));

    // 모든 리프레시 토큰 갱신을 병렬로 실행
    await Promise.all(tokenPromises);

    return NextResponse.json({ message: 'Tokens refreshed successfully' });
  } catch (error) {
    const err = error as Error;
    console.error('Cron route error. Error details:', err.message, err.stack);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
