import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Pool } from 'pg';
import { db } from '@/lib/db';

interface UpdateTypeRequest {
  insertType: 'auto' | 'manual';
}

export async function POST(req: NextRequest) {
  const client = await (db as Pool).connect();
  
  try {
    const cookieStore = await cookies();
    const mallId = cookieStore.get('cafe24_mall_id')?.value;
    const accessToken = cookieStore.get('cafe24_access_token')?.value;
    
    if (!mallId || !accessToken) {
      return NextResponse.json(
        { success: false, error: '인증 정보가 없습니다.' },
        { status: 401 }
      );
    }

    let body: UpdateTypeRequest;
    try {
      const data = await req.json();
      if (!data || typeof data.insertType !== 'string' || !['auto', 'manual'].includes(data.insertType)) {
        return NextResponse.json(
          { success: false, error: '유효하지 않은 배포 방식입니다.' },
          { status: 400 }
        );
      }
      body = data as UpdateTypeRequest;
    } catch {
      return NextResponse.json(
        { success: false, error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE tokens 
       SET insert_type = $1
       WHERE cafe24_mall_id = $2
       RETURNING insert_type`,
      [body.insertType, mallId]
    );

    if (result.rowCount === 0) {
      throw new Error('데이터베이스 업데이트 실패');
    }

    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true,
      data: {
        insertType: body.insertType
      },
      message: `배포 방식이 ${body.insertType === 'manual' ? '수동' : '자동'}으로 변경되었습니다.`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database operation failed:', error);
    return NextResponse.json(
      { success: false, error: '데이터베이스 작업 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
