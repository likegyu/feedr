import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const cookieStore = await cookies()
  const cafe24MallId = cookieStore.get('cafe24_mall_id')?.value


  if (!code) {
    console.error('필수 파라미터 누락:', { code: !!code });
    return NextResponse.redirect(new URL('/dashboard?error=인증_정보_누락', request.url));
  }

  try {
    const formData = new FormData();
    formData.append('client_id', process.env.INSTAGRAM_CLIENT_ID!);
    formData.append('client_secret', process.env.INSTAGRAM_CLIENT_SECRET!);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', process.env.INSTAGRAM_REDIRECT_URI!);
    formData.append('code', code);

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: formData
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Instagram 인증 실패:', data);
      return NextResponse.redirect(new URL(`/dashboard?error=인증_실패`, request.url));
    }

    const { access_token, user_id } = data;

    // 단기 액세스 토큰을 장기 토큰으로 교환
    const longLivedTokenResponse = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${access_token}`);

    const longLivedTokenData = await longLivedTokenResponse.json();

    if (!longLivedTokenResponse.ok) {
      console.error('장기 토큰 교환 실패:', longLivedTokenData);
      return NextResponse.redirect(new URL(`/dashboard?error=토큰_교환_실패`, request.url));
    }

    // 데이터베이스 업데이트 (장기 토큰 사용)
    // Instagram API로 사용자 정보 가져오기
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=username&access_token=${longLivedTokenData.access_token}`
    );
    const userData = await userResponse.json();

    // DB 업데이트 쿼리 수정
    await db.query(
      `UPDATE tokens 
      SET instagram_access_token = $1, 
          instagram_user_id = $2,
          instagram_expires_in = $3,
          instagram_username = $4
      WHERE cafe24_mall_id = $5`,
      [
        longLivedTokenData.access_token,
        user_id,
        longLivedTokenData.expires_in,
        userData.username,
        cafe24MallId
      ]
    );

    return NextResponse.redirect(new URL(`/dashboard?success=true`, request.url));
  } catch (error) {
    console.error('Instagram 인증 처리 중 오류:', error);
    return NextResponse.redirect(new URL(`/dashboard?error=서버_오류`, request.url));
  }
}