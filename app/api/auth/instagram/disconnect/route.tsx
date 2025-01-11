import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const cafe24MallId = cookieStore.get('cafe24_mall_id')?.value
  
  if (!cafe24MallId) {
    return NextResponse.json({ error: 'Mall ID not found' }, { status: 400 });
  }

  try {
    await db.query(
      `UPDATE tokens
          SET instagram_access_token = NULL,
              instagram_user_id = NULL,
              instagram_expires_in = NULL,
              instagram_username = NULL
          WHERE cafe24_mall_id = $1`,
      [cafe24MallId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instagram 연동 해제 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}