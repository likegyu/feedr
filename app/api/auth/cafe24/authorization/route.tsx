// ~app/api/auth/cafe24/authorization/route.tsx
import { NextRequest, NextResponse } from 'next/server';

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
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://cithmb.vercel.app',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch access token' }, { status: 500 });
  }

  const data = await response.json();

  // 액세스 토큰을 URL 파라미터로 리디렉션
  const redirectTo = `/token-display?access_token=${data.access_token}`;
  return NextResponse.redirect(redirectTo);
}