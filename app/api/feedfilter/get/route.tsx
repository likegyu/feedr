import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cafe24MallId = cookieStore.get('cafe24_mall_id')?.value;

    if (!cafe24MallId) {
      return NextResponse.json({ error: 'Mall ID not found' }, { status: 400 });
    }

    const { rows } = await db.query(
      'SELECT feed_filter FROM tokens WHERE cafe24_mall_id = $1',
      [cafe24MallId]
    );
    const user = rows[0];

    return NextResponse.json({ 
      filter: user?.feed_filter || 'all' 
    });
  } catch (error) {
    console.error('피드 필터 조회 실패:', error);
    return NextResponse.json(
      { error: '피드 필터 조회에 실패했습니다.' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cafe24MallId = cookieStore.get('cafe24_mall_id')?.value;

    if (!cafe24MallId) {
      return NextResponse.json({ error: 'Mall ID not found' }, { status: 400 });
    }

    const { filter } = await request.json();

    if (!['all', 'image', 'video'].includes(filter)) {
      return NextResponse.json(
        { error: '유효하지 않은 필터 값입니다.' }, 
        { status: 400 }
      );
    }

    await db.query(
      'UPDATE tokens SET feed_filter = $1 WHERE cafe24_mall_id = $2',
      [filter, cafe24MallId]
    );

    return NextResponse.json({ filter });
  } catch (error) {
    console.error('피드 필터 수정 실패:', error);
    return NextResponse.json(
      { error: '피드 필터 수정에 실패했습니다.' }, 
      { status: 500 }
    );
  }
}
