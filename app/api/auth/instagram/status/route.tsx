import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const mallId = cookieStore.get('cafe24_mall_id')?.value;

    if (!mallId) {
      return NextResponse.json({ error: '인증 정보가 없습니다.' }, { status: 401 });
    }

    const { rows } = await db.query(
      `SELECT instagram_username, script_tag_no, insert_type
       FROM tokens 
       WHERE cafe24_mall_id = $1`,
      [mallId]
    );

    const status = {
      isConnected: !!rows[0]?.instagram_username,
      userName: rows[0]?.instagram_username || undefined,
      hasScriptTag: !!rows[0]?.script_tag_no,
      insertType: rows[0]?.insert_type || 'auto'
    };

    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ isConnected: false, error: error.message });
    }
    return NextResponse.json({ isConnected: false, error: 'An unknown error occurred' });
  }
}
