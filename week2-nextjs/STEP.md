# Step 01: 쿠키에서 JWT 토큰 읽기

> **브랜치:** `week2/step-01`
> **수정 파일:** `lib/auth.ts`

---

## 학습 목표

- Next.js App Router에서 서버 컴포넌트가 쿠키를 읽는 방법을 이해한다.
- `next/headers`의 `cookies()` API 사용법을 익힌다.
- Week 1의 `localStorage` 방식과 무엇이 다른지 비교한다.

---

## 핵심 개념 설명

### 왜 localStorage 대신 쿠키인가?

| 항목 | Week 1 (localStorage) | Week 2 (쿠키) |
|---|---|---|
| 접근 위치 | 브라우저(클라이언트)만 | 브라우저 + 서버 모두 |
| 서버 인증 | 불가 | 가능 (요청마다 자동 전송) |
| 미들웨어 사용 | 불가 | 가능 |
| XSS 취약점 | 토큰 탈취 가능 | `HttpOnly` 설정으로 방어 가능 |

Next.js에서는 **서버 컴포넌트와 미들웨어(proxy.ts)가 쿠키를 읽어야** 하기 때문에 쿠키를 사용한다.

### next/headers의 cookies()

```ts
import { cookies } from 'next/headers';

const cookieStore = await cookies();
const token = cookieStore.get('token')?.value;
//                                   ↑
//                           없으면 undefined 반환 (optional chaining)
```

- **서버 전용 API**: 클라이언트 컴포넌트에서는 사용 불가
- `await cookies()`: Next.js 15+에서 비동기로 변경됨

---

## 프로젝트 구조

```
week2-nextjs/
├── proxy.ts              미들웨어 (라우트 보호)
├── lib/
│   ├── auth.ts           📝 이번 Step — 서버 쿠키 인증 헬퍼
│   ├── auth-server.ts    서버 전용 인증 (auth.ts와 동일 역할, 최신 버전)
│   └── api.ts            BE API 호출 함수
├── app/
│   ├── login/page.tsx    로그인 페이지
│   ├── shop/page.tsx     상품 목록 페이지
│   ├── cart/page.tsx     장바구니 페이지
│   └── orders/page.tsx   주문 목록 페이지
└── components/
    └── AddToCartButton.tsx
```

---

## 주요 코드

```ts
// lib/auth.ts

import { cookies } from 'next/headers';

export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value; // ← [실습 1] 완성 후
}

export async function requireAuth(): Promise<string> {
  const token = await getTokenFromCookie();
  if (!token) throw new Error('인증이 필요합니다');
  return token;
}
```

---

## 프로젝트 실행법

```bash
cd week2-nextjs
cp .env.local.example .env.local   # 최초 1회 (BACKEND_URL 설정)
npm install                         # 최초 1회
npm run dev                         # 개발 서버 시작
```

브라우저에서 `http://localhost:3000` 접속.

> Next.js는 기본 포트가 3000이다. 백엔드(`localhost:8080`)도 실행 중이어야 한다.

---

## 확인할 것들

1. **구현 전:** `/shop` 접속 시 인증 체크가 제대로 동작하지 않는지 확인
2. **구현 후:** 로그인 → 브라우저 개발자 도구 → Application → Cookies → `token` 쿠키 저장 확인
3. **서버 로그:** `getTokenFromCookie()` 호출 시 터미널에서 토큰 값 출력되는지 확인
4. **비교:** Week 1의 `localStorage.getItem('token')`과 코드 구조가 얼마나 유사한지 비교

---

## 핵심 정리

> **서버 컴포넌트는 `next/headers`의 `cookies()`로 쿠키를 직접 읽을 수 있다. `localStorage`는 브라우저에만 존재하지만, 쿠키는 HTTP 요청마다 서버로 자동 전송되어 서버에서도 인증이 가능하다. 이것이 Next.js에서 쿠키를 사용하는 핵심 이유다.**
