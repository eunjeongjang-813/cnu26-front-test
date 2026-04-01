# Step 04: 서버 API 함수 — BACKEND_URL 직접 호출

> **브랜치:** `week2/step-04`
> **수정 파일:** `lib/api.ts`

---

## 학습 목표

- Server Component에서 백엔드 API를 **직접** 호출하는 패턴을 구현한다.
- `BACKEND_URL` 환경변수가 클라이언트에 노출되지 않는 이유를 이해한다.
- SSR, ISR, SSG의 차이를 이해하고 데이터 성격에 맞게 선택한다.
- CSR 방식과 비교해 서버 호출 방식의 장단점을 파악한다.

---

## 핵심 개념 설명

### 1. 렌더링 전략 — SSR / ISR / SSG / CSR

Next.js는 페이지마다, 심지어 **fetch 요청마다** 렌더링 전략을 다르게 선택할 수 있다.
이것이 Next.js의 가장 강력한 기능이다.

#### 네 가지 전략 한눈에 보기

```
SSG  Static Site Generation   빌드 시 딱 한 번 HTML 생성 → 이후 변경 없음
 │
ISR  Incremental Static        SSG와 동일하지만, N초마다 백그라운드에서 재생성
     Regeneration              → 캐시를 유지하면서 최신성도 확보
 │
SSR  Server Side Rendering     요청이 올 때마다 서버에서 HTML 새로 생성
 │                             → 항상 최신, 캐시 없음
CSR  Client Side Rendering     브라우저(클라이언트)에서 JS로 HTML 생성
                               → Week 1 방식
```

#### 비유로 이해하기

```
SSG: 책을 출판하는 것. 인쇄한 후에는 내용이 바뀌지 않는다.
ISR: 매일 발행하는 신문. 하루에 한 번씩 새 버전 인쇄.
SSR: 손으로 그리는 그림. 요청이 올 때마다 새로 그린다.
CSR: 재료를 배달받아 손님이 직접 요리. 서버는 재료(JS)만 줌.
```

#### Next.js의 fetch 옵션으로 전략 선택

```ts
// SSG: 빌드 시 1회만 실행 (기본값 — 아무 옵션도 없을 때)
fetch(url)
fetch(url, { cache: 'force-cache' })

// ISR: 60초마다 백그라운드에서 재검증
fetch(url, { next: { revalidate: 60 } })

// SSR: 캐시 없이 매 요청마다 새로 호출
fetch(url, { cache: 'no-store' })
```

> **주의:** CSR은 Server Component에서 사용할 수 없다. CSR은 브라우저의 `useEffect` 안에서 `fetch()`를 호출하는 방식이다.

---

### 2. 어떤 데이터에 어떤 전략을?

| 데이터 종류 | 전략 | 이유 |
|------------|------|------|
| 회사 소개, 이용약관 | SSG | 거의 변하지 않음. 빌드 시 1회로 충분 |
| 상품 목록, 카테고리 | ISR | 가끔 바뀜. 캐시로 성능 확보 + 주기적 갱신 |
| 내 정보, 주문 내역 | SSR | 사용자마다 다름, 항상 최신이어야 함 |
| 실시간 재고, 알림 | CSR | 페이지 진입 후에도 계속 바뀜. 브라우저에서 폴링 |

---

### 3. SSR / ISR 실제 동작 흐름

#### SSR — 매 요청마다 새로 생성

```
[사용자 1] GET /orders
     ↓
  서버: 백엔드 API 호출 → 데이터 조회
     ↓
  서버: HTML 완성
     ↓
  사용자 1에게 HTML 전송 (내 주문 데이터 포함)

[사용자 2] GET /orders (10ms 후)
     ↓
  서버: 백엔드 API 다시 호출 → 사용자 2의 데이터 조회
     ↓
  사용자 2에게 HTML 전송 (다른 주문 데이터)

→ 요청마다 새로 실행되므로 항상 최신 데이터
→ 캐시가 없어 백엔드 부하는 높음
```

#### ISR — 캐시 + 주기적 재검증

