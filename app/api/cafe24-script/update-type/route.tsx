import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const mallId = cookieStore.get('cafe24_mall_id')?.value;
    const accessToken = cookieStore.get('cafe24_access_token')?.value;
    const body = await req.json();
    const { insertType } = body;

    if (!mallId || !accessToken) {
      return NextResponse.json(
        { error: '인증 정보가 없습니다.' },
        { status: 401 }
      );
    }

    if (!['auto', 'manual'].includes(insertType)) {
      return NextResponse.json(
        { error: '유효하지 않은 배포 방식입니다.' },
        { status: 400 }
      );
    }

    if (insertType === 'manual') {
      // 기존 스크립트 태그 확인 및 삭제
      const existingScript = await db.query(
        'SELECT script_tag_no FROM tokens WHERE cafe24_mall_id = $1',
        [mallId]
      );

      if (existingScript.rows[0]?.script_tag_no) {
        // 카페24 API로 스크립트 태그 삭제
        const deleteResponse = await fetch(
          `https://${mallId}.cafe24api.com/api/v2/admin/scripttags/${existingScript.rows[0].script_tag_no}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Cafe24-Api-Version': '2024-12-01'
            }
          }
        );

        if (!deleteResponse.ok) {
          console.warn('스크립트 태그 삭제 실패:', await deleteResponse.json());
        }
      }
    }

    // DB 업데이트
    await db.query(
      `UPDATE tokens 
       SET insert_type = $1,
           script_tag_no = CASE WHEN $1 = 'manual' THEN NULL ELSE script_tag_no END
       WHERE cafe24_mall_id = $2`,
      [insertType, mallId]
    );

    return NextResponse.json({ 
      success: true,
      message: `배포 방식이 ${insertType === 'manual' ? '수동' : '자동'}으로 변경되었습니다.`
    });

  } catch (error) {
    console.error('배포 방식 변경 중 오류:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}
