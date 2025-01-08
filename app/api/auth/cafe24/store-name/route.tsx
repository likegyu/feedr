// ~/app/api/auth/cafe24/store-name/route.tsx
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const mallId = req.nextUrl.searchParams.get('mall_id');
  const accessToken = req.nextUrl.searchParams.get('access_token');

  if (!mallId || !accessToken) {
    return NextResponse.json({ error: 'Mall ID or access token is missing' }, { status: 400 });
  }

  const url = `https://${mallId}.cafe24api.com/api/v2/admin/store?fields=shop_name&shop_no=1`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch store name' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data.store.shop_name);
  } catch (error) {
    console.error('Error fetching store name:', error);
    return NextResponse.json('Internal server error', { status: 500 });
  }
}