import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  console.log("[DEBUG] Token expires check API called");

  const cookieStore = await cookies();
  const encodedExpiresAt = cookieStore.get("cafe24_expires_at")?.value;

  console.log("[DEBUG] Encoded expiresAt:", encodedExpiresAt);

  if (!encodedExpiresAt) {
    console.log("[DEBUG] No expiration time found");
    return NextResponse.json(
      { error: "토큰 만료 시간을 가져올 수 없습니다." },
      { status: 400 }
    );
  }

  try {
    const cafe24ExpiresAt = decodeURIComponent(encodedExpiresAt);
    console.log("[DEBUG] Decoded expiresAt:", cafe24ExpiresAt);
    return NextResponse.json({ data: { cafe24ExpiresAt } });
  } catch (error) {
    console.error("[ERROR] Decoding failed:", error);
    return NextResponse.json(
      { error: "토큰 만료 시간 디코딩 실패" },
      { status: 400 }
    );
  }
}
