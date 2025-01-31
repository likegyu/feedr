import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface TrackClickRequest {
  tracks: {
    mall_id: string;
    media_id: string;
    permalink: string;
    display_url: string;
    timestamp: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TrackClickRequest;
    const { mall_id, media_id, permalink, display_url } = body.tracks;

    // 검증
    if (!mall_id || !media_id || !permalink || !display_url) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const updateQuery = `
    UPDATE tokens 
    SET instagram_tracks = (
      SELECT COALESCE(
        jsonb_agg(
          CASE 
            WHEN track->>'media_id' = $2 THEN 
              jsonb_build_object(
                'media_id', $2,
                'permalink', $3,
                'display_url', $4,
                'clicks', (COALESCE((track->>'clicks')::int, 0) + 1),
                'clicked_at', NOW()::text
              )
            ELSE track 
          END
        ),
        '[]'::jsonb
      )
      FROM (
        SELECT track
        FROM jsonb_array_elements(COALESCE(instagram_tracks, '[]'::jsonb)) track
        WHERE (track->>'clicked_at')::timestamp > NOW() - INTERVAL '30 days'
      ) filtered
    ) || 
    CASE 
      WHEN NOT instagram_tracks @> jsonb_build_array(jsonb_build_object('media_id', $2))
      THEN jsonb_build_array(
        jsonb_build_object(
          'media_id', $2,
          'permalink', $3,
          'display_url', $4,
          'clicks', 1,
          'clicked_at', NOW()::text
        )
      )
      ELSE '[]'::jsonb
    END
    WHERE cafe24_mall_id = $1
    RETURNING true as success;
`;

    const result = await db.query(updateQuery, [
      mall_id,
      media_id,
      permalink,
      display_url,
    ]);

    // cafe24.js의 response.ok와 매칭되도록 응답
    return NextResponse.json({
      success: result.rows.length > 0,
    });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}
