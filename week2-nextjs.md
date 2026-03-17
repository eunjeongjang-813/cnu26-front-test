# 2주차: Next.js와 쇼핑몰 완성

> 대상: 1주차 React 실습 완료자 / BE 실습 경험 있음
> 목표: Next.js App Router 이해 + 구매·주문 목록 기능 구현
> 실습: `week2-nextjs` 프로젝트 빈칸 채우기

---

## 목차

1. [Next.js란 무엇인가](#1-nextjs란-무엇인가)
2. [App Router 구조](#2-app-router-구조)
3. [Server Component vs Client Component](#3-server-component-vs-client-component)
4. [Data Fetching 전략](#4-data-fetching-전략)
5. [Middleware & 라우트 보호](#5-middleware--라우트-보호)
6. [Route Handlers (API Routes)](#6-route-handlers-api-routes)
7. [쿠키 기반 인증](#7-쿠키-기반-인증)
8. [장바구니 기능 — Context + localStorage](#8-장바구니-기능--context--localstorage)
9. [배포](#9-배포)
10. [실습 가이드](#10-실습-가이드)
11. [트러블슈팅](#11-트러블슈팅)

---

## 1. Next.js란 무엇인가

### 기초: 1주차 React의 한계

지난 주에 만든 React 앱에는 구조적인 한계가 있습니다.

```
1. SEO 불리         → 검색 엔진이 빈 HTML(<div id="root">)만 봄
2. 초기 로딩 느림    → JS 다운로드 후 렌더링 시작
3. 라우팅 직접 구현  → react-router-dom 별도 설치
4. API key 노출     → 클라이언트 코드가 브라우저에 모두 공개
5. localhost 의존   → Vite proxy 없이 배포하면 CORS 재설정 필요
```

> **실제로 느껴보기:** 1주차 React 앱에서 F12 → Network → JS 파일 클릭
> → BE API URL, 토큰 처리 로직이 모두 노출됩니다.

### 기초: Next.js가 해결하는 것

```
React (1주차)         →  Next.js (2주차)
──────────────────────────────────────────────────────
CSR만 지원            →  SSR / SSG / ISR / CSR 모두 지원
라우팅 직접 설정       →  파일 기반 자동 라우팅
번들 최적화 없음       →  자동 코드 스플리팅, 이미지 최적화
API 없음              →  Route Handlers (서버 함수 내장)
CORS 직접 처리        →  서버 → 서버 통신으로 우회 가능
localStorage만        →  HttpOnly Cookie 지원
```

### 기초: CSR vs SSR — 사용자 경험 차이

```
CSR (Client-Side Rendering) — 1주차 React
──────────────────────────────────────────
1. 서버: 빈 HTML 전달 (<div id="root">)
2. 브라우저: JS 번들 다운로드 (수백 KB)
3. React: DOM 생성 → 사용자에게 처음 보임
4. API 호출 → 데이터 로드

문제: 3번까지 사용자에게 아무것도 안 보임 (FCP 느림)
      검색 엔진은 빈 HTML만 인덱싱

SSR (Server-Side Rendering) — 2주차 Next.js
──────────────────────────────────────────
1. 서버: 데이터 패칭 + HTML 생성
2. 브라우저: 완성된 HTML 다운로드 → 즉시 사용자에게 보임
3. JS 번들 다운로드 (Hydration)
4. 인터랙션 활성화

장점: HTML에 이미 내용이 있어서 빠름
      검색 엔진이 실제 콘텐츠를 인덱싱
```

> **Hydration이란?** 서버에서 렌더링된 HTML에 React 이벤트 핸들러를 "부착"하는 과정입니다. 마치 정적인 HTML 뼈대에 JS 근육을 심는 것과 같습니다.

### 심화: 언제 SSR/CSR을 선택하나?

| 페이지    | 전략      | 이유                            |
| --------- | --------- | ------------------------------- |
| 상품 목록 | SSR + ISR | SEO 중요, 데이터 주기적 갱신    |
| 주문 내역 | SSR       | 사용자마다 다름, 항상 최신 필요 |
| 로그인 폼 | CSR       | SEO 불필요, 폼 인터랙션 필요    |
| 공지사항  | SSG       | 거의 변하지 않음, 최대한 빠르게 |

---

## 2. App Router 구조

### 기초: 파일이 곧 URL — 파일 기반 라우팅

Next.js App Router는 `app/` 폴더 구조가 URL 경로와 1:1 매핑됩니다.

```
app/
├── layout.tsx          → 모든 페이지 공통 레이아웃
├── page.tsx            → /  (루트 → /shop으로 리다이렉트)
├── globals.css
├── login/
│   └── page.tsx        → /login
├── shop/
│   └── page.tsx        → /shop
├── orders/
│   └── page.tsx        → /orders
└── api/
    └── orders/
        └── route.ts    → /api/orders  (API 엔드포인트)
```

**컴포넌트는 따로 관리:**

```
components/
├── LogoutButton.tsx    → 'use client' — 쿠키 삭제 + 리다이렉트
├── SearchBar.tsx       → 'use client' — URL params 업데이트
├── ProductCard.tsx     → Server Component — 상품 카드
└── PurchaseButton.tsx  → 'use client' — 주문 API 호출

lib/
├── api.ts              → BE API 호출 함수 모음 (서버/클라이언트 공통)
└── auth-server.ts      → 서버에서 쿠키 읽기 헬퍼
```

### 기초: 특수 파일들

| 파일            | 역할                             | 설명                     |
| --------------- | -------------------------------- | ------------------------ |
| `page.tsx`      | 해당 경로의 UI                   | 없으면 404               |
| `layout.tsx`    | 여러 page를 감싸는 공통 레이아웃 | 리렌더링 없이 유지       |
| `loading.tsx`   | 로딩 중 표시할 UI                | Suspense 자동 적용       |
| `error.tsx`     | 에러 발생 시 표시할 UI           | Error Boundary 자동 적용 |
| `not-found.tsx` | 404 페이지                       | `notFound()` 호출 시     |
| `route.ts`      | API 엔드포인트                   | page.tsx와 공존 불가     |
| `proxy.ts`      | 요청 전처리                      | 프로젝트 루트에 위치 (**Next.js 16**: `middleware.ts` → `proxy.ts`) |

### 기초: layout.tsx — 공통 레이아웃

```tsx
// app/layout.tsx — 실습 프로젝트 실제 코드
export const metadata = {
  title: "CNU 쇼핑몰",
  description: "충남대 React/Next.js 실습 쇼핑몰",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="app-wrapper">
          {children} {/* 각 page.tsx가 여기 렌더링 */}
        </div>
      </body>
    </html>
  );
}
```

> **layout.tsx의 특징:** 자식 페이지가 바뀌어도 layout은 리렌더링되지 않습니다. 헤더, 사이드바처럼 모든 페이지에 공통인 UI를 여기 두세요.

### 심화: searchParams — URL 파라미터를 Server Component에서 읽기

```tsx
// app/shop/page.tsx — 실습 프로젝트
// ?query=아이폰 처럼 URL 파라미터를 props로 받음
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params.query ?? "맥북"; // 기본 검색어

  // 서버에서 직접 API 호출
  const products = await searchProducts(query);
  // ...
}
```

**`SearchBar.tsx`와의 연동:**

```tsx
// components/SearchBar.tsx — 'use client'
// 검색폼 제출 → URL 변경 → Server Component 재실행 → 새 데이터
const handleSearch = (e) => {
  e.preventDefault();
  router.push(`/shop?query=${encodeURIComponent(query)}`);
};
```

URL이 변경되면 Next.js가 자동으로 Server Component를 재실행합니다. 클라이언트에서 직접 `fetch`를 부르지 않아도 됩니다.

---

## 3. Server Component vs Client Component

### 기초: 핵심 차이

Next.js App Router의 **모든 컴포넌트는 기본적으로 Server Component**입니다.
브라우저 API나 React hooks가 필요한 경우에만 `'use client'`를 선언합니다.

```tsx
// ─── Server Component (기본값) ────────────────────────────────
// 파일 상단에 아무것도 없음
// 서버에서만 실행 → DB/API 직접 호출 가능, 브라우저 API 사용 불가

async function ShopPage() {
  const products = await searchProducts("맥북"); // ✅ 서버에서 직접 API 호출
  return <ProductGrid products={products} />;
}

// ─── Client Component ──────────────────────────────────────────
// 파일 최상단에 'use client' 선언 필수
// 브라우저에서 실행 → useState, useEffect, onClick 등 사용 가능

("use client");
function SearchBar() {
  const [query, setQuery] = useState(""); // ✅ useState 사용 가능
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### 기초: 언제 'use client'를 쓰나?

| 필요한 기능                          | Server | Client |
| ------------------------------------ | :----: | :----: |
| `async/await` + 직접 DB/API 호출     |   ✅   |   ❌   |
| 환경변수 (비밀키)                    |   ✅   |   ❌   |
| `next/headers` (cookies, headers)    |   ✅   |   ❌   |
| `useState`, `useEffect`, `useRef`    |   ❌   |   ✅   |
| `onClick`, `onChange` 이벤트         |   ❌   |   ✅   |
| `localStorage`, `window`, `document` |   ❌   |   ✅   |
| `useRouter`, `usePathname`           |   ❌   |   ✅   |

**황금 법칙:** 가능한 한 Server Component로 두고, 인터랙션이 필요한 최소 부분만 `'use client'`로 분리

### 기초: 실습 프로젝트 컴포넌트 분류

```
Server Component (기본값)
  app/shop/page.tsx       → 서버에서 상품 목록 데이터 패칭
  app/orders/page.tsx     → 서버에서 주문 내역 데이터 패칭
  components/ProductCard.tsx → 데이터 표시만, 인터랙션 없음

Client Component ('use client')
  app/login/page.tsx      → useState (폼 입력값), router.push()
  components/SearchBar.tsx    → useState (검색어), router.push()
  components/LogoutButton.tsx → document.cookie 삭제, router.push()
  components/PurchaseButton.tsx → fetch + useRouter
```

### 기초: 실습 코드 — Server + Client 조합

```tsx
// app/shop/page.tsx — Server Component
// 데이터는 서버에서, 인터랙션은 Client Component에 위임
export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const query = params.query ?? '맥북';

  // 서버에서 직접 API 호출 (브라우저에 노출 안 됨)
  const [user, products] = await Promise.all([
    getMe(token),
    searchProducts(query),
  ]);

  return (
    <div>
      <header>
        <span>안녕하세요, {user.name}님!</span>
        <LogoutButton />   {/* Client Component — 쿠키 삭제 */}
      </header>
      <SearchBar defaultQuery={query} />  {/* Client Component — 검색 */}
      <div className="product-grid">
        {products.map(p => (
          <ProductCard key={p.productId} product={p} />  {/* Server Component */}
        ))}
      </div>
    </div>
  );
}
```

### 심화: Server Component의 진짜 장점

```tsx
// 1. API 키나 BE URL이 클라이언트에 노출되지 않음
const BACKEND_URL = process.env.BACKEND_URL; // 서버 환경변수, 브라우저에 안 보임

// 2. 서버 → 서버 통신 (지연 시간 최소화)
const products = await fetch(`${BACKEND_URL}/shop/search?query=맥북`);

// 3. 컴포넌트가 async 함수가 될 수 있음 (useState 없이 데이터 패칭)
async function ProductList() {
  const products = await searchProducts("맥북"); // useEffect 없이!
  return (
    <ul>
      {products.map((p) => (
        <li>{p.title}</li>
      ))}
    </ul>
  );
}
```

> **1주차와 비교:** 1주차에서 `useEffect + useState + setLoading + setError` 4개를 써야 했던 것을 Server Component에서는 `await` 한 줄로 처리합니다.

### 심화: Server Component에서 Client Component로 데이터 전달

```tsx
// Server Component → Client Component props로 전달
// (직렬화 가능한 데이터만: string, number, array, plain object)
async function ShopPage() {
  const products = await searchProducts("맥북"); // 서버에서 데이터 패칭

  return (
    <div>
      {products.map((p) => (
        // product 객체를 props로 내려줌
        <ProductCard key={p.productId} product={p} />
      ))}
    </div>
  );
}

// ProductCard 안의 PurchaseButton은 Client Component
// Server Component가 Client Component를 children으로 포함 가능
export default function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.title}</h3>
      <PurchaseButton product={product} /> {/* Client Component */}
    </div>
  );
}
```

---

## 4. Data Fetching 전략

### 기초: 3가지 렌더링 전략

Next.js에서 `fetch()`의 캐시 옵션 하나로 렌더링 전략이 결정됩니다.

```tsx
// 1. SSR — 매 요청마다 서버에서 새로 렌더링
// cache: 'no-store' → 항상 최신 데이터
async function OrdersPage() {
  const orders = await fetch("http://localhost:8080/orders/me", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
  return <OrderList orders={orders} />;
}

// 2. SSG — 빌드 타임에 딱 한 번 렌더링 (배포 후 변경 없음)
// 기본값 (cache 옵션 없음) — 공지사항, FAQ 등에 적합
async function FAQPage() {
  const faqs = await fetch("http://localhost:8080/faqs").then((r) => r.json());
  return <FAQList faqs={faqs} />;
}

// 3. ISR — 일정 주기로 백그라운드에서 재생성
// next: { revalidate: N } — 상품 목록, 인기 콘텐츠에 적합
async function ShopPage() {
  const products = await fetch("http://localhost:8080/shop/search?query=맥북", {
    next: { revalidate: 60 }, // 60초마다 재생성
  }).then((r) => r.json());
  return <ProductList products={products} />;
}
```

### 기초: 실습 프로젝트에서의 전략 선택

```tsx
// lib/api.ts — searchProducts (ISR 60초)
export async function searchProducts(query: string, display = 12) {
  const res = await fetch(
    `${BACKEND_URL}/shop/search?query=${encodeURIComponent(query)}&display=${display}`,
    { next: { revalidate: 60 } }, // ISR: 60초마다 갱신
  );
  return res.json() as Promise<ShoppingItem[]>;
}

// lib/api.ts — getMe (SSR, 캐시 없음)
export async function getMe(token: string) {
  const res = await fetch(`${BACKEND_URL}/users/me`, {
    cache: "no-store", // 항상 최신 유저 정보
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<User>;
}
```

| 함수               | 전략           | 이유                                       |
| ------------------ | -------------- | ------------------------------------------ |
| `searchProducts()` | ISR (60초)     | 상품 데이터는 자주 안 바뀜, 빠른 응답 우선 |
| `getMe()`          | SSR (no-store) | 유저 정보는 항상 최신이어야 함             |
| `getMyOrders()`    | SSR (no-store) | 주문은 사용자마다 다르고 최신 데이터 필요  |

### 기초: Promise.all — 병렬 데이터 패칭

여러 API를 호출할 때 순서대로 기다리면 시간이 낭비됩니다.

```tsx
// 나쁜 예 — 순차 실행 (user 끝나야 products 시작)
const user = await getMe(token); // 200ms 대기
const products = await searchProducts(query); // 300ms 대기
// 총 500ms

// 좋은 예 — 병렬 실행 (app/shop/page.tsx에서 사용)
const [user, products] = await Promise.all([
  getMe(token), // 동시 시작
  searchProducts(query), // 동시 시작
]);
// 총 300ms (가장 느린 것 기준)
```

> **BE와 비교:** Java의 `CompletableFuture.allOf()` 또는 `ExecutorService`로 병렬 작업을 처리하는 것과 같습니다.

### 심화: 캐시 무효화 — revalidatePath / revalidateTag

주문 생성 후 주문 목록 페이지를 갱신하려면?

> **[Next.js 16 변경]** `revalidateTag(tag)` → `revalidateTag(tag, 'max')` — 두 번째 인자(캐시 레이어 지정)가 필수로 변경됨

```tsx
// app/api/orders/route.ts — 주문 생성 후 캐시 무효화
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  // ... 주문 생성 로직

  // 방법 1: 경로 기반 무효화 (변경 없음)
  revalidatePath("/orders");

  // 방법 2: 태그 기반 무효화 (Next.js 16: 두 번째 인자 'max' 필수)
  // [Next.js 16 변경] revalidateTag("orders") → revalidateTag("orders", "max")
  // 'max' = 모든 캐시 레이어(메모리 + 디스크) 무효화
  revalidateTag("orders", "max");

  return NextResponse.json(order, { status: 201 });
}
```

---

## 5. Middleware & 라우트 보호

### 기초: Middleware란?

**요청이 페이지에 도달하기 전에 실행되는 함수**입니다.
모든 요청이 거치는 관문(Gateway)에서 인증 체크, 리다이렉트, 헤더 추가 등을 처리합니다.

```
사용자 요청 /shop
  → proxy.ts 실행  ← Next.js 16: middleware.ts → proxy.ts
    → 토큰 있음? → /shop 페이지 접근 허용
    → 토큰 없음? → /login으로 리다이렉트
```

> **BE와 비교:** Spring의 `Filter` 또는 `Interceptor`와 같습니다. 요청이 Controller에 도달하기 전에 공통 처리를 합니다.

### 기초: 실습 코드 — proxy.ts

> **[Next.js 16 변경]** 파일명 `middleware.ts` → `proxy.ts`, export 함수명 `middleware` → `proxy`

```ts
// proxy.ts — 프로젝트 루트 (실습 파일)
// [Next.js 16] middleware.ts → proxy.ts, export function middleware → export function proxy
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // 쿠키에서 토큰 읽기 (localStorage와 달리 서버에서도 접근 가능)
  const token = request.cookies.get("token")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  // [실습 2] 미인증 사용자 → /login 리다이렉트
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // [실습 2] 이미 로그인된 사용자가 /login 접근 → /shop 리다이렉트
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/shop", request.url));
  }

  return NextResponse.next(); // 통과
}

// 미들웨어를 적용할 경로 패턴
export const config = {
  matcher: ["/shop/:path*", "/orders/:path*", "/login"],
};
```

**`?.value` 옵셔널 체이닝:**

```ts
request.cookies.get("token"); // Cookie | undefined
request.cookies.get("token")?.value; // string | undefined (토큰 없으면 undefined)
```

### 기초: 실습 코드 — [실습 2] 빈칸

```ts
// proxy.ts — 빈칸 버전 (학생 구현)
// [Next.js 16] 파일명: proxy.ts, 함수명: proxy
export function proxy(request: NextRequest) {
  const token = /* TODO: request.cookies에서 'token' 값 읽기 */;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // TODO: 토큰 없고, 로그인 페이지가 아닌 경우 /login으로 리다이렉트
  // 힌트: NextResponse.redirect(new URL('/login', request.url))

  // TODO: 토큰 있고, 로그인 페이지인 경우 /shop으로 리다이렉트

  return NextResponse.next();
}
```

### 심화: matcher 패턴

```ts
export const config = {
  matcher: [
    "/shop/:path*", // /shop, /shop/anything 모두 적용
    "/orders/:path*", // /orders, /orders/123 모두 적용
    "/login", // /login만 적용
  ],
};

// 특정 경로 제외 패턴
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    // api/, _next/, favicon은 제외하고 나머지 모두 적용
  ],
};
```

### 심화: Middleware에서 할 수 있는 것들

```ts
// [Next.js 16] proxy.ts — 파일명과 함수명 모두 변경됨
export function proxy(request: NextRequest) {
  // 1. 리다이렉트
  return NextResponse.redirect(new URL("/login", request.url));

  // 2. 헤더 추가 후 통과
  const response = NextResponse.next();
  response.headers.set("x-user-id", "123");
  return response;

  // 3. 쿠키 설정
  const response = NextResponse.next();
  response.cookies.set("visited", "true");
  return response;

  // 4. 요청 URL 재작성 (주소창 변경 없이)
  return NextResponse.rewrite(new URL("/404", request.url));
}
```

---

## 6. Route Handlers (API Routes)

### 기초: Next.js 내장 API 서버

`app/api/*/route.ts` 파일로 REST API 엔드포인트를 만들 수 있습니다.

**왜 필요한가?**

```
Client Component → BE 직접 호출
  문제: 쿠키의 토큰을 BE에 전달하기 어려움
       BE URL이 클라이언트에 노출됨

Client Component → Next.js Route Handler → BE
  장점: 서버에서 쿠키 읽어서 BE에 전달
        BE URL은 서버에만 존재
        추가 검증/변환 로직 삽입 가능
```

> **BE와 비교:** API Gateway 패턴 또는 BFF(Backend For Frontend) 패턴입니다.

### 기초: 실습 코드 — app/api/orders/route.ts

```ts
// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/orders — 주문 생성
export async function POST(request: NextRequest) {
  // [실습 6] 서버에서 쿠키 읽기
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const body = await request.json();
  // body: { productId, productName, price, quantity }

  // 서버 → BE 서버 통신 (토큰 포함)
  const response = await fetch(`${process.env.BACKEND_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 쿠키에서 읽은 토큰 전달
    },
    body: JSON.stringify(body),
  });

  const order = await response.json();
  return NextResponse.json(order, { status: 201 });
}

// GET /api/orders — 주문 목록
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  // ...
}
```

### 기초: Client Component에서 Route Handler 호출

```tsx
// components/PurchaseButton.tsx — 'use client'
"use client";

export default function PurchaseButton({ product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // BE가 아닌 /api/orders (Next.js Route Handler) 호출
      // 쿠키는 same-origin 요청에 자동 포함
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.productId,
          productName: product.title,
          price: product.lprice,
          quantity: 1,
        }),
      });

      if (response.ok) {
        router.push("/orders"); // 주문 완료 → 주문 목록으로 이동
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="btn-purchase"
    >
      {loading ? "처리 중..." : "구매하기"}
    </button>
  );
}
```

### 심화: HTTP Method별 핸들러

```ts
// app/api/orders/route.ts
// 같은 파일에서 HTTP 메서드별로 함수 export
export async function GET(request: NextRequest) {
  /* ... */
}
export async function POST(request: NextRequest) {
  /* ... */
}
export async function PUT(request: NextRequest) {
  /* ... */
}
export async function DELETE(request: NextRequest) {
  /* ... */
}
export async function PATCH(request: NextRequest) {
  /* ... */
}
```

### 심화: 동적 경로 Route Handler

```ts
// app/api/orders/[id]/route.ts → /api/orders/123
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // id = "123"
}
```

---

## 7. 쿠키 기반 인증

### 기초: 왜 localStorage에서 Cookie로?

1주차 React에서 `localStorage`를 썼는데 왜 Next.js에서는 쿠키를 쓸까요?

```
localStorage
  ✅ 간단
  ✅ 새로고침 후 유지
  ❌ JS에서만 접근 가능 → Server Component에서 읽지 못함
  ❌ middleware에서 읽지 못함 → 라우트 보호 불가
  ❌ XSS 공격에 취약 (악성 스크립트가 토큰 탈취 가능)

Cookie
  ✅ 모든 HTTP 요청에 자동 포함 → Server Component, Middleware에서 접근 가능
  ✅ HttpOnly 옵션으로 JS 접근 차단 (XSS 방어)
  ✅ Secure 옵션으로 HTTPS에서만 전송
  ✅ SameSite 옵션으로 CSRF 방어 가능
  ❌ CSRF 공격 고려 필요 (실습에서는 생략)
```

### 기초: 쿠키 저장 — 로그인 후 (Client Component)

```tsx
// app/login/page.tsx — 'use client'
// 로그인 성공 후 토큰을 쿠키에 저장

const handleLogin = async () => {
  // ... API 호출로 token 획득

  // [실습 3] 쿠키에 토큰 저장
  document.cookie = `token=${token}; path=/; max-age=3600`;
  //                 key=value  모든 경로   1시간 후 만료

  router.push("/shop");
};
```

**쿠키 속성 설명:**

| 속성              | 값       | 설명                               |
| ----------------- | -------- | ---------------------------------- |
| `path=/`          | 문자열   | 모든 경로에서 쿠키 사용 가능       |
| `max-age=3600`    | 초       | 1시간 후 자동 삭제                 |
| `HttpOnly`        | (플래그) | JS 접근 불가, 서버에서만 설정 가능 |
| `Secure`          | (플래그) | HTTPS에서만 전송                   |
| `SameSite=Strict` | 문자열   | 동일 사이트 요청에만 쿠키 전송     |

> **실습에서는 HttpOnly를 사용하지 않습니다.** 로그인 후 `document.cookie`로 설정하려면 JS 접근이 필요하기 때문입니다. 실무에서는 BE 서버가 `Set-Cookie: token=...; HttpOnly` 헤더로 직접 설정합니다.

### 기초: 쿠키 삭제 — 로그아웃 (Client Component)

```tsx
// components/LogoutButton.tsx — 'use client'
"use client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // max-age=0 으로 즉시 만료 (삭제 효과)
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
    router.refresh(); // Server Component 캐시 갱신
  };

  return <button onClick={handleLogout}>로그아웃</button>;
}
```

### 기초: 쿠키 읽기 — Server Component / Route Handler

```tsx
// Server Component에서 쿠키 읽기
import { cookies } from "next/headers";

export default async function ShopPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");
  // ...
}

