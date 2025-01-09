import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const mallId = req.headers.get('mall-id');

  if (!code || !mallId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=invalid_request`);
  }

  try {
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
        code,
      }),
    });

    const { access_token, user_id } = await tokenResponse.json();
    const instagramToken = `instagram_${access_token}`;

    // DB에 토큰 저장
    await db.query(
      'INSERT INTO instagram_tokens (user_id, access_token, instagram_user_id) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET access_token = $2, instagram_user_id = $3',
      [mallId, instagramToken, user_id]
    );

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=instagram_connected`);
  } catch (error) {
    console.error('Instagram auth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=auth_failed`);
  }
}
