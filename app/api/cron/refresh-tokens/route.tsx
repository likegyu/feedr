import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { db } from '@/lib/db';

// Cafe24 API 요청에 필요한 상수들
const CLIENT_ID = process.env.CAFE24_CLIENT_ID!;
const CLIENT_SECRET = process.env.CAFE24_CLIENT_SECRET!;

// Add type definitions
interface ErrorResponse {
  data?: unknown;
  [key: string]: unknown;
}

// 로깅 유틸리티 함수들
function logError(context: string, error: unknown, additionalInfo?: object) {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    context,
    error: {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...(error instanceof AxiosError && error.response 
          ? { responseData: error.response.data as ErrorResponse } 
          : {}),
    },
    ...additionalInfo,
  };
  
  console.error(JSON.stringify(errorDetails, null, 2));
}

function logInfo(context: string, message: string, additionalInfo?: object) {
  const infoDetails = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    context,
    message,
    ...additionalInfo,
  };
  
  console.log(JSON.stringify(infoDetails, null, 2));
}

// CRON Route Handler
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let successCount = 0;
  let failureCount = 0;

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
      logError('Database Query', dbError, { operation: 'SELECT tokens' });
      return NextResponse.json({ error: 'Database Query Failed' }, { status: 500 });
    }

    // 각 토큰에 대해 병렬로 갱신 요청 보내기
    const tokenPromises = tokens.map(async (token) => {
      const { 
        cafe24_mall_id, 
        cafe24_refresh_token, 
        instagram_access_token,
        instagram_expires_in,
        instagram_issued_at
      } = token;

      try {
        // Cafe24 토큰 갱신 로직
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
          logError('Cafe24 Token Refresh', axiosError, { 
            mallId: cafe24_mall_id,
            operation: 'refresh_token' 
          });
          return;
        }

        // 응답 데이터에서 새 토큰 정보 추출
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

        // DB에 업데이트
        await db.query(
          `
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
          `,
          [
            cafe24AccessToken,
            cafe24ExpiresAt,
            cafe24RefreshToken,
            cafe24RefreshTokenExpiresAt,
            cafe24ClientId,
            cafe24MallId,
            cafe24UserId,
            JSON.stringify(cafe24Scopes),
            cafe24IssuedAt,
          ]
        );

        // Instagram 토큰 갱신 체크
        if (instagram_access_token && instagram_expires_in && instagram_issued_at) {
          const twoDaysInSeconds = 2 * 24 * 60 * 60; // 172800초
          const currentTime = Math.floor(Date.now() / 1000);
          const tokenExpirationTime = instagram_issued_at + instagram_expires_in;
          const remainingSeconds = tokenExpirationTime - currentTime;
          const shouldRefreshInstagram = remainingSeconds <= twoDaysInSeconds;

          if (shouldRefreshInstagram) {
            try {
              const instagramResponse = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${instagram_access_token}`);
              const instagramData = await instagramResponse.json();

              if (instagramResponse.ok) {
                const newIssuedAt = Math.floor(Date.now() / 1000);
                await db.query(
                  `UPDATE tokens 
                   SET instagram_access_token = $1,
                       instagram_expires_in = $2,
                       instagram_issued_at = $3
                   WHERE cafe24_mall_id = $4`,
                  [instagramData.access_token, instagramData.expires_in, newIssuedAt, cafe24_mall_id]
                );
              } else {
                console.error(`Instagram token refresh failed for mall_id ${cafe24_mall_id}:`, instagramData);
              }
            } catch (instagramError) {
              logError('Instagram Token Refresh', instagramError, {
                mallId: cafe24_mall_id,
                operation: 'refresh_instagram_token'
              });
            }
          }
        }

        // 토큰 갱신 성공 시
        successCount++;
        logInfo('Token Refresh Success', `Successfully refreshed tokens for mall ${cafe24_mall_id}`, {
          mallId: cafe24_mall_id,
          tokenTypes: ['cafe24', instagram_access_token ? 'instagram' : null].filter(Boolean)
        });

      } catch (error) {
        failureCount++;
        logError('Token Refresh Process', error, {
          mallId: cafe24_mall_id,
          operation: 'overall_token_refresh'
        });
      }
    });

    // 모든 리프레시 토큰 갱신을 병렬로 실행
    await Promise.allSettled(tokenPromises);

    const executionTime = Date.now() - startTime;
    logInfo('Cron Job Completion', 'Token refresh job completed', {
      totalProcessed: tokens.length,
      successCount,
      failureCount,
      executionTimeMs: executionTime
    });

    return NextResponse.json({ 
      message: 'Tokens refreshed successfully',
      stats: {
        total: tokens.length,
        success: successCount,
        failure: failureCount,
        executionTimeMs: executionTime
      }
    });

  } catch (error) {
    logError('Cron Job Execution', error, { 
      endpoint: '/api/cron/refresh-tokens',
      executionTimeMs: Date.now() - startTime
    });
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
