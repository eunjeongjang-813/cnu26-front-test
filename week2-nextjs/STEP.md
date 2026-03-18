# Step 06: Route Handler — 주문 API 프록시

> 브랜치: `week2/step-06`

## 학습 목표
- Next.js Route Handler(app/api/*/route.ts)의 구조를 이해한다
- Route Handler에서 쿠키를 읽고 인증을 처리하는 방법을 익힌다

## 핵심 개념
- Route Handler: `app/api/*/route.ts`에 HTTP 메서드별 함수를 export
- 서버에서만 실행 → 토큰, 환경변수가 클라이언트에 노출 안 됨
- `cookies()` from `next/headers`: Route Handler에서도 사용 가능

## 구현

`app/api/orders/route.ts`의 TODO를 완성하세요:

```ts
// 6-a: 쿠키에서 토큰 읽기
const cookieStore = await cookies();
const token = cookieStore.get('token')?.value;
```

> 참고: BE가 미완성이므로 실제 주문 저장은 Mock 응답을 반환합니다.
> `/* 실제 BE 완성 후 ... */` 주석 부분은 나중에 교체 예정입니다.

## 전체 흐름

```
CartPage(Client) → POST /api/orders (Route Handler)
→ 쿠키에서 token 읽기 → BE로 프록시 (또는 Mock)
→ 주문 생성 완료 → { id, productId, ... } 반환
```

## 이번 Step 에서 수정된 파일
- `app/api/orders/route.ts` — 주문 생성/조회 Route Handler

## 생각해볼 점
- Client Component에서 직접 백엔드를 호출하지 않고 Route Handler를 거치는 이유는?
- Route Handler와 Server Component의 차이는?
