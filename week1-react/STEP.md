# Step 04: 커스텀 훅 — useAuth

> **브랜치:** `week1/step-04`
> **수정 파일:** `src/hooks/useAuth.js`

---

## 학습 목표

- React 커스텀 훅의 개념과 만드는 방법을 이해한다.
- 인증 상태(로그인/로그아웃)를 훅으로 캡슐화하는 패턴을 익힌다.
- `localStorage`와 React 상태(`useState`)를 함께 사용하는 방법을 구현한다.

---

## 핵심 개념 설명

### 커스텀 훅이란?

`useState`, `useEffect` 등 React 훅을 조합해 **재사용 가능한 로직**을 만드는 함수다.
반드시 이름이 `use`로 시작해야 한다.

```js
// ❌ 컴포넌트 안에 인증 로직 직접 구현 → 재사용 불가
function App() {
  const [user, setUser] = useState(null);
  const login = async (name, email) => { /* 긴 로직 */ };
  ...
}

// ✅ 커스텀 훅으로 분리 → 어느 컴포넌트에서든 재사용 가능
function App() {
  const { user, isLoggedIn, login, logout } = useAuth();
  ...
}
```

### localStorage + useState 동기화

```
앱 시작 → localStorage에 token 있음?
  → 있음: getMe(token) 호출 → user 상태 복원
  → 없음: user = null → 로그인 화면 표시

로그인 성공 → localStorage.setItem('token', token) + setUser(foundUser)
로그아웃    → localStorage.removeItem('token') + setUser(null)
```

---

## 프로젝트 구조

```
src/
├── api/
│   ├── client.js       ✅ Step 01 완성
│   ├── auth.js         ✅ Step 02 완성
│   └── shop.js         ✅ Step 03 완성
├── hooks/
│   └── useAuth.js      📝 이번 Step — 인증 상태 커스텀 훅
└── components/
    ├── LoginForm.jsx
    └── ProductList.jsx
```

---

## 주요 코드

```js
// src/hooks/useAuth.js

export function useAuth() {
  const [user, setUser] = useState(null);

  // 앱 시작 시 토큰이 있으면 유저 정보 복원
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe().then(setUser).catch(() => localStorage.removeItem('token'));
    }
  }, []);

  const login = async (name, email) => {
    let foundUser = await findUserByName(name);
    if (!foundUser) {
      if (!email) throw new Error('처음 방문이시군요! 이메일을 입력해주세요');
      foundUser = await signUp(name, email);
    }
    const { token } = await loginWithUserId(foundUser.id); // ← [실습 4-b]
    localStorage.setItem('token', token);                   // ← [실습 4-b]
    setUser(foundUser);                                     // ← [실습 4-b]
  };

  const logout = () => {
    localStorage.removeItem('token');  // ← [실습 4-c]
    setUser(null);                     // ← [실습 4-c]
  };

  return { user, isLoggedIn: !!user, login, logout };
}
```

**핵심 포인트:**
- `isLoggedIn: !!user` — `user`가 `null`이면 `false`, 객체이면 `true`로 변환.
- 반환값만 보면 컴포넌트는 내부 구현을 몰라도 된다.

---

## 프로젝트 실행법

```bash
cd week1-react
npm install      # 최초 1회
npm run dev      # 개발 서버 시작
```

브라우저에서 `http://localhost:3000` 접속.

---

## 확인할 것들

1. **구현 전:** 로그인 후 새로고침 시 다시 로그인 화면으로 돌아가는지 확인
2. **구현 후:** 새로고침해도 로그인 상태 유지 확인 (localStorage에서 복원)
3. **Application 탭:** 로그아웃 후 Local Storage에서 `token` 삭제 확인
4. **React DevTools:** `useAuth` 훅의 `user` 상태 변화 실시간 확인

---

## 핵심 정리

> **커스텀 훅(`useAuth`)은 인증과 관련된 모든 로직을 한 곳에 모아 컴포넌트를 단순하게 만든다. localStorage와 React 상태를 함께 관리하는 이 패턴은 Week 2(Next.js)에서 localStorage 대신 쿠키 + 서버 쿠키 읽기로 대체된다.**
