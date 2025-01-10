// ~/app/api/auth/cafe24/store-name/route.tsx
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies()
  const cafe24AccessToken = cookieStore.get('cafe24_access_token')?.value
  console.log('Access Token:', cafe24AccessToken ? 'exists' : 'missing');

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
    console.log('Executing DB query with token:', cafe24AccessToken.substring(0, 10) + '...');
    const result = await db.query(query, [cafe24AccessToken]);
    console.log('DB Query result:', result.rows);

    const cafe24MallId = result.rows[0];
    if (!cafe24MallId) {
      console.log('No mall ID found in database');
      return NextResponse.json({ 
        error: '스토어를 찾을 수 없거나 권한이 없습니다.' 
      }, { status: 404 });
    }

    // Cafe24 API 호출
    const { cafe24_mall_id } = cafe24MallId;
    const cafe24ApiUrl = `https://${cafe24_mall_id}.cafe24api.com/api/v2/admin/store?fields=shop_name&shop_no=1`;
    console.log('Calling Cafe24 API:', cafe24ApiUrl);

    const response = await fetch(cafe24ApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cafe24AccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Cafe24 API response status:', response.status);
    if (!response.ok) {
      console.log('Cafe24 API error response:', await response.text());
      return NextResponse.json({ 
        error: '스토어 정보를 가져오는데 실패했습니다.' 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('Cafe24 API response data:', data);
    
    return NextResponse.json({ 
      data: { 
        cafe24ShopName: data.store.shop_name 
      }
    });

  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json({ 
      error: '서버 내부 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