// Route Handler에서 쿠키 읽기 (동일한 방식)
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  // ...
}

// Proxy(Middleware)에서 쿠키 읽기 (request 객체에서)
// [Next.js 16] proxy.ts / export function proxy
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  // ...
}
```

### 기초: auth-server.ts — 서버 인증 헬퍼

```ts
// lib/auth-server.ts — 서버 컴포넌트 전용 헬퍼
import { cookies } from "next/headers";
import { getMe as fetchMe } from "./api";

// 쿠키에서 토큰 꺼내기 (Server Component, Route Handler에서 사용)
export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value ?? null;
}

// 토큰으로 내 정보 조회
export async function getMe(token: string) {
  return fetchMe(token);
}
```

### 심화: 1주차(localStorage) vs 2주차(Cookie) 전체 비교

```
1주차 React (localStorage)
──────────────────────────────────────────────
로그인 성공
  → localStorage.setItem('token', token)
  → setUser(foundUser)              ← React 상태 업데이트

API 요청 시
  → client.js에서 localStorage.getItem('token')
  → fetch Authorization 헤더에 수동으로 추가

자동 로그인 복원
  → 앱 시작 시 useEffect에서 localStorage 확인
  → getMe() 호출로 유저 정보 복원

로그아웃
  → localStorage.removeItem('token')
  → setUser(null)

