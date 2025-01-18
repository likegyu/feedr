import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const mallId = cookieStore.get('cafe24_mall_id')?.value;

    if (!mallId) {
      return NextResponse.json({ isConnected: false });
    }

    const result = await db.query(
      `SELECT instagram_username, script_tag_no, insert_type 
       FROM tokens 
       WHERE cafe24_mall_id = $1`,
      [mallId]
    );

    const user = result.rows[0];
    
    return NextResponse.json({
      isConnected: !!user?.instagram_username,
      userName: user?.instagram_username,
      hasScriptTag: !!user?.script_tag_no,
      insertType: user?.insert_type || 'manual'
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ isConnected: false, error: error.message });
    }
    return NextResponse.json({ isConnected: false, error: 'An unknown error occurred' });
  }
}
