import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface InstagramStatus {
  isConnected: boolean;
  userName?: string;
  hasScriptTag: boolean;
  insertType: "auto" | "manual";
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const mallId = cookieStore.get("cafe24_mall_id")?.value;

    if (!mallId) {
      return NextResponse.json(
        {
          success: false,
          error: "인증 정보가 없습니다.",
        },
        { status: 401 }
      );
    }

    const { rows } = await db.query(
      `SELECT instagram_username, script_tag_no, insert_type
       FROM tokens 
       WHERE cafe24_mall_id = $1`,
      [mallId]
    );

    const status: InstagramStatus = {
      isConnected: !!rows[0]?.instagram_username,
      userName: rows[0]?.instagram_username || undefined,
      hasScriptTag: !!rows[0]?.script_tag_no,
      insertType: rows[0]?.insert_type || "auto",
    };

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
