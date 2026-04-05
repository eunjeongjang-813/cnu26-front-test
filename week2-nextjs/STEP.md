# Step 06: Route Handler — 주문 API 프록시

> **브랜치:** `week2/step-06`
> **수정 파일:** `app/api/orders/route.ts`

---

## 학습 목표

- Next.js Route Handler의 구조와 역할을 이해한다.
- Route Handler에서 쿠키를 읽고 인증을 처리하는 방법을 익힌다.
- Client Component가 직접 백엔드를 호출하지 않고 Route Handler를 거치는 이유를 이해한다.

---

## 핵심 개념 설명

### Route Handler란?

`app/api/*/route.ts` 파일에 HTTP 메서드별 함수를 export하면 API 엔드포인트가 된다.
Server Component가 HTML 렌더링을 담당한다면, Route Handler는 **클라이언트의 데이터 변경 요청**을 처리한다.

```
app/api/orders/route.ts

export async function GET()  → GET  /api/orders  (주문 목록)
export async function POST() → POST /api/orders  (주문 생성)
```

### Client Component가 직접 BE를 호출하지 않는 이유

```
❌ Client Component → http://localhost:8080/orders  (직접 호출)
   문제 1: CORS 에러 — 브라우저가 다른 오리진(포트) 간 요청을 차단
   문제 2: 쿠키에서 토큰을 읽을 수 없음 — HttpOnly 쿠키는 JS 접근 불가
   문제 3: BACKEND_URL이 클라이언트 코드에 노출됨

✅ Client Component → POST /api/orders (Route Handler) → 백엔드
   해결 1: 같은 오리진(/api/...)이므로 CORS 없음
   해결 2: Route Handler는 서버에서 실행 → cookies()로 토큰 읽기 가능
   해결 3: BACKEND_URL이 서버에서만 사용됨
```

### Route Handler와 Server Component의 차이

```
Server Component (page.tsx)     Route Handler (route.ts)
───────────────────────────     ────────────────────────
HTML 렌더링 담당                 JSON 응답 담당
페이지 진입 시 실행              클라이언트 요청 시 실행
BE 직접 호출 (BACKEND_URL)      BE 직접 호출 (BACKEND_URL)
브라우저에서 호출 불가            브라우저에서 fetch()로 호출
```

---

## 요청 흐름

```
[주문 생성]
장바구니 페이지 (Client Component)
  → POST /api/orders  { productId, productName, price, quantity }
  → Route Handler: 쿠키에서 토큰 읽기 → POST http://localhost:8080/orders
  → 백엔드: JWT 검증 → orders 테이블에 저장 → 201 응답

[주문 목록 — Client 측 호출이 필요한 경우]
Client Component
  → GET /api/orders
  → Route Handler: 쿠키에서 토큰 읽기 → GET http://localhost:8080/orders/me
  → 백엔드: JWT 검증 → userId로 주문 조회 → 목록 반환

※ orders 페이지(Server Component)는 Route Handler를 거치지 않고
  lib/api.ts의 getMyOrders()로 백엔드를 직접 호출한다. (Step 07)
```

---

## 프로젝트 구조

```
week2-nextjs/
├── lib/
│   ├── auth-server.ts    ✅ Step 01 완성
│   └── api.ts            ✅ Step 04 완성
└── app/
    ├── login/page.tsx    ✅ Step 03 완성
    ├── shop/page.tsx     ✅ Step 05 완성
    ├── api/
    │   └── orders/
    │       └── route.ts  📝 이번 Step — 주문 API Route Handler
    └── orders/page.tsx   ← Step 07에서 구현
```

---

## 주요 코드

```ts
// app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

// POST /api/orders — 주문 생성
export async function POST(request: NextRequest) {
  // [실습 6-a] 쿠키에서 토큰 읽기
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const { productId, productName, price, quantity = 1 } = await request.json();

  // [실습 6-b] 백엔드 POST /orders 호출
  const res = await fetch(`${BACKEND_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, productName, price, quantity }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: '주문 실패' }, { status: res.status });
  }

  const order = await res.json();
  return NextResponse.json(order, { status: 201 });
}

// GET /api/orders — 내 주문 목록
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  // [실습 6-c] 백엔드 GET /orders/me 호출
  const res = await fetch(`${BACKEND_URL}/orders/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const orders = await res.json();
  return NextResponse.json(orders);
}
```

---

## 프로젝트 실행법

```bash
# 백엔드 먼저 실행 (feature/orders-api 브랜치)
cd cnu26-backend
./gradlew bootRun

# 프론트엔드 실행
cd week2-nextjs
npm run dev
```

---

## 확인할 것들

1. **구현 전:** 장바구니에서 결제 시 `token`이 없어 401 응답이 오는지 확인
2. **구현 후:** 브라우저 개발자 도구 → Network 탭 → `POST /api/orders` 201 응답 확인
3. **쿠키 흐름:** Application 탭 → Cookies → `token` 값 확인 → 이 값이 Route Handler에서 읽힘
4. **백엔드 로그:** `주문 생성 완료 - orderId: N` 로그 확인

---

## 핵심 정리

> **Route Handler는 클라이언트와 백엔드 사이의 서버 측 프록시다.**
> `cookies()`로 서버에서 토큰을 안전하게 읽고, BACKEND_URL을 노출하지 않은 채 백엔드를 호출한다.
> Client Component가 데이터를 변경할 때는 반드시 Route Handler를 통한다.