한계: Server Component에서 읽을 수 없음
      Middleware에서 라우트 보호 불가

──────────────────────────────────────────────
2주차 Next.js (Cookie)
──────────────────────────────────────────────
로그인 성공
  → document.cookie = `token=${token}; path=/; max-age=3600`
  → router.push('/shop')            ← 페이지 이동 (상태 불필요)

API 요청 시 (Server Component)
  → cookies().get('token').value
  → fetch Authorization 헤더에 전달

API 요청 시 (Client Component → /api/orders)
  → 쿠키 자동 포함 (same-origin, 브라우저가 처리)

자동 로그인 복원
  → Middleware가 매 요청마다 토큰 확인
  → 토큰 없으면 /login으로 자동 리다이렉트

로그아웃
  → document.cookie = 'token=; max-age=0'
  → router.push('/login')
```

---

## 8. 장바구니 기능 — Context + localStorage

### 기초: 왜 Context가 필요한가?

장바구니 데이터는 여러 컴포넌트에서 동시에 필요합니다.

```
ShopPage 헤더 → 🛒 뱃지 숫자
ProductCard  → [장바구니 담기] 버튼
CartPage     → 담긴 목록, 수량 조절, 결제
```

Props로 전달하면 "Prop Drilling" 문제가 발생합니다.

```
App → ShopPage → Header → CartCount  ← 3단계 전달, 너무 복잡
```

**React Context**를 사용하면 어느 컴포넌트에서든 직접 꺼내 쓸 수 있습니다.

> **BE와 비교:** Context = Spring의 `@Service` + `@Autowired` 패턴. 어디서나 주입해서 쓸 수 있는 서비스 레이어.

### 기초: 전체 흐름

```
/shop
  → 상품마다 [장바구니 담기] 버튼 (AddToCartButton)
  → 헤더에 장바구니 개수 뱃지 (CartCount)

