import { NextResponse } from 'next/server';

export async function GET() {
  const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${
    process.env.INSTAGRAM_CLIENT_ID
  }&redirect_uri=${
    process.env.INSTAGRAM_REDIRECT_URI
  }&scope=instagram_business_basic&response_type=code`;

  return NextResponse.json({ url: authUrl });
}
