// ~/app/api/auth/cafe24/store-name/route.tsx
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies()
  const cafe24AccessToken = cookieStore.get('cafe24_access_token')?.value

  if (!cafe24AccessToken) {
    return NextResponse.json({ 
      error: '카페24 액세스 토큰을 가져올 수 없습니다.' 
    }, { status: 400 });
  }

  try {
    // 스토어 ID 조회
    const query = `
      SELECT cafe24_mall_id
      FROM tokens
      WHERE cafe24_access_token = $1
      LIMIT 1
    `;
    const result = await db.query(query, [cafe24AccessToken]);
    const cafe24MallId = result.rows[0];

    if (!cafe24MallId) {
      return NextResponse.json({ 
        error: '스토어를 찾을 수 없거나 권한이 없습니다.' 
      }, { status: 404 });
    }

    // Cafe24 API 호출
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
      return NextResponse.json({ 
        error: '스토어 정보를 가져오는데 실패했습니다.' 
      }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ 
      data: { 
        cafe24ShopName: data.store.shop_name 
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: '서버 내부 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
