import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'

export async function GET() {
  console.log('[DEBUG] Token expires check API called');
  
  const cookieStore = await cookies()
  const cafe24ExpiresAt = cookieStore.get('cafe24_expires_at')?.value
  
  console.log('[DEBUG] cafe24ExpiresAt:', cafe24ExpiresAt);

  if (!cafe24ExpiresAt) {
    console.log('[DEBUG] No expiration time found');
    return NextResponse.json({ error: '토큰 만료 시간을 가져올 수 없습니다.' }, { status: 400 });
  }
  
  console.log('[DEBUG] Returning expiration time');
  return NextResponse.json({ data: { cafe24ExpiresAt } });
}
