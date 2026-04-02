# 1주차: React 핵심과 API 연동

> 대상: 컴퓨터공학과 3~4학년 / BE 실습 경험 있음 / FE 입문
> 목표: React 핵심 개념 이해 + BE API와 연동한 로그인·쇼핑 목록 구현
> 실습: `week1-react` 프로젝트 빈칸 채우기

---

## 목차

1. [환경 설정](#1-환경-설정)
2. [React가 하는 일](#2-react가-하는-일)
3. [JSX & 컴포넌트](#3-jsx--컴포넌트)
4. [useState - 상태 관리](#4-usestate---상태-관리)
5. [useEffect - 사이드 이펙트](#5-useeffect---사이드-이펙트)
6. [API 연동](#6-api-연동)
7. [JWT 인증 처리](#7-jwt-인증-처리)
8. [실습 가이드](#8-실습-가이드)
9. [트러블슈팅](#9-트러블슈팅)

---

## 1. 환경 설정

> 이 섹션은 BE 서버와 FE 개발 서버를 함께 띄우는 전체 과정입니다.
> **터미널 2개**를 나란히 열고 진행하세요.

---

### Step 1 — 사전 요구사항 확인

```bash
# Java 21 이상 확인
java -version
# → openjdk version "21.x.x" 이어야 함

# Node.js 22 LTS 이상 확인 (Next.js 16 최소 요구사항 v20.9+, 권장 v22 LTS)
node -v
# → v22.x.x (LTS) 이어야 함

# npm 확인
npm -v
```

**Java가 없거나 버전이 낮으면:**
- macOS: `brew install openjdk@21`
- 또는 [Adoptium](https://adoptium.net) 에서 Temurin 21 다운로드

---

### Step 2 — 네이버 API 키 발급

BE 서버가 네이버 쇼핑 검색 API를 사용합니다. 키 발급이 필요합니다.

1. [https://developers.naver.com](https://developers.naver.com) 접속 → 로그인
2. **Application** → **애플리케이션 등록** 클릭
3. 아래와 같이 입력:
   - 애플리케이션 이름: `cnu-shop` (자유)
   - 사용 API: **검색** 체크
   - 서비스 환경: **WEB** → URL: `http://localhost:8080`
4. 등록 완료 후 **Client ID** 와 **Client Secret** 복사해두기

---

### Step 3 — BE 서버 실행 (터미널 1)

```bash
# 1. BE 프로젝트 디렉토리로 이동
cd ~/Documents/cnu26-backend

# 2. application-dev.properties 확인 (수정 불필요)
#    → DB: SQLite (./data/app.db 자동 생성)
#    → 포트: 8080

# 3. 네이버 API 키를 환경변수로 설정하면서 서버 실행
NAVER_CLIENT_ID=여기에_클라이언트ID \
NAVER_CLIENT_SECRET=여기에_시크릿 \
./gradlew bootRun
```

**처음 실행 시 Gradle이 의존성을 다운로드해서 1~2분 걸립니다.**

**실행 성공 확인 메시지:**

```
Started BackendApplication in X.XXX seconds
Tomcat started on port 8080
```

**브라우저에서 확인:**

```
http://localhost:8080/actuator/health
→ {"status":"UP","components":{"user":{"status":"UP","details":{"userCount":3}}}}
```

유저 수가 3이면 초기 데이터(홍길동, 김철수, 이영희)가 정상 삽입된 것입니다.

```
http://localhost:8080/swagger-ui/index.html
→ 전체 API 목록 확인 가능 (개발 모드에서만)
```

> **환경변수 없이 실행하는 경우:** 서버는 켜지지만 상품 검색 API 호출 시 네이버 인증 오류가 납니다. 로그인/회원가입 기능은 환경변수 없이도 동작합니다.

---

### Step 4 — FE 개발 서버 실행 (터미널 2)

```bash
# 1. FE 프로젝트 디렉토리로 이동
cd ~/Documents/cnu26-frontend/week1-react

# 2. 의존성 설치 (처음 한 번만)
npm install

# 3. 개발 서버 실행
npm run dev
```

**실행 성공 확인 메시지:**

```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

브라우저에서 `http://localhost:5173` 접속

---

### Step 5 — FE ↔ BE 연결 구조 확인

FE에서 API를 호출할 때 BE를 직접 부르지 않고, **Vite 개발 서버가 프록시**해줍니다.

```
브라우저 → FE 코드: fetch('/api/users/search?name=홍길동')
  → Vite Dev Server (port 5173)
  → [proxy] /api/* → http://localhost:8080/*
  → BE 서버 (port 8080): GET /users/search?name=홍길동
  → 응답 반환
```

이 덕분에 CORS 오류 없이 API를 호출할 수 있습니다.
설정 파일: [vite.config.js](week1-react/vite.config.js)

```js
// week1-react/vite.config.js
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

---

### 전체 실행 흐름 요약

```
터미널 1                           터미널 2
────────────────────────────────   ────────────────────────────────
cd ~/Documents/cnu26-backend       cd ~/Documents/cnu26-frontend/week1-react
                                   npm install  (처음 한 번만)
NAVER_CLIENT_ID=xxx \
NAVER_CLIENT_SECRET=yyy \
./gradlew bootRun                  npm run dev

↓ 서버 시작 (약 30초)              ↓ 즉시 시작

http://localhost:8080              http://localhost:5173
(BE API 서버)                      (React 앱 — 학생 실습 화면)
```

---

### 초기 테스트 계정

BE가 시작될 때 `data.sql`이 자동 실행되어 아래 계정이 생성됩니다.

| 이름 | 이메일 |
|------|--------|
| 홍길동 | hong@example.com |
| 김철수 | kim@example.com |
| 이영희 | lee@example.com |

실습 시 이 이름으로 바로 로그인할 수 있습니다 (이메일 입력 불필요).

---

### VS Code 추천 확장

- **Prettier**: 코드 자동 포맷팅
- **ES7+ React/Redux/React-Native snippets**: `rafce` 한 줄로 컴포넌트 뼈대 생성

---

### 프로젝트 구조 미리보기

```
src/
├── api/
│   ├── client.js          ← [실습 1] 공통 fetch 클라이언트
│   ├── auth.js            ← [실습 2] 로그인/회원가입 API
│   └── shop.js            ← [실습 3] 상품 검색 API
├── hooks/
│   └── useAuth.js         ← [실습 4] 인증 상태 커스텀 훅
├── components/
│   ├── LoginForm.jsx      ← [실습 5] 로그인 폼
│   ├── ProductList.jsx    ← [실습 6] 상품 목록
│   └── ProductCard.jsx    ← (완성본 제공)
└── App.jsx                ← 라우팅 분기점 (완성본 제공)
```

> **BE와 비교하면:** `api/` = Repository/Service 레이어, `hooks/` = Service 레이어, `components/` = Controller+View 레이어

---

## 2. React가 하는 일

### 기초: 왜 React를 쓰는가?

바닐라 JS로 화면을 만들 때의 문제는 **"데이터가 바뀌면 화면도 직접 바꿔야 한다"** 는 점입니다.

```javascript
// 바닐라 JS - 상태(count)와 화면(DOM) 둘 다 직접 관리해야 함
const button = document.getElementById("btn");
let count = 0;
button.addEventListener("click", () => {
  count++;
  document.getElementById("counter").textContent = count; // 잊으면 버그!
});
```

React는 **상태(state)와 화면(UI)을 자동으로 동기화**합니다.
상태만 바꾸면, 화면은 알아서 다시 그려집니다.

```jsx
// React - 상태만 바꾸면 UI는 알아서 업데이트
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 기초: 선언형(Declarative) vs 명령형(Imperative)

| 방식 | 설명 | 예시 |
| ---- | ---- | ---- |
| 명령형 (바닐라 JS) | "어떻게" 화면을 바꿀지 지시 | `element.textContent = count` |
| 선언형 (React) | "어떤 상태일 때 어떤 화면이어야 하는지" 선언 | `<button>{count}</button>` |

> **SQL과 비교:** SQL은 `WHERE`, `JOIN`으로 "무엇을" 가져올지 선언하고, 실제 처리 방식은 DB 엔진이 결정합니다. React도 마찬가지로 UI의 "무엇을" 보여줄지만 선언하고, 실제 DOM 조작은 React가 처리합니다.

### 심화: Virtual DOM — React가 빠른 이유

React는 실제 DOM을 바로 수정하지 않고 **메모리 상의 Virtual DOM**을 먼저 업데이트한 뒤, 이전 상태와 비교해 **변경된 부분만** 실제 DOM에 반영합니다.

```
상태 변경
  → Virtual DOM 전체 재계산 (메모리 내, 매우 빠름)
  → 이전 Virtual DOM과 비교 (diffing 알고리즘)
  → 바뀐 부분만 실제 DOM에 반영 (최소한의 DOM 조작)
```

> **왜 이게 중요한가?** 실제 DOM 조작은 브라우저 렌더링 파이프라인을 다시 실행시키기 때문에 비쌉니다. React는 이 비용을 최소화합니다.

### 심화: React의 렌더링 흐름

```
1. 상태(state) 또는 props 변경
2. 컴포넌트 함수 재실행 (리렌더링)
3. 새 Virtual DOM 생성
4. 이전 Virtual DOM과 비교 (reconciliation)
5. 실제로 바뀐 DOM 노드만 업데이트
```

이 과정에서 `key` prop이 중요합니다. `ProductList.jsx`의 `product.map()`에서 `key={product.productId}`를 지정하는 이유가 바로 React가 각 항목을 정확히 추적하기 위해서입니다.

---

## 3. JSX & 컴포넌트

### 기초: JSX란?

**JavaScript 안에서 HTML처럼 쓰는 문법**입니다. 실제로는 함수 호출로 변환됩니다.

```jsx
// JSX (우리가 작성하는 코드)
const element = <h1 className="title">Hello</h1>;

// Babel이 변환한 실제 실행 코드
const element = React.createElement("h1", { className: "title" }, "Hello");
```

**주요 규칙:**

- `class` → `className` (JS 예약어 충돌 방지)
- `for` → `htmlFor` (label에서 사용, 마찬가지로 예약어)
- 반드시 단일 루트 요소 또는 `<>...</>` Fragment로 감싸야 함
- JavaScript 표현식은 `{}` 안에 작성

```jsx
const user = { name: "홍길동", score: 95 };

return (
  <div>
    <h2>{user.name}</h2>
    {/* 삼항 연산자: 조건부 렌더링 */}
    <p>점수: {user.score >= 90 ? "우수" : "보통"}</p>
    {/* && 단축평가: 조건이 true일 때만 렌더링 */}
    {user.score > 0 && <span>활성 사용자</span>}
  </div>
);
```

### 기초: 컴포넌트와 Props

함수가 JSX를 반환하면 컴포넌트입니다. **Props**는 부모가 자식에게 전달하는 데이터입니다.

```jsx
// 실습 파일: components/ProductCard.jsx
// Props로 product 객체를 받아서 카드 하나를 렌더링
export default function ProductCard({ product }) {
  const cleanTitle = product.title.replace(/<[^>]+>/g, ''); // HTML 태그 제거
  const price = product.lprice
    ? `${Number(product.lprice).toLocaleString()}원`
    : '가격 정보 없음';

  return (
    <div className="product-card">
      <img src={product.image} alt={cleanTitle} />
      <h3>{cleanTitle}</h3>
      <p>{price}</p>
    </div>
  );
}

// 사용하는 쪽 (ProductList.jsx)
<ProductCard key={product.productId} product={product} />
```

> **BE와 비교:** Props는 함수의 매개변수와 같습니다. `ProductCard`는 `product` 데이터를 받아 화면을 그리는 순수 함수입니다.

### 심화: 컴포넌트 설계 원칙

**단일 책임 원칙 (SRP)** — 하나의 컴포넌트는 하나의 역할만 합니다.

```
App.jsx         → 로그인 상태에 따라 어떤 화면을 보여줄지 결정 (라우팅)
LoginForm.jsx   → 로그인 폼 UI + 입력 상태 관리
ProductList.jsx → 상품 목록 데이터 패칭 + 검색 상태 관리
ProductCard.jsx → 상품 하나의 카드 UI (상태 없음, 순수 표현)
```

**데이터 흐름은 항상 위 → 아래 (단방향)**

```
App (user, login, logout)
 └── LoginForm (onLogin props로 받음)
 └── ProductList
      └── ProductCard (product props로 받음)
```

자식이 부모의 데이터를 바꾸려면 부모가 **함수를 props로 내려줘야** 합니다.
`App.jsx`에서 `<LoginForm onLogin={login} />`처럼 `login` 함수 자체를 내려주는 것이 그 예입니다.

---

## 4. useState - 상태 관리

### 기초: useState란?

`useState`는 컴포넌트가 **기억해야 할 값**을 선언합니다.
일반 변수는 함수가 재실행될 때마다 초기화되지만, `useState`는 React가 외부 메모리에 값을 보관해 줍니다.

```jsx
import { useState } from "react";

// [현재값, 업데이트함수] = useState(초기값)
const [count, setCount] = useState(0);
const [name, setName] = useState("");
const [user, setUser] = useState(null);
const [items, setItems] = useState([]);
```

**상태가 바뀌면 컴포넌트가 다시 렌더링됩니다.**

```jsx
// 실습 파일: components/LoginForm.jsx
export default function LoginForm({ onLogin }) {
  const [name, setName] = useState('');     // 이름 입력값
  const [email, setEmail] = useState('');   // 이메일 입력값
  const [error, setError] = useState(null); // 오류 메시지
  const [loading, setLoading] = useState(false); // 로딩 여부

  // loading이 true가 되면 → 컴포넌트 리렌더링 → 버튼이 비활성화됨
  return (
    <button disabled={loading}>
      {loading ? '처리 중...' : '로그인'}
    </button>
  );
}
```

### 기초: 왜 직접 수정하면 안 되나?

```jsx
// 틀림: React가 변경을 감지하지 못해 리렌더링 없음
let count = 0;
count = count + 1;

// 올바름: setCount 호출 → React가 변경 감지 → 리렌더링 발생
const [count, setCount] = useState(0);
setCount(count + 1);
```

> **이유:** React는 `setState` 함수 호출을 감지해서 리렌더링을 예약합니다. 변수를 직접 바꾸면 React가 알 수 없습니다.

### 기초: 제어 컴포넌트 (Controlled Component)

input의 값을 React 상태로 관리하는 패턴입니다.

```jsx
// 실습 파일: components/LoginForm.jsx
<input
  value={name}                              // 상태 → 화면 (단방향)
  onChange={(e) => setName(e.target.value)} // 화면 → 상태 (역방향 콜백)
/>
```

`value`만 연결하고 `onChange`를 빠뜨리면 input이 읽기 전용이 됩니다.
`onChange`만 연결하고 `value`를 빠뜨리면 "비제어 컴포넌트"가 되어 React가 값을 추적하지 못합니다.

**둘 다 연결해야 "제어 컴포넌트"가 됩니다.**

### 심화: useState의 비동기 업데이트

```jsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  console.log(count); // 0 출력! — 아직 업데이트 안 됨
  // setCount는 즉시 실행이 아닌 "리렌더링 예약"
};
```

React의 상태 업데이트는 **현재 렌더링이 끝난 후 배치 처리**됩니다.

```jsx
// 이전 값 기반 업데이트가 필요하면 함수형으로
setCount(prev => prev + 1); // prev는 항상 최신 값
setCount(prev => prev + 1); // 두 번 호출해도 안전하게 +2
```

### 심화: 객체/배열 상태 — 불변성(Immutability)

```jsx
const [user, setUser] = useState({ name: "", email: "" });

// 틀림: 직접 수정 → React가 감지 못함 (같은 참조)
user.name = "홍길동";
setUser(user);

// 올바름: 새 객체 생성 → React가 참조 변경 감지
setUser({ ...user, name: "홍길동" });
```

```jsx
const [items, setItems] = useState([]);

// 추가
setItems([...items, newItem]);

// 삭제
setItems(items.filter(item => item.id !== targetId));

// 수정
setItems(items.map(item =>
  item.id === targetId ? { ...item, name: "변경됨" } : item
));
```

> **BE와 비교:** 불변성은 함수형 프로그래밍의 핵심입니다. Java의 `Collections.unmodifiableList()`, `record` 타입처럼, 원본을 건드리지 않고 새 객체를 만드는 패턴입니다.

---

## 5. useEffect - 사이드 이펙트

### 기초: useEffect란?

컴포넌트는 **순수 함수**여야 합니다 — 같은 상태/props를 받으면 항상 같은 UI를 반환.
그런데 API 호출, 타이머, DOM 조작 등은 **사이드 이펙트** — 렌더링 밖에서 외부 세계에 영향을 줍니다.

`useEffect`는 이런 사이드 이펙트를 **렌더링이 끝난 후 안전하게 실행**하도록 해줍니다.

```jsx
import { useState, useEffect } from "react";

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // 컴포넌트가 화면에 나타난 후 실행됨
    searchProducts("맥북").then(data => setProducts(data));
  }, []); // [] = 마운트 시 한 번만 실행
}
```

### 기초: 의존성 배열 — 언제 실행할지 결정

```jsx
// 마운트 시 1회만 실행
useEffect(() => {
  console.log("컴포넌트 처음 나타남");
}, []);

// query가 바뀔 때마다 실행 (실습 파일: ProductList.jsx)
useEffect(() => {
  searchProducts(query).then(data => setProducts(data));
}, [query]);

// 의존성 배열 생략: 매 렌더링마다 실행 (거의 사용 안 함, 무한루프 주의)
useEffect(() => {
  console.log("렌더링될 때마다 실행");
});
```

### 기초: 실습 코드로 보는 useEffect 흐름

```jsx
// 실습 파일: components/ProductList.jsx
useEffect(() => {
  setLoading(true);  // 1. 로딩 시작
  setError(null);    // 2. 이전 오류 초기화

  searchProducts(query)
    .then((data) => {
      setProducts(data); // 3a. 성공: 데이터 저장
      setLoading(false);
    })
    .catch((err) => {
      setError(err.message); // 3b. 실패: 오류 저장
      setLoading(false);
    });
}, [query]); // query가 바뀔 때마다 재실행
```

**흐름 정리:**

```
query 상태 변경
  → useEffect 재실행
  → loading: true (로딩 스피너 표시)
  → API 호출
  → 성공: products 업데이트, loading: false (상품 목록 표시)
  → 실패: error 업데이트, loading: false (오류 메시지 표시)
```

### 심화: useEffect는 "동기화(Synchronization)" 도구

`useEffect`를 단순히 "시작할 때 한 번 실행"하는 용도로만 이해하면 금방 한계에 부딪힙니다.

**더 정확한 이해:** `useEffect`는 **"상태와 외부 세계(API, DOM, 타이머)를 동기화"** 합니다.

```jsx
// query(상태)가 바뀌면 products(API 결과)도 동기화되어야 한다
useEffect(() => {
  searchProducts(query).then(setProducts);
}, [query]);
// "query가 X이면, products는 searchProducts(X)의 결과여야 한다"
```

### 심화: async/await 방식

`useEffect`의 콜백 함수는 직접 `async`가 될 수 없습니다 (Promise를 반환하면 안 됨).
내부 함수를 선언 후 호출하는 패턴을 사용합니다.

```jsx
// .then/.catch 방식 (실습에서 사용)
useEffect(() => {
  searchProducts(query)
    .then(data => setProducts(data))
    .catch(err => setError(err.message));
}, [query]);

// async/await 방식 (동일한 결과)
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await searchProducts(query);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData(); // async 함수를 선언 후 즉시 호출
}, [query]);
```

### 심화: cleanup 함수 — 메모리 누수 방지

컴포넌트가 사라질 때(언마운트) 실행할 정리 작업을 반환합니다.

```jsx
// 타이머 정리
useEffect(() => {
  const timer = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(timer); // 컴포넌트 사라질 때 타이머 중지
}, []);

// 실무 패턴: 빠른 입력 시 이전 요청 취소 (검색 디바운싱)
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/search?q=${query}`, { signal: controller.signal })
    .then(res => res.json())
    .then(setProducts);

  return () => controller.abort(); // query가 바뀌면 이전 요청 취소
}, [query]);
```

> **BE와 비교:** cleanup은 Java의 `try-finally`나 `AutoCloseable`과 같습니다. 자원을 열었으면 반드시 닫아야 하는 원칙.

---

## 6. API 연동

### 기초: Fetch API 기본 패턴

```javascript
// GET 요청
const response = await fetch("http://localhost:8080/shop/search?query=맥북");
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();

// POST 요청
const response = await fetch("http://localhost:8080/users/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId: 1 }),
});
const data = await response.json();
// → { token: "eyJ..." }
```

### 기초: 공통 API 클라이언트 — 중복 제거

매 요청마다 헤더와 에러 처리를 반복하지 않도록 공통 함수를 만듭니다.

```javascript
// 실습 파일: api/client.js
const BASE_URL = '/api'; // Vite proxy: /api/* → http://localhost:8080/*

async function request(path, options = {}) {
  // [실습 1] localStorage에서 토큰 읽기
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    // 토큰이 있을 때만 Authorization 헤더 추가 (단축 평가 + 스프레드)
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API 오류' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json();
}

export const get = (path) => request(path);
export const post = (path, body) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });
```

> **BE와 비교:** 이 패턴은 Spring의 `RestTemplate`, `WebClient`나 interceptor와 같은 역할입니다. 모든 요청이 거치는 공통 레이어에서 인증 헤더, 에러 처리를 한 곳에서 관리합니다.

### 심화: `...(token && { Authorization: ... })` 패턴 해부

```javascript
// 단축 평가 (Short-circuit evaluation)
null && { Authorization: "Bearer xxx" }    // → null (스프레드 무효)
"eyJ..." && { Authorization: "Bearer eyJ..." } // → { Authorization: "..." }

// 스프레드 연산자
const headers = {
  'Content-Type': 'application/json',
  ...null,                               // → 아무것도 추가 안 됨
  ...{ Authorization: 'Bearer eyJ...' } // → Authorization 헤더 추가됨
};
```

### 심화: Vite Proxy 설정

`/api/*` 경로는 Vite 개발 서버가 `http://localhost:8080/*` 으로 프록시해줍니다.
이 덕분에 CORS 문제 없이 BE API를 호출할 수 있습니다.

```javascript
// vite.config.js (참고)
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
```

```
FE 코드: fetch('/api/users/me')
  → Vite Dev Server: http://localhost:5173/api/users/me
  → 프록시 변환: http://localhost:8080/users/me
  → BE 서버 처리
```

---

## 7. JWT 인증 처리

### 기초: JWT란?

BE에서 로그인 성공 시 발급하는 **서명된 토큰**입니다.
`header.payload.signature` 3부분으로 구성되며, 서버 세션 없이 인증 가능합니다.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.    ← header  (알고리즘 정보)
eyJzdWIiOiIxIiwiaWF0IjoxNzA5...            ← payload (userId, 만료시간 등)
xHjMHmxo7Bqs5...                           ← signature (비밀키로 서명)
```

> 실제 BE 코드는 `JwtUtil.java` 참고 — 라이브러리 없이 직접 구현한 버전

### 기초: 토큰 저장 전략

| 저장 위치 | 장점 | 단점 |
| --------- | ---- | ---- |
| `localStorage` | 간단, 새로고침 후 유지 | XSS 공격에 취약 |
| `sessionStorage` | 탭 닫으면 자동 삭제 | 새로고침 후 사라짐 |
| `HttpOnly Cookie` | XSS 방어 (JS 접근 불가) | CSRF 고려 필요 |

실습에서는 `localStorage`를 사용합니다 (개념 이해 목적).

> **실무에서는?** 보안이 중요한 서비스는 `HttpOnly Cookie`를 사용합니다. JS 코드가 토큰에 접근할 수 없어서 XSS 공격으로 토큰을 탈취할 수 없습니다.

### 기초: 로그인 전체 플로우

```
사용자: 이름 "홍길동" 입력
  → LoginForm.jsx: onLogin("홍길동") 호출
  → useAuth.js: login("홍길동") 실행

  1단계: GET /users/search?name=홍길동
    → 기존 유저 있음  → foundUser = { id: 1, name: "홍길동", ... }
    → 없음            → signUp() 호출 → POST /users 로 회원가입

  2단계: POST /users/login { userId: 1 }
    → 서버: JWT 토큰 생성 후 반환
    → 응답: { token: "eyJ..." }

  3단계: localStorage.setItem('token', token)
    → 이후 모든 API 요청에 자동으로 포함됨 (client.js)

  4단계: setUser(foundUser)
    → isLoggedIn: true
    → App.jsx가 ProductList 렌더링
```

### 기초: 커스텀 훅 — useAuth

인증 관련 로직을 **커스텀 훅**으로 분리해 캡슐화합니다.

```javascript
// 실습 파일: hooks/useAuth.js
export function useAuth() {
  const [user, setUser] = useState(null); // [실습 4-a]

  // 앱 시작 시 토큰 있으면 자동 로그인 복원
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
    const { token } = await loginWithUserId(foundUser.id); // [실습 4-b]
    localStorage.setItem('token', token);
    setUser(foundUser);
  };

  const logout = () => {               // [실습 4-c]
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, isLoggedIn: !!user, login, logout };
}
```

### 심화: 커스텀 훅 = FE의 Service 레이어

```
BE 아키텍처:          FE 아키텍처:
Controller            Component (LoginForm, ProductList)
    ↓                     ↓
Service               Custom Hook (useAuth)
    ↓                     ↓
Repository            API Module (api/auth.js, api/shop.js)
    ↓                     ↓
DB                    BE Server
```

`App.jsx`는 `user`, `isLoggedIn`, `login`, `logout`만 알면 됩니다.
로그인이 내부적으로 `localStorage`를 쓰는지, 어떤 API를 호출하는지는 관심 없습니다.
**이것이 캡슐화의 핵심입니다.**

### 심화: `!!user` 패턴

```javascript
const isLoggedIn = !!user;

// 풀어쓰면:
// user = null    → !null = true  → !!null = false   (비로그인)
// user = { id: 1, name: "홍길동" } → !{...} = false → !!{...} = true  (로그인)
```

`Boolean(user)`와 동일하지만 코드가 더 간결합니다.

---

## 8. 실습 가이드

### 실습 순서

총 6개 파일의 TODO를 순서대로 채웁니다.

| 번호 | 파일 | 핵심 개념 |
| ---- | ---- | --------- |
| [실습 1] | `api/client.js` | localStorage, 조건부 헤더 (&&, spread) |
| [실습 2] | `api/auth.js` | API 함수 구현 (post 사용) |
| [실습 3] | `api/shop.js` | API 함수 구현 (get + encodeURIComponent) |
| [실습 4] | `hooks/useAuth.js` | useState, localStorage, setUser |
| [실습 5] | `components/LoginForm.jsx` | useState, 제어 컴포넌트 |
| [실습 6] | `components/ProductList.jsx` | useState, useEffect, 의존성 배열 |

### 실습 체크리스트

**[실습 1] api/client.js**
- [ ] `const token = null` → `localStorage.getItem('token')` 으로 교체
- [ ] Authorization 헤더 주석 해제: `...(token && { Authorization: \`Bearer ${token}\` })`

**[실습 2] api/auth.js**
- [ ] `signUp`: `post('/users', { name, email })` 반환
- [ ] `loginWithUserId`: `post('/users/login', { userId })` 반환

**[실습 3] api/shop.js**
- [ ] `searchProducts`: `get(\`/shop/search?query=${encodeURIComponent(query)}&display=${display}\`)` 반환

**[실습 4] hooks/useAuth.js**
- [ ] `user` 상태 선언: `useState(null)`
- [ ] 로그인 후 토큰 저장: `const { token } = await loginWithUserId(...)` + `localStorage.setItem` + `setUser`
- [ ] 로그아웃: `localStorage.removeItem('token')` + `setUser(null)`

**[실습 5] components/LoginForm.jsx**
- [ ] `name`, `email`, `error` 상태 선언

**[실습 6] components/ProductList.jsx**
- [ ] `products`, `loading`, `error` 상태 선언
- [ ] `useEffect` 의존성 배열 확인: `[query]`

### BE API 명세 (참고용)

```
POST /users              { name, email }    → { id, name, email }  (회원가입)
GET  /users/search       ?name=홍길동      → Page<User> (.content[0] 사용)  (이름 검색)
POST /users/login        { userId }         → { token }            (로그인)
GET  /users/me           Authorization      → { id, name, email }  (내 정보)
GET  /shop/search        ?query=&display=   → ShoppingItem[]       (상품 검색)
```

### 완성 목표 화면

```
[로그인 화면]
이름: [홍길동     ]
이메일: [hong@ex.com] (최초 가입 시에만 표시)
[로그인 / 회원가입]

     ↓ 로그인 성공

[쇼핑 목록]
안녕하세요, 홍길동님!  [로그아웃]
검색: [맥북     ] [검색]
┌─────────────────────┐
│ [이미지]             │
│ MacBook Pro         │
│ 최저가: 3,200,000원  │
│ 브랜드: Apple       │
└─────────────────────┘
```

---

## 9. 트러블슈팅

### [오류 1] CORS 오류

```
Access to fetch at 'http://localhost:8080' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**원인:** FE(5173)에서 BE(8080)를 직접 호출하면 브라우저가 보안상 차단합니다.

**해결:**
- `/api/` 경로를 사용하면 Vite proxy가 BE로 전달합니다.
- `fetch('/api/users/me')` ← `/api` 접두사 확인
- BE의 CORS 설정에서 `http://localhost:5173` 허용 여부 확인

---

### [오류 2] 401 Unauthorized

**원인:** Authorization 헤더가 없거나 형식이 틀림.

**확인 사항:**
- [실습 1] 완료 여부: `localStorage.getItem('token')` + 헤더 주석 해제
- 헤더 형식: `Bearer ` + 토큰 (공백 포함, 대소문자 주의)
- localStorage에 토큰이 실제로 저장되었는지: 브라우저 개발자 도구 → Application → localStorage

---

### [오류 3] 상태 업데이트 후 값이 즉시 안 바뀜

```jsx
const handleLogin = async () => {
  setLoading(true);
  console.log(loading); // false 출력! — 아직 반영 전
};
```

**원인:** `setState`는 비동기입니다. 현재 렌더링에서는 이전 값을 유지합니다.

**해결:** 상태 값을 즉시 사용해야 한다면 별도 변수를 사용하세요.

```jsx
const handleLogin = async () => {
  const isLoading = true; // 변수로 따로 관리
  setLoading(isLoading);
  if (isLoading) { /* ... */ }
};
```

---

### [오류 4] 새로고침하면 로그아웃됨

**원인:** React 상태(`user`)는 메모리에 저장되어 새로고침 시 초기화됩니다.

**해결:** `useAuth.js`의 `useEffect`에서 앱 시작 시 `localStorage`의 토큰을 확인해 자동 복원합니다.

```javascript
// hooks/useAuth.js — 이미 구현되어 있는 코드
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    getMe().then(setUser); // 토큰 있으면 내 정보 조회 → user 상태 복원
  }
}, []);
```

[실습 1]이 완료되지 않으면 (`const token = null`) 이 자동복원도 동작하지 않습니다.

---

### [오류 5] `Cannot read properties of null (reading 'map')`

**원인:** `products` 초기값을 `null`로 설정한 경우.

```jsx
// 틀림
const [products, setProducts] = useState(null); // null.map() → 오류!

