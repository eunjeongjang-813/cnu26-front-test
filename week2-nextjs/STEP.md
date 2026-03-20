# Step 07: 주문 목록 페이지 — Server Component SSR

> **브랜치:** `week2/step-07`
> **수정 파일:** `app/orders/page.tsx`

---

## 학습 목표

- Step 05(ShopPage)와 동일한 SSR 패턴을 반복 구현하여 체득한다.
- `cache: 'no-store'`가 필요한 이유(사용자별 개인 데이터)를 이해한다.
- 인증이 필요한 Server Component의 표준 패턴을 완성한다.

---

## 핵심 개념 설명

### 왜 주문 데이터는 no-store인가?

```ts
// 상품 검색 — 모두에게 동일한 데이터 → ISR 가능
searchProducts(query) // revalidate: 60

// 주문 목록 — 사용자마다 다른 데이터 → 캐시 불가
getMyOrders(token)    // cache: 'no-store'
```

캐시된 주문 목록을 다른 사용자가 보게 되면 심각한 보안 문제가 발생한다.

### 인증 필요 Server Component 표준 패턴

```ts
// 1. 토큰 읽기
const token = await getTokenFromCookie();
// 2. 없으면 로그인 페이지로
if (!token) redirect('/login');
// 3. 토큰으로 데이터 조회
const data = await fetchSomething(token);
// 4. 렌더링
return <div>...</div>;
```

Step 05의 ShopPage와 완전히 동일한 구조다. 이 패턴을 익히면 인증이 필요한 모든 페이지에 적용할 수 있다.

---

## 프로젝트 구조

```
week2-nextjs/
├── lib/
│   ├── auth.ts           ✅ Step 01 완성
│   └── api.ts            ✅ Step 04 완성
└── app/
    ├── shop/page.tsx     ✅ Step 05 완성
    ├── api/orders/route.ts ✅ Step 06 완성
    └── orders/
        └── page.tsx      📝 이번 Step — 주문 목록 Server Component
```

---

## 주요 코드

```tsx
// app/orders/page.tsx

import { redirect } from 'next/navigation';
import { getTokenFromCookie } from '@/lib/auth-server';
import { getMyOrders } from '@/lib/api';

export default async function OrdersPage() {
  // 7-a: 토큰 확인 및 리다이렉트
  const token = await getTokenFromCookie(); // ← [실습 7-a]
  if (!token) redirect('/login');           // ← [실습 7-a]

  // 7-b: 주문 목록 조회
  const orders = await getMyOrders(token);  // ← [실습 7-b]

  return (
    <div>
      {orders.length === 0 ? (
        <p>아직 주문이 없습니다</p>
      ) : (
        orders.map((order) => (
          <div key={order.id}>
            <h3>{order.productName}</h3>
            <p>{order.price.toLocaleString()}원 × {order.quantity}개</p>
          </div>
        ))
      )}
    </div>
  );
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

1. **구현 전:** `/orders` 접속 시 빈 화면 또는 에러 발생 확인
2. **구현 후:** 주문 목록 표시 확인 (BE 미완성이면 Mock 데이터)
3. **페이지 소스 보기:** 주문 데이터가 HTML에 이미 포함된 것 확인 (SSR 증명)
4. **Step 05와 비교:** ShopPage와 OrdersPage의 구조가 얼마나 유사한지 확인

---

## 핵심 정리

> **인증이 필요한 Server Component는 항상 "토큰 읽기 → 없으면 redirect → 데이터 조회 → 렌더링"의 4단계 패턴을 따른다. 사용자별 개인 데이터는 반드시 `cache: 'no-store'`로 설정해야 다른 사용자의 데이터가 캐시되는 보안 사고를 방지할 수 있다.**
