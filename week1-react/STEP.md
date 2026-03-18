# Step 02: 인증 API 함수 — 회원가입 & 로그인

> 브랜치: `week1/step-02`

## 학습 목표
- REST API POST 요청을 함수로 추상화하는 방법을 익힌다
- 회원가입/로그인 플로우를 이해한다

## 핵심 개념
- `post(path, body)`: client.js의 공통 POST 함수
- JWT 발급 흐름: userId → POST /users/login → { token }

## 구현

`src/api/auth.js`의 TODO 2곳을 완성하세요:

1. 회원가입:
```js
return post('/users', { name, email });
```

2. 로그인 (토큰 발급):
```js
return post('/users/login', { userId });
```

## 전체 흐름

```
findUserByName(name) → 없으면 signUp(name, email)
→ loginWithUserId(user.id) → { token }
→ localStorage.setItem('token', token)
```

## 이번 Step 에서 수정된 파일
- `src/api/auth.js` — 인증 관련 API 함수 (회원가입, 로그인)

## 생각해볼 점
- 왜 로그인 API는 비밀번호 대신 userId를 사용할까?
- `post()` 함수 내부에서 `JSON.stringify(body)`를 하는 이유는?
