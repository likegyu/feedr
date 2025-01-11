import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies()
  const cafe24MallId = cookieStore.get('cafe24_mall_id')?.value
  if (!cafe24MallId) {
    return NextResponse.json({ error: '몰 아이디가 필요합니다.' }, { status: 400 });
  }

  try {
    const result = await db.query(
      'SELECT instagram_access_token, instagram_username FROM tokens WHERE cafe24_mall_id = $1',
      [cafe24MallId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ isConnected: false });
    }

    const { instagram_access_token, instagram_username } = result.rows[0];
    return NextResponse.json({
      isConnected: !!instagram_access_token,
      userName: instagram_username
    });
  } catch (error) {
    console.error('Instagram 상태 확인 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
