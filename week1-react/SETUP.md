# Week 1: 프로젝트 초기 설정

> **브랜치:** `week1/step-01` ~ `week1/step-06`

---

## 학습 목표

- React + Vite 프로젝트의 기본 구조를 이해한다.
- `npm run dev`로 개발 서버를 실행하고, Vite proxy 설정이 CORS를 어떻게 해결하는지 파악한다.

- `main.jsx` → `App.jsx` → 컴포넌트 계층의 렌더링 흐름을 이해한다.

---

## 핵심 개념 설명

### 왜 React인가?

| 방식 | 특징 |
|---|---|
| **바닐라 JS** | DOM을 직접 조작 → 상태와 UI 동기화가 복잡해짐 |
| **React** | 상태(state)가 바뀌면 UI가 자동으로 다시 그려짐 → 선언적 프로그래밍 |

React는 **컴포넌트** 단위로 UI를 나누고, **상태(state)** 를 기반으로 화면을 그린다. 직접 DOM을 건드리지 않아도 된다.

```
상태 변경 → React가 변경된 부분만 계산(Virtual DOM) → 실제 DOM 업데이트
```

### 왜 Vite인가?

Vite는 Create React App(CRA)을 대체하는 빌드 도구다.

| 항목 | CRA | Vite |
|---|---|---|
| 초기 시작 속도 | 느림 (전체 번들링 후 시작) | 빠름 (필요한 파일만 변환) |
| HMR (파일 수정 반영) | 느림 | 즉각적 |
| 설정 | 숨겨져 있음 | `vite.config.js`에 명시적 |

### 왜 다음 주에 Next.js를 배우는가?

Week 1의 React(Vite)는 **CSR(Client Side Rendering)** 만 지원한다. 브라우저가 JS를 받아서 화면을 그리기 때문에:

- 첫 화면이 늦게 뜬다 (빈 HTML → JS 실행 → 화면 렌더링)
- 검색 엔진이 내용을 인식하기 어렵다 (SEO 불리)
- 서버에서만 써야 할 정보(API 키, DB 접속 정보)가 노출될 수 있다

Next.js(Week 2)는 이 문제를 **SSR / ISR / Server Component** 로 해결한다.

---

## 프로젝트 구조

```
week1-react/
├── vite.config.js          ← Vite 설정 (포트, 프록시)
├── index.html              ← 앱의 유일한 HTML 파일 (SPA 진입점)
├── package.json            ← 의존성 및 스크립트
└── src/
    ├── main.jsx            ← React 앱 최상위 진입점 (DOM 마운트)
    ├── App.jsx             ← 루트 컴포넌트 (로그인/상품목록 분기)
    ├── index.css           ← 전역 스타일
    ├── api/
    │   ├── client.js       ← [실습 1] 공통 HTTP 클라이언트 (토큰 인증)
    │   ├── auth.js         ← [실습 2] 회원가입 / 로그인 API
    │   └── shop.js         ← [실습 3] 상품 검색 API
    ├── hooks/
    │   └── useAuth.js      ← [실습 4] 인증 상태 커스텀 훅
    └── components/
        ├── LoginForm.jsx   ← [실습 5] 로그인 폼
        ├── ProductList.jsx ← [실습 6] 상품 목록 (검색 + 무한 로딩)
        └── ProductCard.jsx ← 상품 카드 (완성 제공)
```

**의존 관계:**

```
main.jsx
  └── App.jsx
        ├── hooks/useAuth.js       (인증 상태 관리)
        ├── components/LoginForm.jsx
        │     └── hooks/useAuth.js (onLogin 콜백)
        └── components/ProductList.jsx
              ├── api/shop.js
              └── components/ProductCard.jsx
```

---

## 주요 코드

### `src/main.jsx` — React 앱 진입점

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- `createRoot(document.getElementById('root'))`: `index.html`의 `<div id="root">`에 React를 연결한다.
- `<StrictMode>`: 개발 환경에서 잠재적 문제를 감지하기 위해 컴포넌트를 두 번 렌더링한다.

### `src/App.jsx` — 루트 컴포넌트

```jsx
export default function App() {
  const { user, isLoggedIn, login, logout } = useAuth();

  return (
    <div className="app">
      <header>...</header>
      <main>
        {isLoggedIn ? <ProductList /> : <LoginForm onLogin={login} />}
      </main>
    </div>
  );
}
```

- `isLoggedIn` 상태 하나로 화면 전체를 분기한다 — React의 **조건부 렌더링** 패턴.

### `vite.config.js` — 프록시 설정

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
},
```

- 브라우저에서 `/api/users/me` 요청 → Vite 개발 서버가 받아서 → `http://localhost:8080/users/me`로 전달
- 브라우저는 같은 오리진(localhost:3000)으로 보내므로 **CORS 없음**
- **Week 2(Next.js)** 에서는 `next.config.ts`의 rewrites가 같은 역할을 한다

---

## 프로젝트 실행법

```bash
# 1. 의존성 설치 (최초 1회)
cd week1-react
npm install

# 2. 개발 서버 실행
npm run dev
```

실행 후 브라우저에서 `http://localhost:3000` 접속.

> **참고:** 백엔드 서버(`localhost:8080`)가 실행 중이어야 로그인 및 상품 검색이 동작한다.

| 명령어 | 용도 |
|---|---|
| `npm run dev` | 개발 서버 (HMR 포함) |
| `npm run build` | 프로덕션 빌드 (`dist/` 폴더 생성) |
| `npm run preview` | 빌드 결과물 로컬 미리보기 |

---

## 확인할 것들

1. **개발 서버 포트 확인:** 콘솔에 `Local: http://localhost:3000` 출력 여부
2. **Vite proxy 동작:** 브라우저 개발자 도구 Network 탭 → `/api/...` 요청이 200으로 오는지 확인
3. **컴포넌트 트리 확인:** React DevTools 브라우저 확장 설치 → Components 탭에서 `App → LoginForm` 계층 확인
4. **실습 파일 위치 확인:** `src/api/client.js`를 열어 `// TODO` 주석을 찾아보자

---

## 핵심 정리

> **React는 상태(state)가 바뀌면 UI를 자동으로 다시 그리는 선언적 UI 라이브러리다. Vite는 빠른 개발 서버와 프록시 기능으로 CORS 없이 백엔드와 통신하게 해준다. Week 1에서 이 패턴을 익히면, Week 2(Next.js)에서 같은 개념을 서버 환경으로 확장하는 것이 자연스럽게 이어진다.**
