import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cafe24MallId = cookieStore.get('cafe24_mall_id')?.value;
    
    if (!cafe24MallId) {
      return NextResponse.json({ error: '몰 아이디가 필요합니다.' }, { status: 400 });
    }

    const body = await request.json();
    const { type, settings } = body;

    // type: 'pc' | 'mobile'
    const columnName = type === 'pc' ? 'pc_feed_settings' : 'mobile_feed_settings';
    
    const result = await db.query(
      `UPDATE tokens 
       SET ${columnName} = $1 
       WHERE cafe24_mall_id = $2 
       RETURNING ${columnName}`,
      [JSON.stringify(settings), cafe24MallId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: '설정 저장에 실패했습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      message: '설정이 저장되었습니다.',
      settings: result.rows[0][columnName]
    });

  } catch (error) {
    console.error('설정 저장 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mallId = searchParams.get('mallId');
  try {
    
    if (!mallId) {
      return NextResponse.json(
        { error: '몰 아이디가 필요합니다.' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': `https://${mallId}.cafe24.com`,
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Credentials': 'true'
          }
        }
      );
    }

    const result = await db.query(
      `SELECT 
        pc_feed_settings,
        mobile_feed_settings,
        feed_filter,
        instagram_access_token
      FROM tokens 
      WHERE cafe24_mall_id = $1`,
      [mallId]
    );

    return NextResponse.json(result.rows[0] || {}, {
      headers: {
        'Access-Control-Allow-Origin': `https://${mallId}.cafe24.com`,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true'
      }
    });

  } catch (error) {
    console.error('피드 설정 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': `https://${mallId}.cafe24.com`,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*.cafe24.com',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
