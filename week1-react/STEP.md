# Step 04: useAuth 훅 — 로그인 & 로그아웃 상태 관리

> 브랜치: `week1/step-04`

## 학습 목표
- 커스텀 훅으로 인증 상태를 캡슐화하는 패턴을 이해한다
- async/await로 비동기 로그인 플로우를 구현한다
- localStorage와 React 상태를 함께 관리하는 방법을 익힌다

## 핵심 개념
- `useState(null)`: 초기값이 null인 user 상태 (null = 비로그인)
- `async/await`: 비동기 API 호출을 순서대로 처리
- 구조 분해 할당: `const { token } = await loginWithUserId(...)`

## 구현

`src/hooks/useAuth.js`의 TODO 2곳을 완성하세요:

### TODO [실습 4-b]: login 함수 내부

```js
const { token } = await loginWithUserId(foundUser.id);
localStorage.setItem('token', token);
setUser(foundUser);
```

### TODO [실습 4-c]: logout 함수 내부

```js
localStorage.removeItem('token');
setUser(null);
```

## 전체 흐름

```
login(name, email) 호출
→ findUserByName(name) → 없으면 signUp()
→ loginWithUserId(id) → { token }
→ localStorage.setItem('token', token)
→ setUser(foundUser) → 리렌더링 → UI가 로그인 상태로 전환

logout() 호출
→ localStorage.removeItem('token')
→ setUser(null) → 리렌더링 → UI가 로그인 폼으로 전환
```

## 이번 Step 에서 수정된 파일
- `src/hooks/useAuth.js` — 인증 상태 관리 커스텀 훅

## 생각해볼 점
- `setUser(foundUser)` 없이 localStorage에만 저장하면 UI는 어떻게 될까?
- 새로고침 후에도 로그인 상태가 유지되는 이유는? (useEffect 자동복원 로직 참고)
