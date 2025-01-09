import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const mall_id = url.searchParams.get('state');
  const state = url.searchParams.get('state');
  console.log(request.url);

  if (!code || !mall_id) {
    console.error('필수 파라미터 누락:', { code: !!code, mall_id: !!mall_id });
    return NextResponse.redirect(new URL('/?error=인증_정보_누락', request.url));
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