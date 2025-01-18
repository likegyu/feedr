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
    } catch (_) {
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
      'SELECT insert_type FROM tokens WHERE cafe24_mall_id = $1',
      [mallId]
    );

    // 단순히 insert_type만 업데이트
    await client.query(
      `UPDATE tokens 
       SET insert_type = $1
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
