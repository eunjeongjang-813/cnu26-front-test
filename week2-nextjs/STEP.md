# Step 01: 쿠키에서 JWT 토큰 읽기

> 브랜치: `week2/step-01`

## 학습 목표
- Next.js App Router에서 서버 컴포넌트가 쿠키를 읽는 방법을 이해한다
- `next/headers`의 `cookies()` API 사용법을 익힌다

## 핵심 개념
- `cookies()` from `next/headers`: 서버 컴포넌트 전용 쿠키 접근 API
- Optional chaining `?.value`: 쿠키가 없을 때 undefined 반환
- Week 1에서는 `localStorage.getItem('token')`, Week 2에서는 `cookies()`

## 구현

`lib/auth.ts`의 TODO를 완성하세요:

```ts
const cookieStore = await cookies();
return cookieStore.get('token')?.value;
```

## 전체 흐름

```
브라우저 → 쿠키에 token 포함 → Next.js Server Component
→ getTokenFromCookie() → cookies().get('token')?.value
→ 토큰 문자열 반환 (없으면 undefined)
```

## 이번 Step 에서 수정된 파일
- `lib/auth.ts` — 서버 전용 쿠키 인증 헬퍼

## 생각해볼 점
- 왜 Week 1은 localStorage, Week 2는 쿠키를 사용할까?
- Server Component에서 쿠키를 읽을 수 있는 이유는?
