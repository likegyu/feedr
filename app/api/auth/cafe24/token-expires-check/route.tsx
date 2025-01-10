import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const cafe24ExpiresAt = cookieStore.get('cafe24_expires_at')?.value

  if (!cafe24ExpiresAt) {
    return NextResponse.json({ error: '토큰 만료 시간을 가져올 수 없습니다.' }, { status: 400 });
  }

  // ISO 시간을 Unix timestamp(초)로 변환
  const expiresInSeconds = Math.floor(new Date(cafe24ExpiresAt).getTime() / 1000);
  
  return NextResponse.json({ expiresIn: expiresInSeconds });
}
