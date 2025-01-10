// ~/app/api/auth/cafe24/store-name/route.tsx
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies()
  const cafe24AccessToken = cookieStore.get('cafe24_access_token')?.value

  if (!cafe24AccessToken) {
    return NextResponse.json({ error: '카페24 액세스 토큰을 가져올 수 없습니다.' }, { status: 400 });
  }
  try {
    const query = `
    SELECT 
      cafe24_mall_id
    FROM 
      tokens
    WHERE 
      cafe24_access_token = $1
  `;
  const cafe24MallId = (await db.query(`${query} LIMIT 1`, [cafe24AccessToken])).rows[0];

    if (!cafe24MallId) {
      return NextResponse.json({ error: 'Mall not found or not authorized' }, { status: 404 });
    }

    const { cafe24_mall_id } = cafe24MallId;
    const cafe24ApiUrl = `https://${cafe24_mall_id}.cafe24api.com/api/v2/admin/store?fields=shop_name&shop_no=1`;

    const response = await fetch(cafe24ApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cafe24AccessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch store name' }, { status: 500 });
    }
    const data = await response.json();
    return NextResponse.json({ cafe24_shop_name: data.store.shop_name });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
