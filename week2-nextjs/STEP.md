# Step 03: 로그인 페이지 — Client Component

> **브랜치:** `week2/step-03`
> **수정 파일:** `app/login/page.tsx`

---

## 학습 목표

- 언제 `'use client'`를 선언해야 하는지 이해한다.
- Next.js에서 `localStorage` 대신 `document.cookie`로 토큰을 저장하는 이유를 이해한다.
- Week 1 `LoginForm.jsx`와 Week 2 `login/page.tsx`의 구조를 비교한다.

---

## 핵심 개념 설명

### 언제 'use client'가 필요한가?

Next.js App Router의 모든 컴포넌트는 기본적으로 **Server Component**다.
아래 중 하나라도 해당되면 `'use client'`를 선언해야 한다.

| 필요한 경우 | 예시 |
|---|---|
| React 상태 | `useState`, `useReducer` |
| 생명주기 | `useEffect` |
| 이벤트 핸들러 | `onClick`, `onSubmit` |
| 브라우저 API | `document`, `window`, `localStorage` |

로그인 페이지는 폼 입력(`useState`) + 제출 핸들러(`onSubmit`) → **Client Component 필요**.

### 왜 document.cookie를 쓰는가?

```ts
// ❌ localStorage — 브라우저 전용, 서버에서 읽기 불가
localStorage.setItem('token', token);

// ✅ 쿠키 — 브라우저 + 서버 모두 접근 가능
document.cookie = `token=${token}; path=/; max-age=3600`;
```

쿠키를 설정하면 이후 모든 HTTP 요청에 자동으로 포함되어 `proxy.ts`와 서버 컴포넌트에서 읽을 수 있다.

---

## 프로젝트 구조

```
week2-nextjs/
├── proxy.ts              ✅ Step 02 완성
├── lib/
│   ├── auth.ts           ✅ Step 01 완성
│   └── api.ts
└── app/
    ├── login/
    │   └── page.tsx      📝 이번 Step — 로그인 폼 Client Component
    ├── shop/page.tsx
    └── orders/page.tsx
```

---

## 주요 코드

```tsx
// app/login/page.tsx

'use client'; // ← useState, 이벤트 핸들러 사용 선언

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');       // ← [실습 3-a]
  const [email, setEmail] = useState('');     // ← [실습 3-a]
  const [error, setError] = useState<string | null>(null); // ← [실습 3-a]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... 로그인 로직 ...
    const { token } = await loginUser(user.id);
    document.cookie = `token=${token}; path=/; max-age=3600`; // ← [실습 3-b]
    router.push('/shop');
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Week 1 vs Week 2 비교:**

| | Week 1 (LoginForm.jsx) | Week 2 (login/page.tsx) |
|---|---|---|
| 토큰 저장 | `localStorage.setItem(...)` | `document.cookie = ...` |
| 페이지 이동 | props 콜백 | `router.push('/shop')` |
| 파일 구조 | 컴포넌트 폴더 | App Router 페이지 |

---

## 프로젝트 실행법

```bash
cd week2-nextjs
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

---

## 확인할 것들

1. **구현 전:** 로그인 폼에 타이핑해도 값이 안 바뀌는지 확인
2. **구현 후:** 로그인 성공 → Application → Cookies → `token` 쿠키 저장 확인
3. **비교:** Week 1의 `LoginForm.jsx`와 이 파일의 구조가 어떻게 유사한지 확인
4. **`'use client'` 제거 후** 어떤 에러가 발생하는지 실험

---

## 핵심 정리

> **`'use client'`는 Server Component가 기본인 Next.js에서 브라우저 기능이 필요한 컴포넌트임을 선언한다. 토큰을 `document.cookie`로 저장하면 이후 요청마다 서버에 자동 전송되어 `proxy.ts`와 서버 컴포넌트가 인증을 처리할 수 있다.**
