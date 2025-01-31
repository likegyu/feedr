import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  let response: NextResponse;

  // 루트 경로 리다이렉션
  if (request.nextUrl.pathname === "/") {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
    return response;
  }

  // 인스타그램 트래킹 API에만 CORS 적용
  if (request.nextUrl.pathname === "/api/instagram-tracks") {
    response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return response;
  }

  // 다른 경로는 기본 처리
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/instagram-tracks"],
};
