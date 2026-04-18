import { get, post } from './client';

// 이름으로 유저 검색 → 첫 번째 결과 반환
export async function findUserByName(name) {
  // GET /users/search?name=홍길동
  const page = await get(`/users/search?name=${encodeURIComponent(name)}`);
  return page.content?.[0] ?? null;
}

// 회원가입: 이름과 이메일로 새 유저 생성
export async function signUp(name, email) {
  // ============================================================
  // [실습 2-a] POST /users 로 회원가입 요청을 보내세요
  //
  // 📝 해설:
  //   post()는 client.js에서 정의한 공통 함수로, 내부적으로 fetch를 사용합니다.
  //   첫 번째 인자: API 경로 '/users'
  //   두 번째 인자: 요청 body 객체 { name, email }
  //   → client.js에서 JSON.stringify(body)로 직렬화하여 전송합니다.
  //   서버는 생성된 유저 { id, name, email }를 반환하고,
  //   이 반환값이 useAuth.js의 foundUser 변수에 담깁니다.
  // ============================================================
  // TODO: POST /users 로 회원가입 요청을 보내세요
  // body: { name, email } → 반환값: { id, name, email }
}

// 로그인: userId로 JWT 토큰 발급
export async function loginWithUserId(userId) {
  // ============================================================
  // [실습 2-b] POST /users/login 으로 토큰을 발급받으세요
  //
  // 📝 해설:
  //   로그인은 서버에 userId를 보내면 JWT 토큰을 발급받는 방식입니다.
  //   반환값 { token }은 useAuth.js에서 구조 분해 할당으로 꺼내어
  //   localStorage.setItem('token', token)으로 저장됩니다.
  //   이후 모든 API 요청 시 client.js의 Authorization 헤더에 자동으로 포함됩니다.
  // ============================================================
  // TODO: POST /users/login 으로 토큰을 발급받으세요
  // body: { userId } → 반환값: { token }
}

// 내 정보 조회 (토큰 필요 - client.js에서 자동으로 헤더에 포함)
export async function getMe() {
  return get('/users/me');
}
