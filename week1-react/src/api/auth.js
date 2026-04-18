import { get, post } from './client';

// 이름으로 유저 검색 → 첫 번째 결과 반환
export async function findUserByName(name) {
  // GET /users/search?name=홍길동
  const page = await get(`/users/search?name=${encodeURIComponent(name)}`);
  return page.content?.[0] ?? null;
}

// 회원가입: 이름과 이메일로 새 유저 생성
export async function signUp(name, email) {

}

// 로그인: userId로 JWT 토큰 발급
export async function loginWithUserId(userId) {

}

// 내 정보 조회 (토큰 필요 - client.js에서 자동으로 헤더에 포함)
export async function getMe() {
  return get('/users/me');
}
