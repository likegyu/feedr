import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const mall_id = url.searchParams.get('state');
  const state = url.searchParams.get('state');

  if (!code || !mall_id) {
    console.error('필수 파라미터 누락:', { code: !!code, mall_id: !!mall_id });
    return NextResponse.redirect(new URL('/?error=인증_정보_누락', request.url));
  }

  try {

    // 리다이렉트 URI 정규화
    const normalizedRedirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI?.replace(/\/$/, '');

    // 디버깅을 위한 로그
    console.log('인증 요청 정보:', {
      requested_redirect_uri: normalizedRedirectUri,
      current_url: request.url
    });
    
    if (!normalizedRedirectUri) {
      console.error('리다이렉트 URI가 설정되지 않았습니다.');
      return NextResponse.redirect(new URL(`/dashboard?mall_id=${mall_id}&error=설정_오류`, request.url));
    }
    // Instagram 토큰 요청
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: normalizedRedirectUri,
        code,
      }),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Instagram 인증 실패:', data);
      return NextResponse.redirect(new URL(`/dashboard?mall_id=${mall_id}&state=${state}&error=인증_실패`, request.url));
    }

    const { access_token, user_id } = data;

    // 데이터베이스 업데이트
    await db.query(
      `UPDATE tokens 
       SET instagram_access_token = $1, 
           instagram_user_id = $2, 
           instagram_permissions = $3
       WHERE cafe24_mall_id = $4`,
      [access_token, user_id, data.permissions || '', mall_id]
    );

    return NextResponse.redirect(new URL(`/dashboard?mall_id=${mall_id}&state=${state}&success=true`, request.url));
  } catch (error) {
    console.error('Instagram 인증 처리 중 오류:', error);
    return NextResponse.redirect(new URL(`/dashboard?mall_id=${mall_id}&state=${state}&error=서버_오류`, request.url));
  }
}