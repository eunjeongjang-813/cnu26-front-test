import { get, post } from './client';

// 이름으로 유저 조회 — 없으면 null 반환
export async function findUserByName(name) {
  try {
    const page = await get(`/users/search?name=${encodeURIComponent(name)}`);
    return page.content?.[0] ?? null;
  } catch {
    return null;
  }
}

// 회원가입: 이름과 이메일로 새 유저 생성
export async function signUp(name, email) {
  // ============================================================
  // [실습 2-a] POST /users 로 회원가입 요청을 보내세요
  // body: { name, email }
  // 반환값: { id, name, email }
  //
  // ✅ 모범 정답:
  //   return post('/users', { name, email });
  // ============================================================
  return post('/users', { name, email });
}

// 로그인: userId로 JWT 토큰 발급
export async function loginWithUserId(userId) {
  // ============================================================
  // [실습 2-b] POST /users/login 으로 토큰을 발급받으세요
  // body: { userId }
  // 반환값: { token }
  //
  // ✅ 모범 정답:
  //   return post('/users/login', { userId });
  // ============================================================
  return post('/users/login', { userId });
}

// 내 정보 조회 (토큰 필요 - client.js에서 자동으로 헤더에 포함)
export async function getMe() {
  return get('/users/me');
}
