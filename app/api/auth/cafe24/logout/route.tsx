import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  
  // 쿠키 삭제
  cookieStore.delete('cafe24_mall_id');
  cookieStore.delete('cafe24_access_token');
  cookieStore.delete('cafe24_expires_at');

  return NextResponse.json(
    { message: '로그아웃 성공' },
    { status: 200 }
  );
}