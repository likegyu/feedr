import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Pool } from 'pg';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const client = await (db as Pool).connect();
  
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

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    const { insertType } = body;

    if (!insertType || !['auto', 'manual'].includes(insertType)) {
      return NextResponse.json(
        { error: '유효하지 않은 배포 방식입니다.' },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query('BEGIN');

    // 현재 설정된 insert_type 확인
    const currentSetting = await client.query(
      'SELECT insert_type, script_tag_no FROM tokens WHERE cafe24_mall_id = $1',
      [mallId]
    );

    if (insertType === 'manual' && 
        currentSetting.rows[0]?.insert_type === 'auto' && 
        currentSetting.rows[0]?.script_tag_no) {
      // auto -> manual 전환 시 스크립트 삭제
      try {
        const deleteResponse = await fetch(
          `https://${mallId}.cafe24api.com/api/v2/admin/scripttags/${currentSetting.rows[0].script_tag_no}`,
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
          throw new Error('Failed to delete script tag');
        }
      } catch (error) {
        console.error('스크립트 태그 삭제 실패:', error);
        // Continue even if script tag deletion fails
      }
    } else if (insertType === 'auto' && 
              currentSetting.rows[0]?.insert_type === 'manual') {
      // manual -> auto 전환 시 스크립트 재배포
      try {
        const deployResponse = await fetch(
          `https://${mallId}.cafe24api.com/api/v2/admin/scripttags`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Cafe24-Api-Version': '2024-12-01'
            },
            body: JSON.stringify({
              shop_no: 1,
              request: {
                script_tag: {
                  src: 'https://cithmb.vercel.app/cafe24-script.js',
                  display_location: 'all',
                  enabled: 'T'
                }
              }
            })
          }
        );

        if (!deployResponse.ok) {
          throw new Error('Failed to deploy script tag');
        }

        const deployData = await deployResponse.json();
        const scriptTagNo = deployData.response.script_tag.script_no;

        // 스크립트 태그 번호 업데이트
        await client.query(
          'UPDATE tokens SET script_tag_no = $1 WHERE cafe24_mall_id = $2',
          [scriptTagNo, mallId]
        );
      } catch (error) {
        console.error('스크립트 태그 배포 실패:', error);
        throw error;
      }
    }

    await client.query(
      `UPDATE tokens 
       SET insert_type = $1,
           script_tag_no = CASE WHEN $1 = 'manual' THEN NULL ELSE script_tag_no END
       WHERE cafe24_mall_id = $2`,
      [insertType, mallId]
    );

    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true,
      message: `배포 방식이 ${insertType === 'manual' ? '수동' : '자동'}으로 변경되었습니다.`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database operation failed:', error);
    return NextResponse.json(
      { error: '데이터베이스 작업 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
