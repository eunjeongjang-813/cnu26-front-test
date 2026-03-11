// Server Component 전용 인증 유틸리티
// 'use server' 없이도 server-only 코드로 동작
// (next/headers는 서버 환경에서만 사용 가능)

import { cookies } from 'next/headers';
import { getMe as fetchMe, type User } from './api';

// 현재 요청 쿠키에서 JWT 토큰 반환
export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

// 토큰으로 내 정보를 가져오는 서버 전용 함수
export async function getMe(token: string): Promise<User> {
  return fetchMe(token);
}
