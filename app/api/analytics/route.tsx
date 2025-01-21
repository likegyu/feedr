import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // 쿠키 이름을 'cafe24_mall_id'로 수정
    const cookieStore = await cookies();
    const mallId = cookieStore.get('cafe24_mall_id')?.value;

    if (!mallId) {
      return NextResponse.json(
        { success: false, error: '스토어 정보를 찾을 수 없습니다.' },
        { status: 401 }
      );
    }

    // 최근 30일 클릭 데이터 조회
    const query = `
      SELECT instagram_tracks::jsonb 
      FROM tokens 
      WHERE cafe24_mall_id = $1
    `;

    const result = await db.query(query, [mallId]);
    
    if (!result.rows.length) {
      return NextResponse.json({ 
        success: true,
        data: [] 
      });
    }

    const tracks = typeof result.rows[0].instagram_tracks === 'string' 
      ? JSON.parse(result.rows[0].instagram_tracks)
      : (result.rows[0].instagram_tracks || []);

    // 30일이 지난 데이터는 필터링
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filteredTracks = tracks.filter((track: any) => {
      const clickedAt = new Date(track.clicked_at);
      return clickedAt >= thirtyDaysAgo;
    });

    return NextResponse.json({
      success: true,
      data: filteredTracks
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '데이터를 불러오는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
