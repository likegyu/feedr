// ~/app/api/auth/cafe24/store-name/route.tsx
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const mallId = req.nextUrl.searchParams.get('mall_id');
  const accessToken = req.nextUrl.searchParams.get('access_token');

  if (!mallId || !accessToken) {
    return NextResponse.json({ error: 'Mall ID or access token is missing' }, { status: 400 });
  }

  const url = `https://${mallId}.cafe24api.com/api/v2/admin/store?fields=shop_name&shop_no=1`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  const rawData = await response.text(); // 먼저 raw text로 받아봄
  console.log('Fetched store data (raw):', rawData); // 콘솔에 raw 응답 출력
  
  try {
    const data = JSON.parse(rawData); // JSON 파싱 시도
    console.log('Parsed store data:', data);
  
    if (!data.shop_name) {
      return NextResponse.json({ error: 'Shop name not found in response' }, { status: 500 });
    }
  
    return NextResponse.json({ shop_name: data.shop_name });
  } catch (error) {
    console.error('Error parsing store data:', error);
    return NextResponse.json({ error: 'Failed to parse store data' }, { status: 500 });
  }
}