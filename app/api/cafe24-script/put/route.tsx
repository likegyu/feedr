import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function PUT() {
  try {
    const cookieStore = await cookies();
    const mallId = cookieStore.get('cafe24_mall_id')?.value;
    const accessToken = cookieStore.get('cafe24_access_token')?.value;

    if (!mallId || !accessToken) {
      return NextResponse.json(
        { error: '인증 정보가 없습니다.' },
        { status: 401 }
      );
    }

    // PC 테마 정보 조회
    const themeResponse = await fetch(
      `https://${mallId}.cafe24api.com/api/v2/admin/themes?type=pc&fields=skin_no`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': '2024-12-01'
        }
      }
    );

    if (!themeResponse.ok) {
      return NextResponse.json(
        { error: '테마 정보 조회 실패' },
        { status: themeResponse.status }
      );
    }

    const themeData = await themeResponse.json();
    const currentSkinNo = themeData.themes[0].skin_no;

    // DB에서 script_no 조회
    const { rows } = await db.query(
      'SELECT script_tag_no FROM tokens WHERE cafe24_mall_id = $1',
      [mallId]
    );

    if (rows.length === 0 || !rows[0].script_tag_no) {
      return NextResponse.json(
        { error: '스크립트 태그 정보가 없습니다.' },
        { status: 404 }
      );
    }

    const script_no = rows[0].script_tag_no;

    const scriptTagData = {
      shop_no: 1,
      request: {
        display_location: ['MAIN'],
        src: `${process.env.APP_URL}/cafe24-script.js`,
        skin_no: [currentSkinNo] // 현재 사용중인 스킨만 적용
      }
    };

    const response = await fetch(
      `https://${mallId}.cafe24api.com/api/v2/admin/scripttags/${script_no}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': '2024-12-01'
        },
        body: JSON.stringify(scriptTagData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: '스크립트 태그 수정 실패', details: error },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('스크립트 태그 API 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
}