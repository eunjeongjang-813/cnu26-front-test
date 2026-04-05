# Step 07: 주문 목록 페이지 — Server Component SSR

> **브랜치:** `week2/step-07`
> **수정 파일:** `app/orders/page.tsx`

---

## 학습 목표

- Step 05(ShopPage)와 동일한 SSR 패턴을 반복 구현하여 체득한다.
- `cache: 'no-store'`가 필요한 이유(사용자별 개인 데이터)를 이해한다.
- 인증이 필요한 Server Component의 표준 패턴을 완성한다.
- Route Handler(Step 06)와 Server Component의 호출 방식 차이를 비교한다.

---

## 핵심 개념 설명

### 주문 목록을 가져오는 두 가지 경로

Step 06에서 만든 Route Handler(`GET /api/orders`)와 이번 Step의 Server Component는 **같은 데이터를 다른 방식으로 가져온다.**

```
[Step 06 — Route Handler]
Client Component → GET /api/orders → Route Handler → 백엔드

[Step 07 — Server Component] ← 이번 Step
Server Component → getMyOrders(token) → 백엔드 직접 호출
```

Server Component는 서버에서 실행되므로 CORS 없이 백엔드를 직접 호출할 수 있다.
Route Handler를 거칠 필요가 없다.

### 왜 주문 데이터는 `cache: 'no-store'`인가?

```ts
// 상품 검색 — 모든 사용자에게 동일한 데이터 → ISR 가능
fetch(url, { next: { revalidate: 60 } })

// 주문 목록 — 사용자마다 다른 데이터 → 캐시 불가
fetch(url, { cache: 'no-store' })
```

만약 주문 목록을 캐시하면, A 사용자의 주문이 B 사용자에게 보이는 **심각한 보안 사고**가 발생할 수 있다.

### 인증 필요 Server Component 표준 패턴

```
1. 쿠키에서 토큰 읽기     getTokenFromCookie()
2. 토큰 없으면 리다이렉트  redirect('/login')
3. 토큰으로 데이터 조회    getMyOrders(token)
4. 렌더링                 return <JSX />
```

Step 05의 ShopPage와 완전히 동일한 구조다.
이 패턴을 익히면 인증이 필요한 모든 페이지에 적용할 수 있다.

---

## 프로젝트 구조

```
week2-nextjs/
├── lib/
│   ├── auth-server.ts      ✅ Step 01 완성 — getTokenFromCookie()
│   └── api.ts              ✅ Step 04 완성 — getMyOrders(token)
└── app/
    ├── shop/page.tsx       ✅ Step 05 완성 — SSR 패턴 참고용
    ├── api/orders/route.ts ✅ Step 06 완성 — Client용 주문 API
    └── orders/
        └── page.tsx        📝 이번 Step — 주문 목록 Server Component
```

---

## 주요 코드

### lib/api.ts — getMyOrders

```ts
// Server Component에서 호출 → BACKEND_URL로 백엔드 직접 호출
// Client Component에서 호출 → /api로 Route Handler 경유 (CORS 우회)
export async function getMyOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${BACKEND_URL}/orders/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store', // 사용자마다 다른 데이터 → 캐시 금지
  });
  if (!res.ok) throw new Error('주문 목록 조회 실패');
  return res.json();
}
```

### app/orders/page.tsx — 구현 목표

```tsx
import { redirect } from 'next/navigation';
import { getTokenFromCookie } from '@/lib/auth-server';
import { getMyOrders } from '@/lib/api';

export default async function OrdersPage() {
  // [실습 7-a] 토큰을 읽어오고, 없으면 /login으로 리다이렉트
  const token = await getTokenFromCookie();
  if (!token) redirect('/login');

  // [실습 7-b] 주문 목록을 가져오세요
  const orders = await getMyOrders(token);

  return (
    <div>
      {orders.length === 0 ? (
        <p>아직 주문이 없습니다</p>
      ) : (
        orders.map((order) => (
          <div key={order.id}>
            <h3>{order.productName}</h3>
            <p>{order.price.toLocaleString()}원 × {order.quantity}개</p>
            <p>합계: {(order.price * order.quantity).toLocaleString()}원</p>
          </div>
        ))
      )}
    </div>
  );
}
```

---

## Step 05(ShopPage)와 비교

| | ShopPage (Step 05) | OrdersPage (Step 07) |
|--|--|--|
| 데이터 | 상품 목록 (공개) | 주문 목록 (개인) |
| 캐시 전략 | `revalidate: 60` (ISR) | `no-store` (SSR) |
| 인증 필요 | 필요 (로그인 체크) | 필요 (로그인 체크) |
| 토큰 사용 | `getMe(token)` | `getMyOrders(token)` |
| 구조 | 동일한 4단계 패턴 | 동일한 4단계 패턴 |

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

1. **구현 전:** `/orders` 접속 시 빈 화면 또는 에러 발생 확인
2. **구현 후:** 장바구니에서 결제 → `/orders`에서 실제 주문 내역 확인
3. **페이지 소스 보기(`Ctrl+U`):** 주문 데이터가 HTML에 이미 포함된 것 확인 → SSR 증명
4. **Step 05와 비교:** ShopPage와 OrdersPage 코드 구조가 거의 동일함을 확인

---

## 핵심 정리

> **인증이 필요한 Server Component는 항상 "토큰 읽기 → 없으면 redirect → 데이터 조회 → 렌더링"의 4단계 패턴을 따른다.**
>
> **사용자별 개인 데이터는 반드시 `cache: 'no-store'`로 설정해야 한다. Server Component는 Route Handler를 거치지 않고 백엔드를 직접 호출한다.**
