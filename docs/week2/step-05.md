# Step 05: Shop 페이지 — Server Component SSR

> **브랜치:** `week2/step-05`
> **수정 파일:** `app/shop/page.tsx`

---

## 학습 목표

- `async` Server Component에서 데이터를 SSR로 가져오는 패턴을 구현한다.
- `Promise.all()`로 여러 API를 **병렬** 호출하는 방법을 익힌다.
- `redirect()`로 서버에서 조건부 페이지 이동을 구현한다.

---

## 핵심 개념 설명

### Server Component에서의 데이터 패칭

```tsx
// Week 1 (Client Component)
useEffect(() => {
  fetch('/api/shop/search').then(setProducts);
}, []);
// → 브라우저에서 실행, 로딩 상태 필요

// Week 2 (Server Component)
const products = await searchProducts(query);
// → 서버에서 실행, 완성된 HTML을 브라우저로 전송
// → 로딩 상태 불필요!
```

### Promise.all — 병렬 패칭

```ts
// ❌ 순차 실행 (느림: 200ms + 300ms = 500ms)
const user = await getMe(token);       // 200ms
const products = await searchProducts(query); // 300ms

// ✅ 병렬 실행 (빠름: max(200ms, 300ms) = 300ms)
const [user, products] = await Promise.all([
  getMe(token),
  searchProducts(query),
]);
```

두 요청이 서로 의존하지 않으면 `Promise.all`로 동시에 시작한다.

---

## 프로젝트 구조

```
week2-nextjs/
├── proxy.ts              ✅ Step 02 완성
├── lib/
│   ├── auth.ts           ✅ Step 01 완성
│   └── api.ts            ✅ Step 04 완성
└── app/
    ├── login/page.tsx    ✅ Step 03 완성
    ├── shop/
    │   └── page.tsx      📝 이번 Step — 상품 목록 Server Component
    └── orders/page.tsx
```

---

## 주요 코드

```tsx
// app/shop/page.tsx
// 'use client' 없음 → Server Component (기본값)

import { redirect } from 'next/navigation';
import { getTokenFromCookie } from '@/lib/auth-server';
import { getMe, searchProducts } from '@/lib/api';

export default async function ShopPage({ searchParams }) {
  const query = searchParams?.query ?? '맥북';

  // 5-a: 토큰 확인 및 리다이렉트
  const token = await getTokenFromCookie(); // ← [실습 5-a]
  if (!token) redirect('/login');           // ← [실습 5-a]

  // 5-b: 병렬 데이터 패칭
  const [user, products] = await Promise.all([ // ← [실습 5-b]
    getMe(token),
    searchProducts(query),
  ]);

  return (
    <div>
      <p>안녕하세요, {user.name}님!</p>
      {products.map((p) => <ProductCard key={p.productId} product={p} />)}
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

1. **구현 전:** `/shop` 접속 시 사용자 이름이 표시되지 않고 상품도 없음 확인
2. **구현 후:** 로그인 후 `/shop` → 사용자 이름 + 상품 목록 표시 확인
3. **페이지 소스 보기:** 상품 목록 HTML이 이미 포함되어 있는지 확인 (SSR 증명)
4. **Network 탭:** 브라우저에서 BE API 요청이 직접 가지 않는지 확인 (서버에서 호출)

---

## 핵심 정리

> **Server Component는 `async/await`을 직접 사용해 데이터를 가져온 후 완성된 HTML을 브라우저로 전송한다. `Promise.all`로 독립적인 요청을 병렬 처리하면 응답 시간이 단축된다. Week 1에서 `useEffect`로 처리하던 것을 서버에서 처리하므로 클라이언트에 로딩 상태가 필요 없다.**
