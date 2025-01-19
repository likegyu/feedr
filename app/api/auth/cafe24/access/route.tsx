// ~app/api/auth/cafe24/access/route.tsx
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.CAFE24_CLIENT_ID!;
  const redirectUri = encodeURIComponent(process.env.CAFE24_REDIRECT_URI!);
  const mallId = req.nextUrl.searchParams.get('mall_id');
  const authorizationUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${clientId}&state=${mallId}&redirect_uri=${redirectUri}&scope=mall.read_store,mall.read_application,mall.write_application,mall.read_design`;
  if (!clientId || !redirectUri || !mallId) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }
  // 카페24 인증 서버로 리디렉션
  return NextResponse.redirect(authorizationUrl);
}