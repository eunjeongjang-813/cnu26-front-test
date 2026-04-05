import { cookies } from 'next/headers';

// ============================================================
// [실습 1] 쿠키에서 JWT 토큰을 읽어오는 함수를 구현하세요
//
// Next.js App Router에서 서버 컴포넌트는 쿠키를 직접 읽을 수 있습니다.
// import { cookies } from 'next/headers' 사용
// ============================================================

// 서버 컴포넌트에서 사용: 현재 요청의 쿠키에서 token을 반환
export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value; // TODO: 직접 구현해보세요
}

// 서버 컴포넌트에서 사용: token이 없으면 undefined 반환
export async function requireAuth(): Promise<string> {
  const token = await getTokenFromCookie();
  if (!token) {
    // middleware에서 이미 걸러지지만, 방어적으로 처리
    throw new Error('인증이 필요합니다');
  }
  return token;
}
