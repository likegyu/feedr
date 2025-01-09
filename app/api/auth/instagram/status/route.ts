import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    const mallId = req.headers.get('mall-id');
    if (!mallId) return NextResponse.json({ isConnected: false });
  
    try {
      const result = await db.query(
        `SELECT access_token 
         FROM instagram_tokens 
         WHERE user_id = $1 
         AND access_token LIKE 'instagram_%'`, 
        [mallId]
      );
  
      return NextResponse.json({ 
        isConnected: result.rowCount > 0 
      });
    } catch (error) {
      console.error('Error checking Instagram connection status:', error);
      return NextResponse.json({ isConnected: false });
    }
}
