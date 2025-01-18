import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const mallId = cookieStore.get('cafe24_mall_id')?.value;

    if (!mallId) {
      return NextResponse.json({ isConnected: false });
    }

    const result = await db.query(
      'SELECT instagram_access_token, instagram_username, script_tag_no FROM tokens WHERE cafe24_mall_id = $1',
      [mallId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ isConnected: false });
    }

    const { instagram_access_token, instagram_username, script_tag_no } = result.rows[0];
    return NextResponse.json({
      isConnected: !!instagram_access_token,
      userName: instagram_username,
      hasScriptTag: !!script_tag_no
    });
  } catch (error) {
    console.error('Instagram 상태 확인 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
