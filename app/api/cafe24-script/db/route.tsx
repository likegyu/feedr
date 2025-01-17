import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // 요청 URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(req.url);
    const mallId = searchParams.get('mallId');

    if (!mallId) {
      return NextResponse.json({ error: 'mallId 파라미터가 필요합니다.' }, { status: 400 });
    }

    // DB 조회
    const query = `
      SELECT 
        pc_feed_settings,
        mobile_feed_settings,
        feed_filter,
        instagram_access_token
      FROM tokens
      WHERE cafe24_mall_id = $1
      LIMIT 1
    `;
    const { rows } = await db.query(query, [mallId]);

    // 결과 체크
    if (rows.length === 0) {
      return NextResponse.json({ error: '데이터가 없습니다.' }, { status: 404 });
    }

    const {
      pc_feed_settings,
      mobile_feed_settings,
      feed_filter,
      instagram_access_token
    } = rows[0];

    // 결과 응답
    return NextResponse.json({
      pc_feed_settings,
      mobile_feed_settings,
      feed_filter,
      instagram_access_token
    });
  } catch (error) {
    console.error('에러 발생:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}