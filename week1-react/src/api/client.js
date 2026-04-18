// 모든 API 요청이 거치는 공통 클라이언트
// Vite proxy 설정으로 /api/* → http://localhost:8080/* 으로 전달됨
const BASE_URL = '/api';

async function request(path, options = {}) {
  // ============================================================
  // [실습 1] localStorage에서 토큰을 읽어오세요
  // 힌트: localStorage.getItem('token')
  //
  // ✅ 모범 정답:
  //   const token = localStorage.getItem('token');
  //
  // 📝 해설:
  //   localStorage는 브라우저에 key-value 형태로 데이터를 영구 저장하는 Web API입니다.
  //   getItem('token')으로 이전에 저장한 JWT 토큰을 읽어옵니다.
  //   토큰이 없으면 null을 반환하며, 이 경우 Authorization 헤더를 보내지 않습니다.
  //   초기값을 null로 두면 토큰 없이도 API 요청이 가능하지만,
  //   인증이 필요한 엔드포인트(/users/me 등)는 서버에서 401 에러를 반환합니다.
  // ============================================================
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    // 토큰이 있을 때만 Authorization 헤더 추가
    // 힌트: 스프레드 연산자와 단축 평가(&&)를 활용하세요
    //
    // ✅ 모범 정답 (아래 주석을 해제하세요):
    //   ...(token && { Authorization: `Bearer ${token}` }),
    //
    // 📝 해설:
    //   token && { Authorization: `Bearer ${token}` }
    //   → token이 null/undefined/'' 이면 false로 평가되어 아무것도 스프레드되지 않음
    //   → token이 있으면 { Authorization: 'Bearer xxx' } 객체가 스프레드되어 헤더에 추가됨
    //   이 패턴으로 토큰 유무에 따라 조건부로 헤더를 추가할 수 있습니다.
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API 오류' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json();
}

export const get = (path) => request(path);

export const post = (path, body) =>
  request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
