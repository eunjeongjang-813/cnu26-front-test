# Step 04: 서버 API 함수 — BACKEND_URL 직접 호출

> **브랜치:** `week2/step-04`
> **수정 파일:** `lib/api.ts`

---

## 학습 목표

- Server Component에서 백엔드 API를 **직접** 호출하는 패턴을 구현한다.
- `BACKEND_URL` 환경변수가 클라이언트에 노출되지 않는 이유를 이해한다.
- ISR(`revalidate`)과 SSR(`cache: 'no-store'`)의 차이를 이해한다.

---

## 핵심 개념 설명

### 서버에서 직접 호출 vs 클라이언트에서 호출

```
Week 1 (클라이언트):
브라우저 → /api/shop/search → Vite proxy → localhost:8080
                              (CORS 우회 필요)

Week 2 (서버):
Server Component → http://localhost:8080/shop/search
                   (같은 서버 → CORS 없음, 환경변수 안전)
```

### ISR vs SSR

```ts
// ISR: 60초 캐시 → 자주 안 바뀌는 데이터 (상품 검색)
fetch(url, { next: { revalidate: 60 } })

// SSR: 매 요청마다 새로 가져옴 → 사용자별 데이터 (내 정보, 주문)
fetch(url, { cache: 'no-store' })
```

| 방식 | 캐시 | 적합한 데이터 |
|---|---|---|
| ISR (`revalidate: N`) | N초마다 갱신 | 상품 목록, 카테고리 |
| SSR (`no-store`) | 캐시 안 함 | 사용자 정보, 주문 내역 |
| SSG (기본) | 빌드 시 1회 | 약관, 회사 소개 |

---

## 프로젝트 구조

```
week2-nextjs/
├── proxy.ts              ✅ Step 02 완성
├── lib/
│   ├── auth.ts           ✅ Step 01 완성
│   └── api.ts            📝 이번 Step — BE API 함수 (searchProducts, getMe)
└── app/
    ├── login/page.tsx    ✅ Step 03 완성
    ├── shop/page.tsx
    └── orders/page.tsx
```

---

## 주요 코드

```ts
// lib/api.ts

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';
// ↑ NEXT_PUBLIC_ 접두사 없음 → 서버에서만 접근 가능 (클라이언트 번들에 포함 안 됨)

export async function searchProducts(query: string, display = 12) {
  const res = await fetch(
    `${BACKEND_URL}/shop/search?query=${encodeURIComponent(query)}&display=${display}`,
    { next: { revalidate: 60 } } // ← ISR: 60초 캐시
  );
  if (!res.ok) throw new Error('상품 검색 실패');
  return res.json();
}

export async function getMe(token: string) {
  const res = await fetch(`${BACKEND_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store', // ← SSR: 항상 최신
  });
  if (!res.ok) throw new Error('사용자 정보 조회 실패');
  return res.json();
}
```

---

## 프로젝트 실행법

```bash
cd week2-nextjs
cp .env.local.example .env.local   # BACKEND_URL=http://localhost:8080
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

---

## 확인할 것들

1. `.env.local`에 `BACKEND_URL=http://localhost:8080` 설정 확인
2. **구현 후:** 브라우저 소스 보기 → `BACKEND_URL` 값이 노출되지 않는지 확인
3. **ISR 테스트:** 상품 데이터를 백엔드에서 바꾼 후 60초 내에는 캐시된 결과가 나오는지 확인
4. `NEXT_PUBLIC_` 없이 선언한 환경변수를 클라이언트 컴포넌트에서 쓰면 어떻게 되는지 실험

---

## 핵심 정리

> **`BACKEND_URL`은 `NEXT_PUBLIC_` 접두사 없이 선언되므로 서버에서만 접근 가능하다. `revalidate`와 `no-store`를 적절히 선택하면 성능(캐시)과 정확성(최신 데이터)을 동시에 얻을 수 있다. 이것이 Next.js의 핵심 가치다.**
