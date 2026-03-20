# Step 02: 미들웨어 (proxy.ts) — 라우트 보호

> **브랜치:** `week2/step-02`
> **수정 파일:** `proxy.ts`

---

## 학습 목표

- Next.js 미들웨어로 인증된 사용자만 특정 페이지에 접근하게 하는 방법을 이해한다.
- `NextResponse.redirect()`로 서버 측 리다이렉트를 구현한다.
- `matcher` 설정으로 미들웨어가 실행될 경로를 제어하는 방법을 익힌다.

---

## 핵심 개념 설명

### 왜 미들웨어가 필요한가?

클라이언트에서 인증을 체크하면 잠깐이라도 보호된 페이지가 보일 수 있다. 미들웨어는 **요청이 페이지에 도달하기 전에** 서버에서 실행되어 이 문제를 근본적으로 차단한다.

```
브라우저 요청 → proxy.ts 실행 → 토큰 확인
  → 없음: /login 리다이렉트 (페이지 렌더링 없음)
  → 있음: 요청 통과 → 페이지 렌더링
```

### Next.js 16의 변경사항

| Next.js 15 이하 | Next.js 16 |
|---|---|
| `middleware.ts` | `proxy.ts` |
| `export function middleware` | `export function proxy` |

동작 방식은 동일하다.

### matcher 설정

```ts
export const config = {
  matcher: ['/shop/:path*', '/cart/:path*', '/orders/:path*', '/login'],
};
```

이 경로들만 미들웨어가 실행된다. `/`(홈), `/_next/*`(정적 자산) 등은 실행되지 않는다.

---

## 프로젝트 구조

```
week2-nextjs/
├── proxy.ts              📝 이번 Step — 인증 미들웨어
├── lib/
│   ├── auth.ts           ✅ Step 01 완성
│   └── api.ts
├── app/
│   ├── login/page.tsx
│   ├── shop/page.tsx
│   └── orders/page.tsx
└── components/
```

---

## 주요 코드

```ts
// proxy.ts

import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // ← [실습 2-a]
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/login';

  // 미인증 + 보호된 페이지 → /login 리다이렉트
  if (!token && !isLoginPage) {                      // ← [실습 2-b]
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 인증됨 + /login 접근 → /shop 리다이렉트
  if (token && isLoginPage) {                        // ← [실습 2-c]
    return NextResponse.redirect(new URL('/shop', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/shop/:path*', '/cart/:path*', '/orders/:path*', '/login'],
};
```

---

## 프로젝트 실행법

```bash
cd week2-nextjs
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

---

## 확인할 것들

1. **구현 전:** `/shop`에 직접 접속해도 리다이렉트 없이 페이지가 열리는지 확인
2. **구현 후:** 로그아웃 상태에서 `/shop` 직접 입력 → `/login`으로 이동 확인
3. **구현 후:** 로그인 상태에서 `/login` 직접 입력 → `/shop`으로 이동 확인
4. **matcher 테스트:** `/`(홈) 접속 시 미들웨어가 실행되지 않음을 확인

---

## 핵심 정리

> **미들웨어(`proxy.ts`)는 페이지 렌더링 전에 실행되어 인증되지 않은 요청을 차단한다. `matcher`로 실행 범위를 제한하면 정적 자산 요청에는 불필요하게 실행되지 않는다. 이 방식은 클라이언트 리다이렉트보다 보안적으로 우수하다.**
