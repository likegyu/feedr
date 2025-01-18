import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
        instagram_access_token,
        insert_type
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
