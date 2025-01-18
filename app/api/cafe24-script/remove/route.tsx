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

    await client.query('BEGIN');

    const currentSetting = await client.query(
      'SELECT script_tag_no FROM tokens WHERE cafe24_mall_id = $1',
      [mallId]
    );

    if (currentSetting.rows[0]?.script_tag_no) {
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

      await client.query(
        'UPDATE tokens SET script_tag_no = NULL WHERE cafe24_mall_id = $1',
        [mallId]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ 
      success: true,
      message: '스크립트가 성공적으로 제거되었습니다.'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Script removal failed:', error);
    return NextResponse.json(
      { error: '스크립트 제거 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
