# Step 01: API 클라이언트 — localStorage 토큰 인증

> **브랜치:** `week1/step-01`
> **수정 파일:** `src/api/client.js`

---

## 학습 목표

- 모든 HTTP 요청이 거치는 **공통 클라이언트**가 왜 필요한지 이해한다.
- `localStorage`에서 JWT 토큰을 읽어 요청 헤더에 자동으로 추가하는 방법을 구현한다.
- 스프레드 연산자(`...`)와 단축 평가(`&&`)로 **조건부 헤더**를 추가하는 패턴을 익힌다.

---

## 핵심 개념 설명

### localStorage란?

브라우저가 제공하는 key-value 저장소로, 탭을 닫아도 데이터가 유지된다.

```js
localStorage.setItem('token', 'eyJhbGc...');  // 저장
localStorage.getItem('token');                 // 읽기 → 'eyJhbGc...'
localStorage.removeItem('token');              // 삭제
```

로그인 성공 시 서버에서 받은 JWT 토큰을 여기에 저장하고, 이후 모든 API 요청에서 꺼내 쓴다.

### JWT(Bearer Token) 인증 흐름

```
1. 로그인 → POST /users/login → 서버가 { token: 'eyJ...' } 반환
2. localStorage.setItem('token', token)  ← 저장
3. 이후 모든 API 요청: Authorization: Bearer eyJ...  ← 헤더에 자동 포함
4. 서버: 헤더 검증 → 통과하면 데이터 반환, 실패하면 401
```

### 조건부 헤더 패턴

```js
// token이 null이면 빈 객체 {} 가 스프레드됨 → 헤더 없음
// token이 있으면 { Authorization: 'Bearer ...' } 가 스프레드됨 → 헤더 추가
...(token && { Authorization: `Bearer ${token}` })
```

| `token` 값 | `token && {...}` 결과 | 헤더 포함 여부 |
|---|---|---|
| `null` | `null` (falsy → 스프레드 안 됨) | X |
| `'eyJhbGc...'` | `{ Authorization: 'Bearer eyJ...' }` | O |

---

## 구현

`src/api/client.js`에서 `// TODO` 2곳을 완성하세요.

**TODO 1:** localStorage에서 토큰 읽기

```js
// Before (현재 상태)
const token = null;

// After (구현 후)
const token = localStorage.getItem('token');
```

**TODO 2:** 토큰이 있을 때만 Authorization 헤더 추가

```js
// headers 객체 안에 추가
...(token && { Authorization: `Bearer ${token}` }),
```

---

## 주요 코드

```js
// src/api/client.js

const BASE_URL = "/api"; // Vite proxy: /api/* → localhost:8080/*

async function request(path, options = {}) {
  const token = localStorage.getItem('token'); // ← [실습 1] 완성 후

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }), // ← [실습 1] 완성 후
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API 오류" }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json();
}

export const get  = (path)       => request(path);
export const post = (path, body) => request(path, { method: "POST", body: JSON.stringify(body) });
```

**핵심 포인트:**
- `client.js`는 `auth.js`, `shop.js` 등 모든 API 함수가 공통으로 사용하는 **단일 진입점**이다.
- 토큰 처리 로직이 여기 한 곳에 있으므로, 나머지 파일들은 토큰을 신경 쓸 필요 없다.

---

## 전체 흐름

```
LoginForm → useAuth.login() → auth.js:loginWithUserId()
  → client.js:post('/users/login')          // 아직 token 없음 → 헤더 없이 전송
  → 서버 응답: { token: 'eyJ...' }
  → localStorage.setItem('token', token)    // 저장

ProductList → shop.js:searchProducts()
  → client.js:get('/shop/search?...')
  → localStorage.getItem('token')           // 꺼내서
  → Authorization: Bearer eyJ...            // 헤더에 담아 전송
  → 서버: 토큰 검증 통과 → 상품 목록 반환
```

---

## 확인할 것들

1. `localStorage.getItem('token')` 구현 전: 로그인 후 상품 목록 API 호출 시 **401 에러** 발생하는지 확인
2. 구현 후: 브라우저 개발자 도구 → Application → Local Storage → `token` 키 저장 확인
3. Network 탭 → `/api/shop/search` 요청 헤더에 `Authorization: Bearer ...` 포함되는지 확인

---

## 핵심 정리

> **공통 클라이언트(`client.js`)에 토큰 처리를 한 곳에 두면, 나머지 API 함수들은 토큰을 몰라도 된다. 이것이 관심사 분리(Separation of Concerns)의 핵심이다. Week 2(Next.js)에서는 이 토큰을 localStorage 대신 쿠키에 저장하고, 서버에서도 읽을 수 있게 한다.**
