import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// [Next.js 16 변경사항] middleware.ts → proxy.ts
//   - 파일명: middleware.ts → proxy.ts
//   - export 함수명: middleware → proxy
//
// [실습 2] 프록시: 인증되지 않은 사용자를 /login으로 리다이렉트
//
// 흐름:
// 1. 요청 쿠키에서 'token'을 읽는다
// 2. /login 페이지인지 확인한다
// 3. 토큰 없이 보호된 페이지 접근 → /login 으로 리다이렉트
// 4. 토큰 있는데 /login 접근 → /shop 으로 리다이렉트
// ============================================================

export function proxy(request: NextRequest) {
  // TODO [실습 2-a]: request.cookies.get('token')?.value 로 토큰을 읽어오세요
  const token = undefined;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/login';

  // TODO [실습 2-b]: 토큰이 없고, 로그인 페이지가 아닌 경우 → /login 으로 리다이렉트
  // NextResponse.redirect(new URL('/login', request.url))

  // TODO [실습 2-c]: 토큰이 있는데 /login 에 접근한 경우 → /shop 으로 리다이렉트
  // NextResponse.redirect(new URL('/shop', request.url))

  return NextResponse.next();
}

export const config = {
  matcher: ['/shop/:path*', '/cart/:path*', '/orders/:path*', '/login'],
};