/cart  ← NEW
  → 담긴 상품 목록
  → 수량 조절(+/-), 개별 삭제
  → 총 금액 표시
  → [결제하기] → /api/checkout → /orders

/orders
  → 결제 완료 목록 확인
```

### 기초: Context 구조 — lib/cart-context.tsx

```tsx
// lib/cart-context.tsx — 전체 구조
'use client';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  image: string;
  quantity: number;
}

// Context 생성
const CartContext = createContext<CartContextValue | null>(null);

// Provider — cart 상태와 조작 함수를 하위 컴포넌트에 제공
export function CartProvider({ children }) {
  // [실습 8-a] localStorage에서 초기값 복원
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // [실습 8-b] cart가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => { /* ... */ };
  const removeFromCart = (productId) => { /* ... */ };
  const updateQuantity = (productId, quantity) => { /* ... */ };
  const clearCart = () => setCart([]);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return <CartContext.Provider value={{ cart, addToCart, ... }}>{children}</CartContext.Provider>;
}

// 커스텀 훅 — CartProvider 밖에서 호출하면 에러 발생
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart는 CartProvider 안에서만 사용 가능');
  return context;
}
```

### 기초: Provider를 앱 전체에 적용하는 방법

```tsx
// app/providers.tsx — Client Component ('use client' 경계)
'use client';
import { CartProvider } from '@/lib/cart-context';

