import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const mallId = req.nextUrl.searchParams.get('mall_id');

  if (!mallId) {
    return NextResponse.json({ error: 'Mall ID is missing' }, { status: 400 });
  }

  const query = `
    SELECT access_token
    FROM tokens
    WHERE mall_id = $1
  `;

  try {
    const result = await db.query(query, [mallId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Mall not found or not authorized' }, { status: 404 });
    }

    const { access_token } = result.rows[0];

    return NextResponse.json({ access_token });
  } catch (error) {
    console.error('Error fetching access token from DB:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
