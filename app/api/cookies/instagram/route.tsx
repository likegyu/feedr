import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const cafe24MallId = cookieStore.get('cafe24_mall_id')?.value

  return NextResponse.json({
    cafe24MallId: cafe24MallId || null
  })
}