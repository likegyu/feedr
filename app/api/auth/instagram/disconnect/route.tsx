import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const mall_id = url.searchParams.get('state');

  if (!mall_id) {
    console.error('Mall ID is missing');
    return NextResponse.json({ error: 'Mall ID is required.' }, { status: 400 });
  }
  try {
    await db.query(
      `UPDATE users
          SET instagram_user_id = NULL,
              instagram_expires_in = NULL,
              instagram_username = NULL
          WHERE cafe24_mall_id = $1`,
      [mall_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instagram 연동 해제 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
