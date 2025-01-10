import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');

  if (!state) {
    return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
  }

  try {
    const result = await db.query(
      'SELECT cafe24_expires_at FROM tokens WHERE cafe24_mall_id = $1',
      [state]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '토큰 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ expiresAt: result.rows[0].cafe24_expires_at });
  } catch (error) {
    console.error('토큰 조회 중 오류:', error);
    return NextResponse.json({ error: '토큰 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
