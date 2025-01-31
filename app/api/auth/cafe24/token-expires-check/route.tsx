import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cafe24ExpiresAt = cookieStore.get("cafe24_expires_at")?.value;

    if (!cafe24ExpiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: "토큰 만료 시간을 가져올 수 없습니다.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { cafe24ExpiresAt },
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error:
          e instanceof Error ? e.message : "토큰 확인 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
