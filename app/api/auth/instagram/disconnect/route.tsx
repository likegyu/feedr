import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const cafe24MallId = cookieStore.get('cafe24_mall_id')?.value;
  const cafe24AccessToken = cookieStore.get('cafe24_access_token')?.value;
  
  if (!cafe24MallId || !cafe24AccessToken) {
    return NextResponse.json({ error: '인증 정보가 없습니다.' }, { status: 400 });
  }

  try {
    // 스크립트 태그 번호 조회
    const { rows } = await db.query(
      'SELECT script_tag_no FROM tokens WHERE cafe24_mall_id = $1',
      [cafe24MallId]
    );

    const scriptTagNo = rows[0]?.script_tag_no;

    if (scriptTagNo) {
      // Cafe24 API로 스크립트 태그 삭제
      const deleteResponse = await fetch(
        `https://${cafe24MallId}.cafe24api.com/api/v2/admin/scripttags/${scriptTagNo}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${cafe24AccessToken}`,
            'Content-Type': 'application/json',
            'X-Cafe24-Api-Version': '2024-12-01'
          }
        }
      );

      if (!deleteResponse.ok) {
        console.error('스크립트 태그 삭제 실패:', await deleteResponse.json());
      }
    }

    // DB에서 Instagram 정보와 스크립트 태그 정보 삭제
    await db.query(
      `UPDATE tokens
       SET instagram_access_token = NULL,
           instagram_user_id = NULL,
           instagram_expires_in = NULL,
           instagram_username = NULL,
           instagram_issued_at = NULL,
           script_tag_no = NULL
       WHERE cafe24_mall_id = $1`,
      [cafe24MallId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Instagram 연동 해제 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}