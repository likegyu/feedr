import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mall_id = url.searchParams.get('state');

  if (!mall_id) {
    return NextResponse.json({ error: '몰 아이디가 필요합니다.' }, { status: 400 });
  }

  try {
    const result = await db.query(
      'SELECT instagram_access_token, instagram_user_id FROM tokens WHERE cafe24_mall_id = $1',
      [mall_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ isConnected: false });
    }

    const { instagram_access_token, instagram_user_id } = result.rows[0];
    return NextResponse.json({
      isConnected: !!instagram_access_token,
      userId: instagram_user_id
    });
  } catch (error) {
    console.error('Instagram 상태 확인 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
