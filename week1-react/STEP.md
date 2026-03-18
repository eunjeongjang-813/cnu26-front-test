# Step 01: API 클라이언트 — localStorage 토큰 인증

> 브랜치: `week1/step-01`

## 학습 목표
- localStorage에서 JWT 토큰을 읽는 방법을 이해한다
- 조건부 헤더 추가 패턴(스프레드 + 단축 평가)을 익힌다

## 핵심 개념
- `localStorage.getItem('token')`: 브라우저에 저장된 토큰 읽기
- 스프레드 연산자 `...`와 단축 평가 `&&`로 조건부 헤더 추가

## 구현

`src/api/client.js`의 TODO 2곳을 완성하세요:

1. localStorage에서 토큰 읽기:
```js
const token = localStorage.getItem('token');
```

2. 토큰이 있을 때만 Authorization 헤더 추가:
```js
...(token && { Authorization: `Bearer ${token}` }),
```

## 전체 흐름

```
사용자 로그인 → localStorage에 token 저장
→ 이후 모든 API 요청: client.js가 token을 자동으로 Authorization 헤더에 추가
→ 서버: Bearer 토큰 검증 후 응답
```

## 이번 Step 에서 수정된 파일
- `src/api/client.js` — 공통 HTTP 클라이언트 (토큰 인증 로직)

## 생각해볼 점
- 토큰이 없을 때 (`null`) 헤더에 `Authorization: Bearer null`이 들어가면 어떤 문제가 생길까?
- `&&` 단축 평가로 이를 어떻게 방지하는가?
