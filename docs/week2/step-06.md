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

```ts
// app/api/orders/route.ts

export async function GET() { ... }   // GET /api/orders
export async function POST() { ... }  // POST /api/orders
```

### Client Component에서 직접 BE를 호출하지 않는 이유

```
❌ 직접 호출 (문제 발생)
Client Component → http://localhost:8080/orders
  → CORS 에러 (다른 오리진)
  → 토큰이 요청 헤더에 포함되어 클라이언트에 노출

✅ Route Handler를 통해 호출
Client Component → POST /api/orders (같은 오리진, CORS 없음)
  → Route Handler → 쿠키에서 토큰 읽기 → http://localhost:8080/orders
  → 토큰이 서버에서만 사용됨
```

---

## 프로젝트 구조

```
week2-nextjs/
├── lib/
│   ├── auth.ts           ✅ Step 01 완성
│   └── api.ts            ✅ Step 04 완성
└── app/
    ├── login/page.tsx    ✅ Step 03 완성
    ├── shop/page.tsx     ✅ Step 05 완성
    ├── api/
    │   └── orders/
    │       └── route.ts  📝 이번 Step — 주문 API Route Handler
    └── orders/page.tsx
```

---

## 주요 코드

```ts
// app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  // 6-a: 쿠키에서 토큰 읽기
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value; // ← [실습 6-a]

  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const { productId, productName, price, quantity = 1 } = await request.json();

  // BE 미완성 → Mock 응답 반환 (실제 구현 시 아래 주석 해제)
  return NextResponse.json({
    id: Date.now(), productId, productName, price, quantity,
    createdAt: new Date().toISOString(),
  }, { status: 201 });
}
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

1. **구현 전:** 장바구니에서 결제 시 401 에러 또는 token이 undefined로 처리되는지 확인
2. **구현 후:** Network 탭 → `POST /api/orders` 요청 → 201 응답 확인
3. **쿠키 확인:** 요청 헤더에 쿠키가 자동으로 포함되어 서버에서 읽히는지 확인
4. **Server vs Client 비교:** `cookies()`를 클라이언트 컴포넌트에서 호출하면 어떤 에러가 나는지 확인

---

## 핵심 정리

> **Route Handler는 클라이언트와 백엔드 사이의 서버 측 프록시다. 쿠키를 서버에서 읽어 토큰을 안전하게 처리하고, CORS 없이 백엔드를 호출할 수 있다. Server Component가 HTML 렌더링을 담당한다면, Route Handler는 클라이언트의 데이터 변경 요청을 처리한다.**
