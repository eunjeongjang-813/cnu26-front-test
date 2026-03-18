# Step 02: 미들웨어 (proxy.ts) — 라우트 보호

> 브랜치: `week2/step-02`

## 학습 목표
- Next.js 미들웨어로 인증 라우트를 보호하는 방법을 이해한다
- 조건부 리다이렉트 패턴을 익힌다

## 핵심 개념
- `proxy.ts` (Next.js 16) = `middleware.ts` (Next.js 15 이하)
- `request.cookies.get('token')?.value`: 요청 쿠키에서 토큰 읽기
- `NextResponse.redirect()`: 서버 측 리다이렉트

## 구현

`proxy.ts`의 TODO 3곳을 완성하세요:

```ts
// 1. 토큰 읽기
const token = request.cookies.get('token')?.value;

// 2. 미인증 → 로그인 페이지로
if (!token && !isLoginPage) {
  return NextResponse.redirect(new URL('/login', request.url));
}

// 3. 인증됨 → 로그인 페이지 접근 차단
if (token && isLoginPage) {
  return NextResponse.redirect(new URL('/shop', request.url));
}
```

## 전체 흐름

```
브라우저 → /shop 요청 → proxy.ts 실행
→ 쿠키에 token 없음 → /login 리다이렉트
→ 쿠키에 token 있음 → 요청 통과 → ShopPage 렌더링
```

## 이번 Step 에서 수정된 파일
- `proxy.ts` — 인증 미들웨어 (모든 보호된 라우트에 자동 적용)

## 생각해볼 점
- `matcher` 배열에 없는 경로(예: `/`)는 미들웨어가 실행되지 않는다. 왜 그렇게 설계했을까?
- 미들웨어에서 DB를 조회하면 어떤 문제가 생길까?
