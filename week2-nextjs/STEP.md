# Step 04: 서버 API 함수 — BACKEND_URL로 직접 호출

> 브랜치: `week2/step-04`

## 학습 목표
- Server Component에서 백엔드 API를 직접 호출하는 패턴을 익힌다
- ISR(Incremental Static Regeneration)의 `revalidate` 옵션을 이해한다
- `cache: 'no-store'` vs `revalidate`의 차이를 이해한다

## 핵심 개념
- `BACKEND_URL`: 서버 전용 환경변수 (클라이언트에 노출 X)
- `next: { revalidate: 60 }`: 60초마다 캐시 갱신 (ISR)
- `cache: 'no-store'`: 매 요청마다 새로 가져옴 (사용자별 데이터)

## 구현

`lib/api.ts`의 TODO 2곳을 완성하세요:

```ts
// 4-a: 상품 검색 (ISR)
const res = await fetch(
  `${BACKEND_URL}/shop/search?query=${encodeURIComponent(query)}&display=${display}`,
  { next: { revalidate: 60 } }
);
if (!res.ok) throw new Error('상품 검색 실패');
return res.json();

// 4-b: 내 정보 (SSR, 항상 최신)
const res = await fetch(`${BACKEND_URL}/users/me`, {
  headers: { Authorization: `Bearer ${token}` },
  cache: 'no-store',
});
if (!res.ok) throw new Error('사용자 정보 조회 실패');
return res.json();
```

## 전체 흐름

```
Server Component → searchProducts('맥북')
→ fetch(`http://localhost:8080/shop/search?query=...`, { revalidate: 60 })
→ Next.js 캐시 확인 → 60초 이내면 캐시 반환, 아니면 BE 호출
```

## 이번 Step 에서 수정된 파일
- `lib/api.ts` — 서버 사이드 API 호출 함수 모음

## 생각해볼 점
- `BACKEND_URL`에 `NEXT_PUBLIC_` 접두사가 없는 이유는?
- 상품 검색은 ISR, 사용자 정보는 `no-store`인 이유는?
