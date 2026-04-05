# Week 2 사전 지식 — Next.js 16 App Router (SSR/ISR)

> **대상:** Week 1(React CSR)을 마친 학생
> **목표:** Week 2 실습(Step 01~10)을 이해하는 데 필요한 개념을 Week 1과 비교하며 익힌다

---

## 목차

1. [CSR vs SSR — 무엇이 다른가](#1-csr-vs-ssr--무엇이-다른가)
2. [Next.js App Router 구조](#2-nextjs-app-router-구조)
3. [Server Component vs Client Component](#3-server-component-vs-client-component)
4. [쿠키 vs localStorage](#4-쿠키-vs-localstorage)
5. [미들웨어 — 라우트 보호](#5-미들웨어--라우트-보호)
6. [서버에서 데이터 가져오기](#6-서버에서-데이터-가져오기)
7. [Route Handler — API 엔드포인트 만들기](#7-route-handler--api-엔드포인트-만들기)
8. [Context API — 전역 상태 공유](#8-context-api--전역-상태-공유)
9. [TypeScript 기초](#9-typescript-기초)

---

## 1. CSR vs SSR — 무엇이 다른가

### Week 1과 Week 2의 차이

```
[Week 1 — CSR (Client Side Rendering)]
① 브라우저가 빈 HTML + JS 파일을 받음
② JS가 브라우저에서 실행됨
③ JS가 화면을 만듦 (DOM 생성)
④ 데이터가 필요하면 fetch()로 API 호출

→ 처음 화면이 잠깐 비어있음
→ 검색엔진이 내용을 읽기 어려움

[Week 2 — SSR (Server Side Rendering)]
① 브라우저가 서버에 요청
② 서버에서 데이터를 미리 받아오고 HTML을 완성
③ 완성된 HTML을 브라우저로 전송
④ 브라우저는 받은 내용을 바로 표시

→ 처음부터 내용이 보임
→ 검색엔진이 내용을 잘 읽음
→ 서버에서 인증 처리 가능
```

### 비유로 이해하기

```
CSR: 재료(JS)를 배달받아서 집(브라우저)에서 요리하는 것
     → 재료 받기까지 기다려야 함

SSR: 음식점(서버)에서 요리가 완성된 상태로 배달해주는 것
     → 바로 먹을 수 있음
```

### 데이터 패칭 방식 비교

| | Week 1 (CSR) | Week 2 (SSR) |
|--|--|--|
| 데이터 가져오는 곳 | 브라우저 | 서버 |
| 코드 방식 | `useEffect` + `useState` | `async/await` 직접 사용 |
| 로딩 상태 | 필요 (`loading: true`) | 불필요 (서버가 완성 후 전송) |
| 인증 위치 | JS 조건문 | 미들웨어 + 서버 |

---

## 2. Next.js App Router 구조

### 파일 경로 = URL 경로

Next.js는 **파일 위치가 곧 URL**이 된다. 별도 라우터 설정이 필요 없다.

```
app/
├── page.tsx           → 접속 주소: /
├── login/
│   └── page.tsx       → 접속 주소: /login
├── shop/
│   └── page.tsx       → 접속 주소: /shop
├── cart/
│   └── page.tsx       → 접속 주소: /cart
└── orders/
    └── page.tsx       → 접속 주소: /orders
```

`app/shop/page.tsx` 파일을 만들면 `/shop` URL에서 그 컴포넌트가 렌더링된다.

```tsx
// app/shop/page.tsx — /shop 접속 시 이 컴포넌트가 화면에 나타남
export default function ShopPage() {
  return <h1>상품 목록</h1>;
}
```

### 특수 파일들

| 파일명 | 역할 |
|--------|------|
| `page.tsx` | 해당 경로의 메인 화면 |
| `layout.tsx` | 여러 페이지에 공통으로 씌워지는 틀 (헤더, 푸터 등) |
| `loading.tsx` | 페이지 로딩 중에 보여줄 화면 |
| `error.tsx` | 에러 발생 시 보여줄 화면 |
| `route.ts` | API 엔드포인트 (화면 없이 데이터만 반환) |

### layout.tsx — 공통 틀

```tsx
// app/layout.tsx — 모든 페이지에 공통으로 적용
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />        {/* 모든 페이지 상단에 헤더 */}
        <main>{children}</main> {/* page.tsx 내용이 여기 들어감 */}
        <Footer />
      </body>
    </html>
  );
}
```

### URL 파라미터와 쿼리스트링

```
// 동적 경로: app/shop/[id]/page.tsx
// 접속: /shop/42 → params.id = "42"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <h1>상품 ID: {params.id}</h1>;
}
```

```tsx
// 쿼리스트링: /shop?query=맥북
export default function ShopPage({ searchParams }: { searchParams: { query?: string } }) {
  const query = searchParams?.query ?? '맥북'; // 없으면 기본값 '맥북'
  return <h1>{query} 검색 결과</h1>;
}
```

---

## 3. Server Component vs Client Component

### 두 가지 종류의 컴포넌트

Next.js App Router에서 모든 컴포넌트는 기본적으로 **Server Component**다.
브라우저 기능이 필요할 때만 `'use client'`를 선언해 **Client Component**로 만든다.

| | Server Component | Client Component |
|--|--|--|
| **선언 방법** | 기본값 (아무것도 안 써도 됨) | 파일 맨 위에 `'use client'` |
| **실행 위치** | 서버 | 브라우저 |
| **useState, useEffect** | ❌ 사용 불가 | ✅ 사용 가능 |
| **이벤트 핸들러 (onClick 등)** | ❌ 사용 불가 | ✅ 사용 가능 |
| **localStorage, document** | ❌ 사용 불가 | ✅ 사용 가능 |
| **쿠키/헤더 직접 읽기** | ✅ 가능 | ❌ 불가 |
| **async/await 바로 사용** | ✅ 가능 | ❌ (useEffect 필요) |

### 언제 'use client'를 써야 하는가?

다음 중 하나라도 필요하면 `'use client'` 선언이 필요하다.

```tsx
'use client'; // 파일 맨 위에 선언

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [name, setName] = useState(''); // ← 상태 관리 → use client 필요
  // onClick, onChange 등 이벤트 핸들러 → use client 필요
  // localStorage, document.cookie → use client 필요
}
```

### 실습에서 어떤 파일이 어느 쪽인가

```
Server Component (기본, 'use client' 없음):
  app/shop/page.tsx        → 상품 목록: 서버에서 데이터 받아 HTML 완성
  app/orders/page.tsx      → 주문 목록: 서버에서 데이터 받아 HTML 완성

Client Component ('use client' 있음):
  app/login/page.tsx       → 로그인 폼: useState, onSubmit 이벤트 필요
  components/AddToCartButton.tsx → 버튼 클릭 이벤트 필요
  lib/cart-context.tsx     → useState, localStorage 필요
```

### Server Component의 강점 — async/await 바로 사용

Week 1과 Week 2의 데이터 패칭 방식을 비교해보자.

```jsx
// Week 1 방식 — Client Component (브라우저에서 실행)
function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchProducts(query)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>로딩 중...</p>;
  return <ul>{products.map(...)}</ul>;
}
```

```tsx
// Week 2 방식 — Server Component (서버에서 실행)
async function ShopPage({ searchParams }) {
  // async/await을 컴포넌트에서 바로 사용!
  const products = await searchProducts(searchParams.query);

  // 로딩 상태가 필요 없음 — 서버가 완성 후 전송
  return <ul>{products.map(...)}</ul>;
}
```

Server Component는 서버에서 실행되므로 데이터가 준비된 상태로 HTML을 완성해서 브라우저에 보낸다.

---

## 4. 쿠키 vs localStorage

### Week 1에서 localStorage를 쓴 이유와 한계

Week 1에서는 JWT 토큰을 localStorage에 저장했다.

```
문제: localStorage는 브라우저에서만 접근 가능
→ 서버(Server Component)에서 토큰을 읽을 수 없음
→ 미들웨어에서 인증 확인 불가
→ 페이지 접근 전 서버에서 로그인 체크 불가능
```

### Week 2에서 쿠키를 쓰는 이유

```
쿠키의 특징:
- 브라우저와 서버 모두에서 접근 가능
- HTTP 요청마다 자동으로 서버에 전송됨
- 서버 컴포넌트, 미들웨어에서 바로 읽을 수 있음
```

```
[localStorage]
브라우저 ←→ 브라우저만 (서버 접근 불가)

[쿠키]
브라우저 ←→ 서버 (요청마다 자동 전송)
```

### 쿠키 저장 — Client Component에서

```tsx
// app/login/page.tsx — 로그인 성공 후 쿠키에 토큰 저장
const { token } = await loginUser(user.id);

document.cookie = `token=${token}; path=/; max-age=3600`;
//                                  ↑          ↑
//                             모든 경로    3600초(1시간) 후 만료
```

### 쿠키 읽기 — Server Component에서

```tsx
// lib/auth-server.ts
import { cookies } from 'next/headers'; // 서버 전용 API

export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
  //                  ↑             ↑
  //            토큰 쿠키 찾기   없으면 undefined
}
```

`cookies()`는 서버에서만 쓸 수 있다. Client Component에서 호출하면 에러가 난다.

### Week 1 vs Week 2 토큰 처리 비교

```
Week 1 토큰 저장:   localStorage.setItem('token', token)
Week 2 토큰 저장:   document.cookie = `token=${token}; path=/; max-age=3600`

Week 1 토큰 읽기:   localStorage.getItem('token')
Week 2 토큰 읽기:   (await cookies()).get('token')?.value
```

구조는 비슷하지만, 쿠키는 서버에서도 읽을 수 있다는 게 핵심 차이다.

---

## 5. 미들웨어 — 라우트 보호

### 미들웨어란?

HTTP 요청이 실제 페이지에 도달하기 **전에** 가로채서 처리하는 코드다.

```
브라우저 → [proxy.ts 미들웨어] → 페이지 컴포넌트
                ↓
          토큰 없으면 /login으로 리다이렉트
          토큰 있으면 통과
```

Week 1에서는 각 컴포넌트 안에서 로그인 여부를 체크했다면, Week 2에서는 **미들웨어가 일괄 처리**한다.

### Next.js 16의 proxy.ts

Next.js 16에서는 `middleware.ts` 파일 대신 `proxy.ts`를 사용하며, `proxy` 함수를 export한다.

```ts
// proxy.ts (프로젝트 루트)

import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // 요청의 쿠키에서 토큰 읽기
  const { pathname } = request.nextUrl;              // 현재 URL 경로

  const protectedPaths = ['/shop', '/cart', '/orders'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // 보호된 경로인데 토큰이 없으면 → 로그인 페이지로 이동
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 이미 로그인한 상태에서 로그인 페이지 접근 → 쇼핑 페이지로 이동
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/shop', request.url));
  }

  return NextResponse.next(); // 아무 문제 없으면 통과
}

// 미들웨어가 실행될 경로 지정 (여기 해당하는 경로만 미들웨어를 통과)
export const config = {
  matcher: ['/shop/:path*', '/cart/:path*', '/orders/:path*', '/login'],
};
```

---

## 6. 서버에서 데이터 가져오기

### async Server Component

Server Component는 `async` 함수로 만들 수 있다. 컴포넌트 안에서 바로 `await`을 쓴다.

```tsx
// app/shop/page.tsx
import { redirect } from 'next/navigation';
import { getTokenFromCookie } from '@/lib/auth-server';
import { getMe, searchProducts } from '@/lib/api';

export default async function ShopPage({ searchParams }) {
  const query = searchParams?.query ?? '맥북';

  // 1. 토큰 확인 — 없으면 로그인 페이지로 보냄
  const token = await getTokenFromCookie();
  if (!token) redirect('/login');

  // 2. 데이터 가져오기 — 서버에서 백엔드 API 직접 호출
  const [user, products] = await Promise.all([
    getMe(token),
    searchProducts(query),
  ]);

  // 3. 완성된 HTML 반환 — 브라우저는 로딩 없이 바로 표시
  return (
    <div>
      <p>안녕하세요, {user.name}님!</p>
      {products.map((p) => (
        <ProductCard key={p.productId} product={p} />
      ))}
    </div>
  );
}
```

### Promise.all — 여러 API를 동시에 호출

```ts
// ❌ 순차 실행 — 느림
const user = await getMe(token);             // 200ms 기다림
const products = await searchProducts(query); // 그 후 300ms 기다림
// 총 500ms

// ✅ 병렬 실행 — 빠름
const [user, products] = await Promise.all([
  getMe(token),          // 두 요청을 동시에 시작
  searchProducts(query), //
]);
// 총 300ms (더 오래 걸리는 쪽 기준)
```

두 API가 서로 독립적일 때(앞 결과가 뒤에 필요하지 않을 때) `Promise.all`을 쓴다.

### 서버에서 리다이렉트

```tsx
import { redirect } from 'next/navigation';

// 서버에서 조건에 따라 다른 페이지로 보낼 수 있음
const token = await getTokenFromCookie();
if (!token) {
  redirect('/login'); // 307 리다이렉트 응답 → 브라우저가 /login으로 이동
}
```

---

## 7. Route Handler — API 엔드포인트 만들기

### Route Handler란?

`app/api/` 경로에 `route.ts` 파일을 만들면 **서버 API 엔드포인트**가 된다.
화면 없이 JSON 데이터만 반환한다.

```
app/
└── api/
    └── orders/
        └── route.ts   → GET /api/orders, POST /api/orders
```

### 왜 Route Handler가 필요한가?

```
문제 상황:
Client Component(브라우저)에서 백엔드를 직접 호출하면?
→ CORS(Cross-Origin Resource Sharing) 에러 발생
→ 브라우저 보안 정책: 다른 도메인으로의 직접 요청 차단

해결:
브라우저 → /api/orders (Next.js Route Handler) → 백엔드 서버
         같은 도메인이므로 CORS 없음
```

### 기본 구조

```ts
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/orders → 주문 목록 조회
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  // 백엔드 서버에 요청 (서버끼리 통신이므로 CORS 없음)
  const res = await fetch(`${process.env.BACKEND_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  return NextResponse.json(data); // JSON으로 응답
}

// POST /api/orders → 주문 생성
export async function POST(request: NextRequest) {
  const body = await request.json(); // 요청 body 파싱
  // ... 주문 생성 처리
  return NextResponse.json({ success: true }, { status: 201 });
}
```

---

## 8. Context API — 전역 상태 공유

### 왜 Context가 필요한가 — Prop Drilling 문제

장바구니 데이터가 여러 컴포넌트에서 필요하다면?

```
Layout
├── Header → 장바구니 아이템 수(뱃지)가 필요
├── ShopPage
│   └── ProductCard
│       └── AddToCartButton → addToCart() 함수가 필요
└── CartPage → 장바구니 전체 목록이 필요
```

Props로만 전달하면 모든 중간 단계를 거쳐야 한다. 이를 **Prop Drilling**이라 한다.

```
Layout(cart 전달) → ShopPage(cart 전달) → ProductCard(cart 전달) → AddToCartButton(겨우 사용)
```

Context를 쓰면 중간을 건너뛰고 **어느 깊이에서든 바로 꺼내 쓸 수 있다**.

### Context 만들기 — 3단계

**1단계: Context 생성**

```tsx
// lib/cart-context.tsx
'use client'; // Context는 브라우저에서 동작

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null); // 빈 Context 생성
```

**2단계: Provider — 상태를 제공하는 컴포넌트**

```tsx
export function CartProvider({ children }: { children: React.ReactNode }) {
  // localStorage에서 초기값 복원 (lazy initializer: 함수로 전달하면 처음 한 번만 실행)
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []; // 서버 환경이면 빈 배열
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // cart가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        // 이미 있으면 수량 증가
        return prev.map((i) =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      // 없으면 새로 추가
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children} {/* Provider 안의 모든 컴포넌트가 cart, addToCart 사용 가능 */}
    </CartContext.Provider>
  );
}
```

**3단계: 커스텀 훅으로 쉽게 사용**

```tsx
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('CartProvider 안에서만 사용 가능합니다');
  return context;
}
```

### Provider로 앱 전체 감싸기

```tsx
// app/layout.tsx
import { CartProvider } from '@/lib/cart-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartProvider>        {/* 이 안의 모든 컴포넌트에서 useCart() 사용 가능 */}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
```

### Context 사용하기

```tsx
// components/AddToCartButton.tsx
'use client';

import { useCart } from '@/lib/cart-context';

export function AddToCartButton({ product }) {
  const { addToCart } = useCart(); // 어느 depth에서든 바로 꺼내서 사용

  return (
    <button onClick={() => addToCart(product)}>
      장바구니 담기
    </button>
  );
}
```

---

## 9. TypeScript 기초

Week 2는 TypeScript를 사용한다. JavaScript에 **타입**을 추가한 언어로, 오타와 타입 관련 버그를 코드 작성 시점에 잡아준다.

### 기본 타입 표기

```ts
// 변수에 타입 지정
const name: string = '김철수';
const age: number = 21;
const isLoggedIn: boolean = true;

// 없을 수도 있는 값: | undefined 또는 | null 추가
const token: string | undefined = getToken();
const error: string | null = null;

// 함수 파라미터와 반환 타입
function greet(name: string): string {
  return `안녕하세요, ${name}님!`;
}

// 반환값이 없는 함수
function logout(): void {
  localStorage.removeItem('token');
}
```

### 인터페이스 — 객체의 구조 정의

```ts
// 타입 정의
interface Product {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string; // ?는 있어도 되고 없어도 되는 필드
}

// 배열 타입
const products: Product[] = [];

// 함수 파라미터에 타입 적용
function showProduct(product: Product) {
  console.log(`${product.name}: ${product.price}원`);
}
```

### React 컴포넌트에서 TypeScript

```tsx
// Props 타입 정의
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean; // 선택적 prop
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// children을 받는 컴포넌트
interface LayoutProps {
  children: React.ReactNode;
}

// useState에 타입 지정
const [user, setUser] = useState<User | null>(null);
const [products, setProducts] = useState<Product[]>([]);
const [error, setError] = useState<string | null>(null);
```

### 자주 보이는 타입 패턴

```ts
// Promise를 반환하는 비동기 함수
async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

// React 이벤트 타입
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

---

## Week 2 전체 흐름 정리

```
HTTP 요청 시작
      ↓
proxy.ts (미들웨어)
  - 쿠키에서 토큰 확인
  - 없으면 /login 리다이렉트
  - 있으면 통과
      ↓
Server Component (page.tsx)
  - cookies()로 토큰 읽기
  - 백엔드 API 직접 호출 (async/await)
  - 완성된 HTML 브라우저로 전송
      ↓
Client Component ('use client')
  - 버튼 클릭, 폼 입력 등 인터랙션 처리
  - /api/* Route Handler 호출 (CORS 우회)
  - useCart() 등 Context에서 전역 상태 사용
```

### Week 1 → Week 2 변화 한눈에 보기

| 항목 | Week 1 (React CSR) | Week 2 (Next.js SSR) |
|------|-------------------|---------------------|
| 렌더링 위치 | 브라우저 | 서버 |
| 토큰 저장 | `localStorage` | 쿠키 (`document.cookie`) |
| 토큰 읽기 | `localStorage.getItem()` | `cookies().get()` |
| 라우트 보호 | 컴포넌트 안 조건문 | `proxy.ts` 미들웨어 |
| 데이터 패칭 | `useEffect` + `useState` | `async` Server Component |
| 로딩 상태 | 필요 (`loading: true`) | 불필요 |
| 페이지 이동 | props 콜백 | `router.push()` / `redirect()` |
| 전역 상태 | props로 전달 | Context API |
| API 엔드포인트 | 없음 | Route Handler (`app/api/`) |