```
[최초 요청] GET /shop
     ↓
  서버: 백엔드 API 호출 → HTML 생성 → 캐시에 저장
     ↓
  사용자에게 HTML 전송

[60초 이내 재요청] GET /shop
     ↓
  서버: 캐시에서 바로 응답 (백엔드 호출 없음!) → 빠름

[60초 후 재요청] GET /shop
     ↓
  서버: 일단 캐시된 HTML을 먼저 응답 (사용자는 기다리지 않음)
     ↓
  백그라운드에서 백엔드 재호출 → 캐시 갱신

→ 성능(빠른 응답)과 최신성(주기적 갱신)을 동시에 확보
→ 상품 목록처럼 가끔씩 바뀌는 데이터에 최적
```

---

### 4. 환경변수 — 서버 전용 vs 클라이언트 공개

#### 환경변수란?

코드에 직접 쓰지 않고 **외부 설정 파일**에서 주입하는 값이다.
URL, API 키, 시크릿 등 환경마다 달라지거나 외부에 노출되면 안 되는 값을 관리한다.

```
개발 환경: BACKEND_URL=http://localhost:8080
운영 환경: BACKEND_URL=https://api.myservice.com

→ 코드 변경 없이 환경변수만 바꾸면 됨
```

#### Next.js의 두 가지 환경변수

```
BACKEND_URL=http://localhost:8080          ← 서버 전용
NEXT_PUBLIC_SOMETHING=공개해도_되는_값     ← 클라이언트에도 노출
```

Next.js는 **빌드 시** 환경변수를 번들에 포함한다. `NEXT_PUBLIC_` 접두사가 없으면 서버 코드에서만 접근 가능하고, 클라이언트 JS 번들에는 포함되지 않는다.

```
NEXT_PUBLIC_ 없음:
  서버 코드(Server Component, Route Handler, proxy.ts): ✅ 접근 가능
  클라이언트 코드('use client' 컴포넌트):              ❌ undefined 반환

NEXT_PUBLIC_ 있음:
  서버 코드: ✅ 접근 가능
  클라이언트 코드: ✅ 접근 가능 (JS 번들에 포함되어 노출됨)
```

#### 왜 BACKEND_URL을 클라이언트에 노출하면 안 되는가?

```
시나리오: NEXT_PUBLIC_BACKEND_URL=https://api.myservice.com 으로 설정했을 때

1. JS 번들에 https://api.myservice.com이 그대로 포함됨
2. 브라우저 개발자 도구 → Sources에서 누구나 볼 수 있음
3. 악의적인 사용자가 백엔드 API를 직접 공격할 수 있음
4. 내부 네트워크 구조가 노출됨

→ BACKEND_URL은 서버에서만 알아야 하는 정보
→ NEXT_PUBLIC_ 없이 서버에서만 사용하는 게 맞다
```

#### .env.local 파일 설정

```bash
# week2-nextjs/.env.local (이 파일은 .gitignore에 포함 — 절대 커밋하지 않음)
BACKEND_URL=http://localhost:8080
```

```bash
# .env.local.example (커밋 가능 — 실제 값은 없는 템플릿)
BACKEND_URL=http://localhost:8080  # 실제 백엔드 URL로 교체
```

---

### 5. 서버 호출 vs CSR 호출 비교

#### 방식 1 — Server Component (Week 2 방식)

서버에서 직접 백엔드를 호출한 뒤, 완성된 HTML을 내려보낸다.

```tsx
// app/shop/page.tsx — Server Component (기본값, 'use client' 없음)
import { searchProducts } from '@/lib/api';

export default async function ShopPage() {
  // 서버에서 직접 백엔드 호출 (CORS 없음, BACKEND_URL 사용)
  const products = await searchProducts('맥북');

  // 데이터가 이미 있으므로 로딩 상태 불필요
  return (
    <ul>
      {products.map((p) => (
        <li key={p.productId}>{p.name}</li>
      ))}
    </ul>
  );
}
```

```
흐름: 브라우저 → Next.js 서버 → 백엔드 API
장점: 로딩 없이 바로 화면 표시, BACKEND_URL 노출 없음, CORS 없음
단점: 사용자 인터랙션에 반응하며 실시간으로 바뀌는 데이터엔 부적합
```

#### 방식 2 — Client Component + useEffect (CSR, Week 1 방식)

브라우저에서 JS가 실행된 뒤 직접 API를 호출한다.