export default function Providers({ children }) {
  return <CartProvider>{children}</CartProvider>;
}

// app/layout.tsx — Server Component가 Client Provider를 감싸는 패턴
import Providers from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Providers>           {/* Client 경계 */}
          <div className="app-wrapper">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
```

> **왜 providers.tsx를 분리하는가?** layout.tsx는 Server Component입니다. Server Component 안에 `'use client'` Provider를 직접 쓸 수 없어서, Client Component를 별도 파일로 만들어 감쌉니다.

### 기초: [실습 8] addToCart 구현 원리

```tsx
// lib/cart-context.tsx — addToCart
const addToCart = (product: Omit<CartItem, 'quantity'>) => {
  setCart((prev) => {
    // 1. 이미 있는 상품인지 확인
    const existing = prev.find((i) => i.productId === product.productId);

    if (existing) {
      // 2a. 있으면 quantity +1 (불변성: map으로 새 배열 생성)
      return prev.map((i) =>
        i.productId === product.productId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
    }
    // 2b. 없으면 quantity: 1로 새로 추가
    return [...prev, { ...product, quantity: 1 }];
  });
};
```

**핵심:** `setCart(prev => ...)` 함수형 업데이트 패턴
- `prev`: 현재 상태의 최신 값 (클로저 문제 방지)
- 항상 새 배열을 반환 — **불변성(Immutability)** 유지
- 1주차의 `setProducts(data)` 와 같은 React 불변성 패턴

### 기초: [실습 9] AddToCartButton

```tsx
// components/AddToCartButton.tsx
'use client';

export default function AddToCartButton({ product }) {
  // [실습 9-a] useCart로 addToCart 가져오기
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  // [실습 9-b] 클릭 → 담기 → 1.5초 후 버튼 복원
  const handleAddToCart = () => {
    addToCart(product);        // Context 상태 업데이트 → localStorage 자동 저장
    setAdded(true);            // 버튼 텍스트 "담기 완료 ✓"
    setTimeout(() => setAdded(false), 1500); // 1.5초 후 복원
  };

  return (
    <button onClick={handleAddToCart} disabled={added}>
      {added ? '담기 완료 ✓' : '장바구니 담기'}
    </button>
  );
}
```

### 기초: [실습 10] 장바구니 페이지

```tsx
// app/cart/page.tsx
'use client'; // localStorage 접근 + 이벤트 핸들러 필요

export default function CartPage() {
  // [실습 10-a] useCart로 필요한 값 가져오기
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

  // [실습 10-b] 결제 핸들러
  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });
    if (res.ok) {
      clearCart();           // localStorage 장바구니 비우기
      router.push('/orders'); // 주문 목록으로 이동
    }
  };

  return (
    <div>
      {cart.map((item) => (
        <div key={item.productId}>
          <p>{item.productName}</p>

          {/* 수량 조절 */}
          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>

          {/* 소계 */}
          <p>{(item.price * item.quantity).toLocaleString()}원</p>

          {/* 삭제 */}
          <button onClick={() => removeFromCart(item.productId)}>✕</button>
        </div>
      ))}

      <p>총 금액: {totalPrice.toLocaleString()}원</p>
      <button onClick={handleCheckout}>결제하기</button>
    </div>
  );
}
```

### 심화: localStorage + Context 데이터 흐름

```
장바구니 담기 클릭
  → addToCart(product) 호출
  → setCart(prev => [...]) → React 상태 업데이트
  → useEffect([cart]) 실행
  → localStorage.setItem('cart', JSON.stringify(cart))

새로고침
  → CartProvider 마운트
  → useState(() => localStorage.getItem('cart')) → 복원
  → 장바구니 유지됨 ✓

결제 완료
  → clearCart() → setCart([])
  → useEffect([cart]) → localStorage.setItem('cart', '[]')
  → localStorage 초기화 ✓
```

### 심화: TO-BE — BE 연동 체크포인트

```
현재 (Mock):
  CartPage → POST /api/checkout → Mock 응답 반환 → /orders

TO-BE (BE 완성 후):
  1. BE에 POST /orders/batch 엔드포인트 추가
     또는 개별 POST /orders를 Promise.all로 병렬 호출
  2. app/api/checkout/route.ts 수정:
     주석 처리된 실제 BE 호출 코드 활성화
  3. app/orders/page.tsx:
     Mock 데이터 → getMyOrders(token) 실제 호출로 교체
