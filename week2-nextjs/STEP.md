# Step 07: 주문 목록 페이지 — Server Component SSR

> 브랜치: `week2/step-07`

## 학습 목표
- Server Component에서 인증이 필요한 데이터를 SSR로 가져오는 패턴을 익힌다
- Step 05(ShopPage)와 같은 패턴의 반복으로 SSR을 체득한다

## 핵심 개념
- `cache: 'no-store'` in `getMyOrders`: 사용자별 개인 데이터는 캐시하면 안 됨
- Server Component + async/await: 데이터 패칭이 서버에서 완료된 후 HTML 전송

## 구현

`app/orders/page.tsx`의 TODO 2곳을 완성하세요:

```ts
// 7-a: 토큰 확인
const token = await getTokenFromCookie();
if (!token) redirect('/login');

// 7-b: 주문 목록 가져오기
const orders = await getMyOrders(token);
```

## 전체 흐름

```
브라우저 → GET /orders
→ proxy.ts: 쿠키 확인 통과
→ OrdersPage (Server Component): getTokenFromCookie() + getMyOrders(token)
→ 주문 목록 HTML 렌더링 후 브라우저로 전송
```

## 이번 Step 에서 수정된 파일
- `app/orders/page.tsx` — 주문 목록 페이지 (Server Component)

## 생각해볼 점
- ShopPage(Step 05)와 OrdersPage의 구조가 어떻게 같고 다른가?
- 주문 데이터는 왜 ISR이 아닌 `no-store`(매번 새로 가져옴)를 사용할까?