```tsx
'use client';
import { useState, useEffect } from 'react';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 브라우저에서 호출 → CORS 문제 존재
    // 직접 백엔드를 호출하면 안 됨 → /api/* Route Handler를 통해야 함
    fetch('/api/shop/search?query=맥북')
      .then((res) => res.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>로딩 중...</p>;
  return (
    <ul>
      {products.map((p) => (
        <li key={p.productId}>{p.name}</li>
      ))}
    </ul>
  );
}
```

```
흐름: 브라우저 → /api/shop/search (Route Handler) → 백엔드 API
장점: 사용자 인터랙션에 즉각 반응 (검색어 실시간 변경 등)
단점: 초기 로딩 화면 필요, BACKEND_URL 노출 위험, CORS 우회 필요
```

#### 방식 선택 기준

```
페이지 진입 시 바로 보여줘야 하는 데이터  → Server Component (SSR/ISR)
버튼 클릭, 실시간 검색 등 인터랙션       → Client Component (CSR)
두 가지 혼합 (진입 시 기본 데이터 + 실시간 갱신) → Server Component + Client Component 조합
```

---

## 프로젝트 구조

```
week2-nextjs/
├── .env.local              ← BACKEND_URL 설정 (서버 전용, .gitignore 포함)
├── .env.local.example      ← 템플릿 (커밋 가능)
├── proxy.ts                ✅ Step 02 완성
├── lib/
│   ├── auth-server.ts      ✅ Step 01 완성
│   └── api.ts              📝 이번 Step — BE API 함수 (searchProducts, getMe)
└── app/
    ├── login/page.tsx      ✅ Step 03 완성
    ├── shop/page.tsx       ← Step 05에서 사용
    └── orders/page.tsx     ← Step 07에서 사용
```

---

## 주요 코드

```ts
// lib/api.ts

// NEXT_PUBLIC_ 없음 → 서버에서만 접근 가능
// 클라이언트 번들에 포함되지 않아 안전
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

// ISR: 상품 데이터 — 자주 안 바뀌므로 60초 캐시
// 60초 동안 같은 요청이 오면 백엔드 재호출 없이 캐시에서 응답
export async function searchProducts(query: string, display = 12) {
  const res = await fetch(
    `${BACKEND_URL}/shop/search?query=${encodeURIComponent(query)}&display=${display}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error('상품 검색 실패');
  return res.json();
}

// SSR: 사용자 정보 — 사용자마다 다르고 항상 최신이어야 함
// cache: 'no-store' → 캐시 없이 매 요청마다 백엔드 재호출
export async function getMe(token: string) {
  const res = await fetch(`${BACKEND_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('사용자 정보 조회 실패');
  return res.json();
}
```

---

## 프로젝트 실행법

```bash
cd week2-nextjs
cp .env.local.example .env.local   # 환경변수 파일 생성
# .env.local 파일을 열어 BACKEND_URL 확인 (기본: http://localhost:8080)
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

---

## 확인할 것들

1. `.env.local`에 `BACKEND_URL=http://localhost:8080` 설정 확인
2. **보안 확인:** 브라우저 개발자 도구 → Network → JS 번들 파일 검색 → `BACKEND_URL` 값이 없는지 확인
3. **ISR 테스트:** 백엔드에서 상품 데이터를 바꾼 후 60초 이내 재요청 → 캐시된 이전 결과가 나오는지 확인
4. **실험:** `NEXT_PUBLIC_` 없는 환경변수를 `'use client'` 컴포넌트에서 접근하면 `undefined`가 되는지 확인

---

## 핵심 정리

> **`BACKEND_URL`은 `NEXT_PUBLIC_` 접두사 없이 선언되므로 서버 코드에서만 접근 가능하고 클라이언트 번들에 포함되지 않는다.**
>
> **Server Component의 `fetch()`에 `revalidate`(ISR)와 `no-store`(SSR)를 적절히 선택하면, 성능(캐시)과 정확성(최신 데이터)을 데이터 성격에 맞게 조합할 수 있다.**
>
> **CSR(useEffect)은 서버에서 가져오기 어려운 실시간·인터랙티브 데이터에, SSR/ISR은 페이지 진입 시 바로 보여야 하는 데이터에 사용한다.**
