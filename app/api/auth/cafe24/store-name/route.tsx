// ~/app/api/auth/cafe24/store-name/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const mallId = req.nextUrl.searchParams.get('mall_id');

  if (!mallId) {
    return NextResponse.json({ error: 'Mall ID is missing' }, { status: 400 });
  }

  try {
    // DB에서 access_token 조회
    const tokenResult = await db.query('SELECT access_token FROM tokens WHERE mall_id = $1', [mallId]);

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ error: 'Mall not found or not authorized' }, { status: 404 });
    }

    const { access_token } = tokenResult.rows[0];
    const url = `https://${mallId}.cafe24api.com/api/v2/admin/store?fields=shop_name&shop_no=1`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
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