// 올바름
const [products, setProducts] = useState([]);   // [].map() → 빈 배열 반환
```

---

### [오류 6] useEffect 무한 루프

```jsx
// 무한 루프 발생!
useEffect(() => {
  searchProducts(query).then(data => {
    setProducts(data);
  });
}); // 의존성 배열 없음 → 매 렌더링마다 실행 → setProducts → 리렌더링 → 반복
```

**해결:** 의존성 배열 반드시 명시

```jsx
useEffect(() => {
  searchProducts(query).then(setProducts);
}, [query]); // query가 바뀔 때만 실행
```

---

## 핵심 정리

| 개념 | 한 줄 요약 | 실습 파일 |
| ---- | ---------- | --------- |
| `useState` | 컴포넌트가 기억하는 값. 바뀌면 리렌더링 | LoginForm, ProductList |
| `useEffect` | 렌더링 후 실행되는 작업. 상태와 외부 세계 동기화 | ProductList, useAuth |
| Props | 부모 → 자식으로 데이터/함수 전달 | ProductCard, LoginForm |
| 제어 컴포넌트 | `value` + `onChange`로 input 상태 완전 제어 | LoginForm |
| 커스텀 훅 | 상태 로직을 함수로 분리해 캡슐화 | useAuth |
| JWT | 서버가 발급한 서명된 토큰으로 상태 없는 인증 | useAuth, client.js |
| localStorage | 브라우저에 데이터 영구 저장 (새로고침 유지) | client.js, useAuth |
