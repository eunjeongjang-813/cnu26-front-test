# Step 05: Shop 페이지 — Server Component SSR

> 브랜치: `week2/step-05`

## 학습 목표
- `async` Server Component에서 데이터를 SSR로 가져오는 패턴을 익힌다
- `Promise.all`로 여러 API를 병렬 호출하는 방법을 이해한다

## 핵심 개념
- Server Component: `'use client'` 없이 `async/await` 직접 사용 가능
- `redirect()`: 서버에서 조건부 페이지 이동
- `Promise.all([a, b])`: a와 b를 동시에 시작해 둘 다 완료되면 반환

## 구현

`app/shop/page.tsx`의 TODO 2곳을 완성하세요:

```ts
// 5-a: 토큰 확인 및 리다이렉트
const token = await getTokenFromCookie();
if (!token) redirect('/login');

// 5-b: 병렬 데이터 패칭
const [user, products] = await Promise.all([
  getMe(token),
  searchProducts(query),
]);
```

## 전체 흐름

```
브라우저 → GET /shop?query=맥북
→ proxy.ts: 쿠키 확인 통과
→ ShopPage (Server Component): getTokenFromCookie() + Promise.all
→ HTML 렌더링 후 브라우저로 전송
```

## 이번 Step 에서 수정된 파일
- `app/shop/page.tsx` — 상품 목록 페이지 (Server Component)

## 생각해볼 점
- `Promise.all` vs 순차 `await`의 성능 차이는?
- proxy.ts에서 이미 인증을 체크하는데, 왜 ShopPage에서도 다시 체크할까?
