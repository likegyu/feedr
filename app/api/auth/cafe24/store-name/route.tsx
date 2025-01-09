// ~/app/api/auth/cafe24/store-name/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const cafe24MallId = req.nextUrl.searchParams.get('mall_id');

  if (!cafe24MallId) {
    return NextResponse.json({ error: 'Mall ID is missing' }, { status: 400 });
  }

  try {
    // DB에서 access_token 조회
    const tokenResult = await db.query('SELECT cafe24_access_token FROM tokens WHERE cafe24_mall_id = $1', [cafe24MallId]);

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'Mall not found or not authorized' }, { status: 404 });
    }

    const { cafe24_access_token } = tokenResult.rows[0];
    const url = `https://${mallId}.cafe24api.com/api/v2/admin/store?fields=shop_name&shop_no=1`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cafe24_access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch store name' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data.store.shop_name);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}