```

```ts
// app/api/checkout/route.ts — TO-BE 부분 (현재 주석 처리됨)
const orders = await Promise.all(
  items.map((item) =>
    fetch(`${process.env.BACKEND_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    }).then((r) => r.json())
  )
);
```

---

## 9. 배포

### 기초: 환경변수

```bash
# .env.local (로컬 개발용, git에 올리면 안 됨)
BACKEND_URL=http://localhost:8080

# NEXT_PUBLIC_ 접두사 = 클라이언트(브라우저)에서도 접근 가능
# 민감한 정보는 절대 NEXT_PUBLIC_ 사용 금지
NEXT_PUBLIC_APP_NAME=CNU 쇼핑몰
```

```ts
// 서버 코드에서만 접근 가능 (안전)
const url = process.env.BACKEND_URL;

// 클라이언트에서도 접근 가능 (공개 정보만)
const appName = process.env.NEXT_PUBLIC_APP_NAME;
```

### 기초: Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포 (GitHub 연동 시 push할 때마다 자동 배포)
vercel

# 환경변수 설정
vercel env add BACKEND_URL
```

Vercel은 Next.js를 만든 회사입니다. App Router의 모든 기능을 완벽하게 지원합니다.

### 심화: 프로덕션 체크리스트

```
□ .env.local이 .gitignore에 있는지 확인
□ BACKEND_URL이 프로덕션 서버 주소인지 확인
□ 쿠키에 Secure; SameSite=Strict 옵션 추가
□ next build 로컬에서 성공하는지 확인
□ BE 서버의 CORS에 프로덕션 도메인 허용
```

---

## 10. 실습 가이드

### 실습 순서 & TODO 체크리스트

총 10개의 실습을 순서대로 진행합니다.

| 번호      | 파일                           | 핵심 개념                            |
| --------- | ------------------------------ | ------------------------------------ |
| [실습 1]  | `lib/api.ts`                   | fetch + ISR 캐시 전략                |
| [실습 2]  | `proxy.ts`                     | 쿠키 읽기 + 리다이렉트 (**Next.js 16**: `middleware.ts` → `proxy.ts`) |
| [실습 3]  | `app/login/page.tsx`           | 'use client' + 쿠키 저장             |
| [실습 4]  | `lib/auth-server.ts`           | cookies() + Server Component 인증    |
| [실습 5]  | `app/shop/page.tsx`            | Server Component + Promise.all       |
| [실습 6]  | `app/api/orders/route.ts`      | Route Handler + 쿠키 + BE 호출       |
| [실습 7]  | `app/orders/page.tsx`          | SSR + 주문 목록                      |
| [실습 8]  | `lib/cart-context.tsx`         | Context + useState + localStorage    |
| [실습 9]  | `components/AddToCartButton.tsx` | useCart 훅 + 클릭 피드백           |
| [실습 10] | `app/cart/page.tsx`            | 수량 조절 + 결제 핸들러              |

---

### [실습 1] lib/api.ts — API 함수 구현

**목표:** BE API 호출 함수를 ISR/SSR 캐시 전략에 맞게 구현

```ts
// lib/api.ts
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

// ──────────────────────────────────────────────────────────────
// [실습 1-a] 상품 검색 API (ISR — 60초 캐시)
// 힌트: next: { revalidate: 60 } 옵션 사용
// ──────────────────────────────────────────────────────────────
export async function searchProducts(query: string, display = 12) {
  const res = await fetch(
    `${BACKEND_URL}/shop/search?query=${encodeURIComponent(query)}&display=${display}`,
    {
      /* TODO: ISR 60초 캐시 옵션 */
    },
  );
  if (!res.ok) throw new Error("상품 검색 실패");
  return res.json() as Promise<ShoppingItem[]>;
}

// ──────────────────────────────────────────────────────────────
// [실습 1-b] 주문 목록 API (SSR — 캐시 없음)
// 힌트: cache: 'no-store' 옵션 사용
// ──────────────────────────────────────────────────────────────
export async function getMyOrders(token: string) {
  const res = await fetch(`${BACKEND_URL}/orders/me`, {
    /* TODO: SSR 옵션 (항상 최신 데이터) */
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("주문 목록 조회 실패");
  return res.json() as Promise<Order[]>;
}
```

**✅ 모범 정답:**

```ts
// [실습 1-a]
{
  next: {
    revalidate: 60;
  }
}

// [실습 1-b]
{
  cache: "no-store";
}
```

**📝 해설:**

```
ISR (next: { revalidate: 60 }):
  - 첫 요청 시 데이터 패칭 + HTML 생성 후 캐싱
  - 60초 이내 요청: 캐시된 HTML 즉시 반환 (빠름)
  - 60초 후: 백그라운드에서 새 데이터로 재생성
  - 상품 목록처럼 자주 바뀌지 않는 데이터에 적합

SSR (cache: 'no-store'):
  - 매 요청마다 새로 데이터 패칭 + HTML 생성
  - 항상 최신 데이터 보장
  - 주문 목록처럼 사용자마다 다르고 최신이어야 하는 데이터에 적합
```

---

### [실습 2] proxy.ts — 라우트 보호

> **[Next.js 16 변경]** 파일명 `middleware.ts` → `proxy.ts`, 함수명 `middleware` → `proxy`

**목표:** 미인증 사용자를 /login으로, 로그인된 사용자가 /login 접근 시 /shop으로 리다이렉트

```ts
// proxy.ts  ← [Next.js 16] middleware.ts에서 이름이 바뀜
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // ──────────────────────────────────────────────────────────
  // [실습 2-a] 쿠키에서 'token' 값 읽기
  // 힌트: request.cookies.get('token')?.value
  // ──────────────────────────────────────────────────────────
  const token = /* TODO */;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // ──────────────────────────────────────────────────────────
  // [실습 2-b] 조건별 리다이렉트 구현
  // 1. 토큰 없음 + 로그인 페이지 아님 → /login으로 리다이렉트
  // 2. 토큰 있음 + 로그인 페이지 → /shop으로 리다이렉트
  // ──────────────────────────────────────────────────────────
  // TODO: 조건 1 구현

  // TODO: 조건 2 구현

  return NextResponse.next();
}

export const config = {
  matcher: ['/shop/:path*', '/orders/:path*', '/login'],
};
```

**✅ 모범 정답:**

```ts
const token = request.cookies.get("token")?.value;

if (!token && !isLoginPage) {
  return NextResponse.redirect(new URL("/login", request.url));
}

if (token && isLoginPage) {
  return NextResponse.redirect(new URL("/shop", request.url));
}
```

**📝 해설:**

```
request.cookies.get('token')?.value:
  - get('token'): Cookie 객체 또는 undefined 반환
  - ?.value: Cookie가 있으면 값 추출, 없으면 undefined

NextResponse.redirect(new URL('/login', request.url)):
  - new URL('/login', request.url): 현재 요청의 origin 기준으로 절대 URL 생성
  - 예: http://localhost:3000/shop → http://localhost:3000/login

로직:
  - 토큰 없고 보호된 경로 접근 → /login으로 보냄
  - 토큰 있고 /login 접근 → /shop으로 보냄 (이미 로그인됨)
  - 나머지 → NextResponse.next()로 통과
```

---

### [실습 3] app/login/page.tsx — 로그인 폼

**목표:** 'use client' 폼 + 토큰을 쿠키에 저장

```tsx
// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { findUserByName, signUpUser, loginUser } from "@/lib/api";

export default function LoginPage() {
  // ──────────────────────────────────────────────────────────
  // [실습 3-a] 3가지 상태를 useState로 선언하세요
  // - name: 이름 입력값 (초기값: '')
  // - email: 이메일 입력값 (초기값: '')
  // - error: 오류 메시지 (초기값: null)
  // ──────────────────────────────────────────────────────────
  const [name, setName] = useState(/* TODO */);
  const [email, setEmail] = useState(/* TODO */);
  const [error, setError] = useState(/* TODO */);
  const [loading, setLoading] = useState(false);
  const [needEmail, setNeedEmail] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let foundUser = await findUserByName(name.trim());

      if (!foundUser) {
        if (!email) {
          setNeedEmail(true);
          throw new Error("처음 방문이시군요! 이메일을 입력해주세요");
        }
        foundUser = await signUpUser(name.trim(), email.trim());
      }

      const { token } = await loginUser(foundUser.id);

      // ──────────────────────────────────────────────────────
      // [실습 3-b] 토큰을 쿠키에 저장하세요
      // 힌트: document.cookie = `token=${token}; path=/; max-age=3600`
      // ──────────────────────────────────────────────────────
      /* TODO: 쿠키에 토큰 저장 */

      router.push("/shop");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  // ... return (JSX)
}
```

**✅ 모범 정답:**

```ts
// [실습 3-a]
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [error, setError] = useState<string | null>(null);

// [실습 3-b]
document.cookie = `token=${token}; path=/; max-age=3600`;
```

**📝 해설:**

```
useState 초기값:
  - name, email: '' (빈 문자열) — null이면 input value={null} 경고 발생
  - error: null — 오류가 없을 땐 null, 있을 땐 문자열

document.cookie = `token=${token}; path=/; max-age=3600`:
  - path=/: 사이트 모든 경로에서 쿠키 사용
  - max-age=3600: 3600초(1시간) 후 자동 만료
  - HttpOnly 없음: 이 실습에서는 JS에서 설정해야 하므로 생략
    (실무에서는 BE에서 Set-Cookie 헤더로 HttpOnly 설정)

router.push('/shop'):
  - 1주차: setUser(user) 후 조건부 렌더링
  - 2주차: 페이지 이동 방식 → 쿠키가 있으면 middleware가 허용
```

---

### [실습 4] lib/auth-server.ts — 서버 인증 헬퍼

**목표:** Server Component에서 쿠키를 읽는 헬퍼 함수 구현

```ts
// lib/auth-server.ts
import { cookies } from "next/headers";
import { getMe as fetchMe } from "./api";

// ──────────────────────────────────────────────────────────────
// [실습 4] 쿠키에서 토큰 꺼내기
// 힌트: cookies()는 async 함수, get('token')?.value
// ──────────────────────────────────────────────────────────────
export async function getTokenFromCookie(): Promise<string | null> {
  // TODO: await cookies()로 cookieStore 가져온 후 'token' 값 반환
  // 없으면 null 반환
}

export async function getMe(token: string) {
  return fetchMe(token);
}
```

**✅ 모범 정답:**

```ts
export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value ?? null;
}
```

**📝 해설:**

```
cookies():
  - next/headers의 함수. Server Component, Route Handler에서만 사용 가능
  - async 함수이므로 await 필요 (Next.js 15+)
  - 클라이언트 코드에서 호출하면 에러 발생

cookieStore.get('token')?.value ?? null:
  - get('token'): { name: 'token', value: '...' } | undefined
  - ?.value: 값 추출 또는 undefined
  - ?? null: undefined면 null로 변환 (타입 일관성)
```

---

### [실습 5] app/shop/page.tsx — 상품 목록 SSR

**목표:** Server Component에서 인증 확인 + 병렬 데이터 패칭

```tsx
// app/shop/page.tsx
import { redirect } from 'next/navigation';
import { getTokenFromCookie, getMe } from '@/lib/auth-server';
import { searchProducts } from '@/lib/api';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params.query ?? '맥북';

  // ──────────────────────────────────────────────────────────
  // [실습 5-a] 토큰 확인 + 없으면 /login으로 리다이렉트
  // 힌트: getTokenFromCookie() + redirect('/login')
  // ──────────────────────────────────────────────────────────
  const token = /* TODO: 쿠키에서 토큰 가져오기 */;
  if (!token) {
    /* TODO: /login으로 리다이렉트 */
  }

  // ──────────────────────────────────────────────────────────
  // [실습 5-b] user 정보와 products를 병렬로 가져오기
  // 힌트: Promise.all([getMe(token), searchProducts(query)])
  // ──────────────────────────────────────────────────────────
  const [user, products] = await /* TODO: 병렬 패칭 */;

  return (
    <div>
      <header className="header">
        <h1>CNU 쇼핑몰</h1>
        <div className="header-user">
          <span>안녕하세요, {user.name}님!</span>
          <LogoutButton />
        </div>
      </header>
      {/* ... */}
    </div>
  );
}
```

**✅ 모범 정답:**

```ts
// [실습 5-a]
const token = await getTokenFromCookie();
if (!token) redirect("/login");

// [실습 5-b]
const [user, products] = await Promise.all([
  getMe(token),
  searchProducts(query),
]);
```

**📝 해설:**

```
redirect('/login'):
  - next/navigation의 함수
  - Server Component에서 즉시 리다이렉트 (예외를 throw하는 방식)
  - try/catch 안에서 사용하면 catch에 잡힘 주의

Promise.all vs 순차 실행:
  순차: getMe(200ms) + searchProducts(300ms) = 500ms
  병렬: max(200ms, 300ms) = 300ms

  독립적인 두 API는 병렬로 호출하세요.
  단, getMe 결과에 따라 searchProducts를 호출해야 한다면 순차로.
```

---

### [실습 6] app/api/orders/route.ts — 주문 Route Handler

**목표:** 서버에서 쿠키 읽어 BE에 주문 API 요청

```ts
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  // ──────────────────────────────────────────────────────────
  // [실습 6-a] 서버에서 쿠키로부터 토큰 읽기
  // 힌트: await cookies() → .get('token')?.value
  // ──────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = /* TODO */;

  if (!token) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const body = await request.json();

  // ──────────────────────────────────────────────────────────
  // [실습 6-b] BE API 호출
  // POST http://localhost:8080/orders
  // headers: { Authorization: `Bearer ${token}` }
  // body: JSON.stringify(body)
  // ──────────────────────────────────────────────────────────
  const response = await fetch(`${process.env.BACKEND_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      /* TODO: Authorization 헤더 추가 */,
    },
    body: /* TODO */,
  });

  const order = await response.json();
  return NextResponse.json(order, { status: 201 });
}
```

**✅ 모범 정답:**

```ts
// [실습 6-a]
const token = cookieStore.get('token')?.value;

// [실습 6-b]
headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
},
body: JSON.stringify(body),
```

---

### [실습 7] app/orders/page.tsx — 주문 목록

**목표:** SSR로 사용자의 주문 내역 표시

```tsx
// app/orders/page.tsx
import { redirect } from 'next/navigation';
import { getTokenFromCookie } from '@/lib/auth-server';
import { getMyOrders } from '@/lib/api';

export default async function OrdersPage() {
  // ──────────────────────────────────────────────────────────
  // [실습 7-a] 토큰 확인
  // ──────────────────────────────────────────────────────────
  const token = /* TODO */;
  if (!token) redirect('/login');

  // ──────────────────────────────────────────────────────────
  // [실습 7-b] 주문 목록 가져오기
  // ──────────────────────────────────────────────────────────
  const orders = await /* TODO: getMyOrders(token) */;

  return (
    <div className="main">
      <h2>내 주문 목록</h2>
      {orders.length === 0 ? (
        <p className="empty-state">주문 내역이 없습니다.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>{order.productName}</h3>
              <p>{Number(order.price).toLocaleString()}원</p>
              <p>{new Date(order.orderedAt).toLocaleDateString('ko-KR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**✅ 모범 정답:**

```ts
const token = await getTokenFromCookie();
const orders = await getMyOrders(token);
```

---

### BE API 명세

```
# 1주차와 동일
POST /users              { name, email }    → { id, name, email }
GET  /users/search       ?name=홍길동      → User[]
POST /users/login        { userId }         → { token }
GET  /users/me           Authorization      → User
GET  /shop/search        ?query=&display=   → ShoppingItem[]

# 2주차 추가
POST /orders             Authorization      → Order
                         { productId, productName, price, quantity }
GET  /orders/me          Authorization      → Order[]
```

> BE API 미완성 시: `app/api/orders/route.ts`에서 Mock 데이터 반환으로 대체 가능

### 완성 목표 화면

```
/login
┌─────────────────────────┐
│   CNU 쇼핑몰 로그인      │
│   이름: [홍길동     ]    │
│         [로그인]         │
└─────────────────────────┘

/shop  (SSR — 서버에서 렌더링, URL: /shop?query=맥북)
┌─────────────────────────────────┐
│ CNU 쇼핑몰  안녕하세요, 홍길동님! [로그아웃] │
│ [맥북        ] [검색]           │
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │ 상품 │ │ 상품 │ │ 상품 │     │
│ │[구매]│ │[구매]│ │[구매]│     │
│ └──────┘ └──────┘ └──────┘     │
└─────────────────────────────────┘

/orders  (SSR — 사용자별 최신 데이터)
┌─────────────────────────┐
│ 내 주문 목록             │
│ ─────────────────────── │
│ MacBook Pro             │
│ 3,200,000원 | 2024.3.5 │
└─────────────────────────┘
```

---

## 11. 트러블슈팅

### [오류 1] `cookies() should be awaited`

```
Error: cookies() should be awaited before using its value.
```

**원인:** Next.js 15에서 `cookies()`가 async 함수로 변경됨.

```ts
// 틀림 (이전 버전 방식)
const cookieStore = cookies();

// 올바름
const cookieStore = await cookies();
```

---

### [오류 2] `useRouter is not a function` 또는 훅 관련 에러

```
Error: You're importing a component that needs useRouter. It only works in a Client Component.
```

**원인:** Server Component에서 React 훅 또는 `next/navigation`의 클라이언트 훅 사용.

```tsx
// 틀림 — Server Component에서 useRouter 사용
async function ShopPage() {
  const router = useRouter(); // ❌ 서버에서 실행 불가
}

// 올바름 — Server Component에서 리다이렉트
import { redirect } from "next/navigation"; // ✅ 서버용 redirect
async function ShopPage() {
  if (!token) redirect("/login");
}
```

---

### [오류 3] 로그인 후 /shop으로 이동 안 됨 (계속 /login에 머뭄)

**원인 체크리스트:**

```
□ 실습 3-b: document.cookie = `token=...` 가 실행되는지 확인
  → 브라우저 개발자 도구 → Application → Cookies → localhost 확인

□ proxy.ts의 조건이 올바른지 확인 (Next.js 16: middleware.ts → proxy.ts)
  → token이 있는데 /login에서 /shop으로 리다이렉트 안 되는 경우

□ router.push('/shop')이 쿠키 저장 후 실행되는지 확인
  → document.cookie 설정 라인이 router.push 앞에 있어야 함
```

---

### [오류 4] Server Component에서 `window is not defined`

**원인:** Server Component에서 브라우저 전용 API 사용.

```tsx
// 틀림 — Server Component에서 window 접근
async function Page() {
  const token = window.localStorage.getItem("token"); // ❌ 서버에 window 없음
}

// 올바름 — Server Component에서 쿠키 사용
import { cookies } from "next/headers";
async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value; // ✅
}
```

---

### [오류 5] `TypeError: Cannot destructure property 'name' of null`

**원인:** `getMe()` 실패 후 user가 null인 상태에서 구조분해.

```tsx
// 문제 상황
const [user, products] = await Promise.all([
  getMe(token),
  searchProducts(query),
]);
// user가 null이면 → {user.name} 에서 에러

// 해결: token 유효성 먼저 확인
const token = await getTokenFromCookie();
if (!token) redirect("/login"); // ← 여기서 함수 종료

// 이 시점에서 token은 반드시 string
const [user, products] = await Promise.all([
  getMe(token), // token이 string임이 보장됨
  searchProducts(query),
]);
```

---

### [오류 6] API Route에서 `fetch` 실패 (BE 연결 안 됨)

**원인 체크리스트:**

```
□ BE 서버가 실행 중인지 확인: ./gradlew bootRun
□ .env.local 파일에 BACKEND_URL=http://localhost:8080 있는지 확인
□ .env.local 변경 후 Next.js 서버 재시작 필요 (npm run dev 재실행)
□ BE 미완성 시 Mock 데이터로 대체:

  // app/api/orders/route.ts
  export async function GET() {
    return NextResponse.json([
      {
        id: 1,
        productName: 'MacBook Pro (Mock)',
        price: 3200000,
        quantity: 1,
        orderedAt: new Date().toISOString(),
      },
    ]);
  }
```

---

## 핵심 정리

| 개념             | 한 줄 요약                                   | 연결 파일                |
| ---------------- | -------------------------------------------- | ------------------------ |
| Server Component | 서버에서 실행. async 가능. useState 불가     | shop/page, orders/page   |
| Client Component | `'use client'`. useState/이벤트 가능         | login/page, SearchBar    |
| SSR              | `cache: 'no-store'`. 매 요청마다 최신 렌더링 | orders/page              |
| ISR              | `next: { revalidate: N }`. 주기적 갱신       | lib/api (searchProducts) |
| Middleware       | 요청 전 실행. 쿠키 확인 + 리다이렉트         | proxy.ts (Next.js 16)    |
| Route Handler    | `app/api/*/route.ts`. Next.js 내장 API       | api/orders/route.ts      |
| Cookie           | 서버/클라이언트 모두 접근 가능한 토큰 저장소 | login/page, auth-server  |
| Promise.all      | 독립적인 여러 fetch를 병렬로 실행            | shop/page                |

### 1주차(React) vs 2주차(Next.js) 전체 비교

| 항목        | Week 1 (React)                           | Week 2 (Next.js)                            |
| ----------- | ---------------------------------------- | ------------------------------------------- |
| 렌더링      | CSR (브라우저)                           | SSR/ISR (서버) + CSR 혼합                   |
| 데이터 패칭 | `useEffect` + `useState`                 | Server Component의 `await fetch`            |
| 토큰 저장   | `localStorage`                           | Cookie (`document.cookie`)                  |
| 토큰 읽기   | `localStorage.getItem()`                 | `cookies()` (서버) / 자동 전송 (클라이언트) |
| 라우팅      | 조건부 렌더링 (`isLoggedIn ? ... : ...`) | 파일 기반 라우팅 + `redirect()`             |
| 라우트 보호 | 없음 (클라이언트에서 조건부)             | Middleware (요청 전 서버에서 차단)          |
| API 보안    | BE URL 클라이언트에 노출                 | 서버 환경변수 + Route Handler               |
| SEO         | 불리 (빈 HTML)                           | 유리 (완성된 HTML)                          |
