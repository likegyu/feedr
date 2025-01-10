import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');

  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${
    process.env.INSTAGRAM_CLIENT_ID
  }&redirect_uri=${
    process.env.INSTAGRAM_REDIRECT_URI
  }&state=${state}&scope=instagram_business_basic&response_type=code`;

  return NextResponse.json({ url: authUrl });
}
