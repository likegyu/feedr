// ~/app/api/auth/cafe24/store-token/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const cafe24MallId = req.nextUrl.searchParams.get('mall_id');

  if (!cafe24MallId) {
    return NextResponse.json({ error: 'Mall ID is missing' }, { status: 400 });
  }

  const query = `
    SELECT 
      cafe24_access_token
    FROM 
      tokens
    WHERE 
      cafe24_mall_id = $1
  `;
  const cafe24AccessToken = await db.query(`${query} LIMIT 1`, [cafe24MallId]);

  try {

    if (!cafe24AccessToken.rows.length) {
      return NextResponse.json({ error: 'Mall not found or not authorized' }, { status: 404 });
    }

    const { cafe24_access_token } = cafe24AccessToken.rows[0];

    return NextResponse.json({ cafe24_access_token });
  } catch (error) {
    console.error('Error fetching access token from DB:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
