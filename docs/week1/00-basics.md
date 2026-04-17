# Week 1 사전 지식 — React + Vite (CSR)

> **대상:** 프로그래밍 기초 지식이 있으나 프론트엔드가 처음인 학생
> **목표:** Week 1 실습(Step 01~06)을 이해하는 데 필요한 개념을 익힌다

---

## 목차

1. [브라우저는 어떻게 동작하는가](#1-브라우저는-어떻게-동작하는가)
2. [JavaScript 필수 문법](#2-javascript-필수-문법)
3. [React란 무엇인가](#3-react란-무엇인가)
4. [컴포넌트와 JSX](#4-컴포넌트와-jsx)
5. [Props — 데이터 전달](#5-props--데이터-전달)
6. [useState — 상태 관리](#6-usestate--상태-관리)
7. [useEffect — 부수 효과](#7-useeffect--부수-효과)
8. [제어 컴포넌트 — 폼 다루기](#8-제어-컴포넌트--폼-다루기)
9. [커스텀 훅 — 로직 재사용](#9-커스텀-훅--로직-재사용)
10. [localStorage — 브라우저 저장소](#10-localstorage--브라우저-저장소)

---

## 1. 브라우저는 어떻게 동작하는가

### HTML / CSS / JavaScript의 역할

웹 페이지는 세 가지 언어로 이루어진다.

```
HTML  → 구조 (무엇이 있는가)  : 제목, 버튼, 입력란
CSS   → 스타일 (어떻게 보이는가): 색상, 크기, 위치
JS    → 동작 (어떻게 움직이는가): 클릭 이벤트, 데이터 처리, 화면 업데이트
```

### 전통적인 웹 vs SPA

```
[전통적인 웹]
버튼 클릭 → 서버에 요청 → 서버가 새 HTML 생성 → 페이지 전체 새로고침

[SPA (Single Page Application) — React 방식]
버튼 클릭 → JS가 화면 일부만 업데이트 → 새로고침 없음
            필요한 데이터는 fetch()로 서버에 요청 → JSON만 받아서 화면 갱신
```

React는 SPA를 만들기 위한 라이브러리다. 한 번 HTML을 받아온 후, 이후 화면 변경은 모두 JavaScript가 처리한다.

### CSR(클라이언트 사이드 렌더링)이란?

Week 1에서 만드는 방식이다.

```
1. 브라우저가 서버에서 빈 HTML + JS 파일을 받아온다
2. JS가 브라우저에서 실행된다
3. JS가 화면(DOM)을 직접 만든다
4. 데이터가 필요하면 fetch()로 API를 호출한다

장점: 페이지 전환이 빠르고 부드럽다
단점: JS 실행 전까지 빈 화면, 검색엔진 최적화 불리
```

---

## 2. JavaScript 필수 문법

### async / await — 비동기 처리

서버에 데이터를 요청하면 응답이 올 때까지 기다려야 한다. 이때 프로그램 전체가 멈추면 안 되기 때문에 **비동기 처리**를 사용한다.

```js
// fetch는 네트워크 요청 → 응답이 올 때까지 기다려야 함
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`); // 응답 올 때까지 대기
  const user = await response.json(); // JSON 파싱 대기
  return user;
}
```

- `async` 키워드: 이 함수는 비동기 함수다 (항상 Promise를 반환)
- `await` 키워드: 결과가 올 때까지 여기서 잠깐 기다려라 (async 함수 안에서만 사용 가능)

에러가 발생할 수 있는 경우는 `try/catch`로 처리한다.

```js
async function login(name) {
  try {
    const user = await fetchUser(name);
    console.log("성공", user);
  } catch (error) {
    console.error("실패", error.message);
  }
}
```

### 구조 분해 할당

객체나 배열에서 필요한 값만 꺼내는 문법이다.

```js
const user = { id: 1, name: "김철수", email: "kim@email.com" };

// 기존 방식
const id = user.id;
const name = user.name;

// 구조 분해
const { id, name } = user;

// 함수 파라미터에서도 사용
function greet({ name, email }) {
  return `안녕하세요 ${name}님, 이메일: ${email}`;
}
```

### 스프레드 연산자 (`...`)

배열이나 객체를 펼쳐서 복사하거나 합칠 때 사용한다.

```js
// 객체 복사 + 새 속성 추가
const base = { "Content-Type": "application/json" };
const withAuth = { ...base, Authorization: "Bearer abc123" };
// 결과: { 'Content-Type': 'application/json', Authorization: 'Bearer abc123' }

// 배열에 요소 추가
const items = [1, 2, 3];
const newItems = [...items, 4]; // [1, 2, 3, 4]
```

Week 1 실습에서 조건부 헤더를 추가할 때 이 패턴이 쓰인다.

```js
// token이 null이면 null && {...} = null → 스프레드되어 아무것도 추가 안 됨
// token이 있으면 {...} = { Authorization: '...' } → 헤더 추가됨
...(token && { Authorization: `Bearer ${token}` })
```

### 화살표 함수

함수를 간결하게 쓰는 문법이다.

```js
// 기존 함수 표현식
const add = function (a, b) {
  return a + b;
};

// 화살표 함수
const add = (a, b) => a + b;

// 배열 메서드에서 자주 사용
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter((n) => n % 2 === 0); // [2, 4]
const doubled = numbers.map((n) => n * 2); // [2, 4, 6, 8, 10]
```

### Optional Chaining (`?.`)

값이 `null` 또는 `undefined`일 수 있을 때 안전하게 접근하는 문법이다.

```js
const user = null;

// 에러 발생: Cannot read property 'name' of null
console.log(user.name);

// null이면 undefined 반환 (에러 없음)
console.log(user?.name); // undefined
console.log(user?.address?.city); // undefined (체이닝 가능)

// API 응답에서 자주 쓰임
const token = cookieStore.get("token")?.value; // token 쿠키가 없으면 undefined
```

### 템플릿 리터럴

백틱(`` ` ``)을 사용하면 문자열 안에 변수를 넣을 수 있다.

```js
const name = "김철수";
const age = 21;

// 기존 방식
const msg = "안녕하세요 " + name + "님, 나이: " + age;

// 템플릿 리터럴
const msg = `안녕하세요 ${name}님, 나이: ${age}`;
const url = `/api/users/${name}/profile`;
```

### `.then()` / `.catch()` 체이닝

`async/await` 대신 사용하는 또 다른 비동기 처리 방식이다. 실습 코드에서 자주 보인다.

```js
fetch("/api/products")
  .then((res) => res.json()) // 응답 → JSON 변환
  .then((data) => setProducts(data)) // 데이터 저장
  .catch((err) => setError(err.message)); // 에러 처리
```

---

## 3. React란 무엇인가

### 왜 React를 쓰는가?

순수 JavaScript로도 화면을 만들 수 있다. 하지만 직접 DOM을 조작하는 방식은 규모가 커질수록 복잡해진다.

```js
// 순수 JS로 DOM 조작 — 이런 코드가 수백 줄이 되면 관리 불가
document.getElementById("count").textContent = count;
document.getElementById("btn").addEventListener("click", () => {
  count++;
  document.getElementById("count").textContent = count;
});
```

React의 핵심 아이디어: **"데이터(상태)만 바꾸면, 화면은 React가 알아서 업데이트한다"**

```jsx
// React 방식 — 상태와 UI를 선언적으로 연결
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
// setCount(새값) 호출 → React가 자동으로 화면 업데이트
```

### Virtual DOM

React가 빠른 이유는 **Virtual DOM** 때문이다.

```
1. 상태가 바뀌면 React는 새 Virtual DOM(JS 객체)을 만든다
2. 이전 Virtual DOM과 비교한다 (어디가 달라졌지?)
3. 실제로 바뀐 부분만 실제 DOM에 반영한다

→ DOM 전체를 다시 그리지 않아서 빠름
```

---

## 4. 컴포넌트와 JSX

### 컴포넌트 = 재사용 가능한 UI 조각

React 앱은 컴포넌트들의 조합으로 이루어진다. 함수 하나 = 화면의 한 조각.

```jsx
// 하나의 상품 카드 컴포넌트
function ProductCard({ product }) {
  return (
    <div className="card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.price.toLocaleString()}원</p>
    </div>
  );
}

// 여러 카드를 나열하는 컴포넌트
function ProductList({ products }) {
  return (
    <div className="grid">
      <ProductCard product={products[0]} />
      <ProductCard product={products[1]} />
      {/* 컴포넌트를 재사용! */}
    </div>
  );
}
```

**규칙:** 컴포넌트 이름은 반드시 **대문자**로 시작해야 한다. (`productCard` ❌, `ProductCard` ✅)

### JSX — JavaScript 안에 HTML처럼 쓰는 문법

```jsx
// JSX: JS 파일 안에 HTML처럼 생긴 문법 사용
const element = <h1>안녕하세요!</h1>;

// 실제로는 이렇게 변환됨 (직접 쓸 필요 없음)
const element = React.createElement("h1", null, "안녕하세요!");
```

**JSX에서 알아야 할 규칙:**

```jsx
// 1. 반드시 하나의 루트 요소로 감싸야 함
// ❌ 에러
return (
  <h1>제목</h1>
  <p>내용</p>
);

// ✅ 빈 태그(<>)나 div로 감싸기
return (
  <>
    <h1>제목</h1>
    <p>내용</p>
  </>
);

// 2. JavaScript 표현식은 {} 안에 작성
const name = '김철수';
return <p>안녕하세요, {name}님!</p>;
return <p>합계: {price * quantity}원</p>;

// 3. HTML의 class → JSX에서 className
return <div className="container">내용</div>;

// 4. 조건부 렌더링
const isLoggedIn = true;
return (
  <div>
    {isLoggedIn && <p>로그인 됨</p>}           {/* AND 연산 */}
    {isLoggedIn ? <LogoutBtn /> : <LoginBtn />} {/* 삼항 연산 */}
  </div>
);

// 5. 리스트 렌더링 — key 필수 (React가 각 항목을 구분하기 위해)
const fruits = ['사과', '바나나', '포도'];
return (
  <ul>
    {fruits.map((fruit) => (
      <li key={fruit}>{fruit}</li>
    ))}
  </ul>
);
```

---

## 5. Props — 데이터 전달

Props는 **부모 컴포넌트가 자식 컴포넌트에 전달하는 데이터**다.
함수의 인자(argument)와 같은 개념이다.

```jsx
// 부모: 데이터를 넘겨줌
function App() {
  return <UserCard name="김철수" age={21} isAdmin={true} />;
}

// 자식: props로 받아서 사용
function UserCard({ name, age, isAdmin }) {
  return (
    <div>
      <p>
        {name} ({age}세)
      </p>
      {isAdmin && <span>관리자</span>}
    </div>
  );
}
```

**중요한 규칙:** Props는 **읽기 전용**이다. 자식 컴포넌트에서 props를 직접 수정하면 안 된다.

```jsx
// ❌ 절대 안 됨
function Child({ name }) {
  name = "다른이름"; // props 수정 금지!
}

// ✅ 자식이 부모의 상태를 바꾸고 싶다면, 부모가 함수를 내려줌
function Parent() {
  const [name, setName] = useState("김철수");
  return <Child name={name} onChangeName={setName} />;
}

function Child({ name, onChangeName }) {
  return <button onClick={() => onChangeName("이영희")}>{name}</button>;
}
```

---

## 6. useState — 상태 관리

### useState란?

컴포넌트가 화면에 표시하는 **변경 가능한 데이터**를 관리하는 훅이다.
값이 바뀌면 React가 자동으로 화면을 다시 그린다.

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  //     ↑현재값  ↑변경함수        ↑초기값

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
      <button onClick={() => setCount(0)}>초기화</button>
    </div>
  );
}
```

### 왜 일반 변수가 아닌 useState를 써야 하는가?

```jsx
function Counter() {
  let count = 0; // 일반 변수

  return (
    <button
      onClick={() => {
        count += 1;
        console.log(count); // 값은 바뀌지만...
        // 화면은 그대로! React가 변경을 모름
      }}
    >
      {count}
    </button>
  );
}
```

일반 변수를 바꿔도 React는 알 수 없다. **`useState`의 setter 함수를 호출해야** React가 "다시 그려야겠다"는 것을 인식한다.

### 자주 쓰는 초기값 패턴

```jsx
const [text, setText] = useState(""); // 빈 문자열
const [count, setCount] = useState(0); // 숫자
const [isLoading, setIsLoading] = useState(false); // 불리언
const [error, setError] = useState(null); // 에러 없으면 null
const [products, setProducts] = useState([]); // 빈 배열 (null 쓰면 .map() 에러!)
const [user, setUser] = useState(null); // 유저 없으면 null
```

### 객체 상태 업데이트

상태가 객체일 때, 직접 수정하면 안 된다. 항상 **새 객체**를 만들어서 넘겨야 한다.

```jsx
const [user, setUser] = useState({ name: "김철수", age: 21 });

// ❌ 직접 수정 (React가 변경 감지 못함)
user.name = "이영희";
setUser(user); // 같은 객체 참조 → React는 변경 없다고 판단

// 전체 교체 — 스프레드 필요 없음
setUser({ id: 2, name: "이영희", email: "lee@test.com" });

// 일부만 바꿀 때 — 스프레드로 나머지 유지
setUser({ ...user, name: "이영희" });
```

### 실습에서 쓰는 핵심 패턴 — 3가지 상태

API를 호출할 때 항상 이 세 가지 상태를 함께 관리한다.

```jsx
const [data, setData] = useState([]);       // 받아온 데이터
const [loading, setLoading] = useState(true); // 로딩 중인가?
const [error, setError] = useState(null);   // 에러가 있는가?

// 사용 예시
if (loading) return <p>로딩 중...</p>;
if (error) return <p>오류: {error}</p>;
return <ul>{data.map(...)}</ul>;
```

---

## 7. useEffect — 부수 효과

### useEffect란?

컴포넌트가 화면에 그려진 **후에** 실행해야 할 작업을 처리하는 훅이다.
API 호출, 타이머 설정, 이벤트 구독 등이 해당된다.

```js
useEffect(() => {
  // 실행할 코드
}, [의존성 배열]);
```

### 의존성 배열이 실행 시점을 결정한다

```jsx
// 빈 배열 [] → 컴포넌트가 처음 화면에 나타날 때 딱 한 번만 실행
useEffect(() => {
  console.log("처음 한 번만 실행");
}, []);

// 값이 있는 배열 → 처음 + 해당 값이 바뀔 때마다 실행
useEffect(() => {
  console.log("query가 바뀔 때마다 실행:", query);
}, [query]);

// 배열 생략 → 매 렌더링마다 실행 (거의 쓰지 않음, 무한 루프 주의)
useEffect(() => {
  console.log("렌더링마다 실행");
});
```

### API 호출 패턴

```jsx
function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("맥북");

  useEffect(() => {
    // query가 바뀔 때마다 API 재호출
    setLoading(true);

    searchProducts(query)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [query]); // query가 의존성 → query 바뀌면 재실행

  if (loading) return <p>로딩 중...</p>;
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

### useEffect + async/await 사용 시 주의점

```jsx
// ❌ useEffect 콜백을 직접 async로 선언하면 안 됨
useEffect(async () => {
  const data = await fetchData(); // 경고 발생
}, []);

// ✅ 내부에 async 함수를 선언하고 즉시 호출
useEffect(() => {
  async function load() {
    const data = await fetchData();
    setData(data);
  }
  load(); // 즉시 실행
}, []);
```

---

## 8. 제어 컴포넌트 — 폼 다루기

### HTML 폼의 기본 동작

HTML `<form>`은 제출 시 기본적으로 **페이지를 새로고침**한다.
React SPA에서는 이를 막고 JavaScript로 처리해야 한다.

```jsx
function Form() {
  const handleSubmit = (e) => {
    e.preventDefault(); // ⭐ 페이지 새로고침 방지 — 반드시 필요!
    // 여기서 데이터 처리
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 제어 컴포넌트 패턴

HTML `<input>`은 자체적으로 입력값을 관리한다. React에서는 이를 **React 상태로 가져와서 관리**한다.

```jsx
// ❌ 비제어 — React가 값을 모름
<input type="text" />;

// ✅ 제어 컴포넌트 — React 상태가 값을 제어
const [name, setName] = useState("");

<input
  value={name} // 상태 → 화면에 표시
  onChange={(e) => setName(e.target.value)} // 타이핑 → 상태 업데이트
/>;
```

**`value`와 `onChange`는 반드시 함께 써야 한다.** `value`만 있으면 읽기 전용이 되어 타이핑이 안 된다.

### 실제 로그인 폼 예시

```jsx
function LoginForm({ onLogin }) {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!name.trim()) {
      setError("이름을 입력해주세요");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onLogin(name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력하세요"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "처리 중..." : "로그인"}
      </button>
    </form>
  );
}
```

---

## 9. 커스텀 훅 — 로직 재사용

### 커스텀 훅이란?

`useState`, `useEffect` 등 여러 훅을 묶어서 **재사용 가능한 로직 단위**로 만든 함수다.
이름이 반드시 `use`로 시작해야 한다.

```js
// ❌ 컴포넌트에 모든 로직을 직접 작성하면 너무 복잡해짐
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // 로그인 로직 30줄...
  // 로그아웃 로직 10줄...
  // 토큰 복원 로직 15줄...
  return <div>...</div>;
}

// ✅ 커스텀 훅으로 분리하면 App이 깔끔해짐
function App() {
  const { user, isLoggedIn, login, logout } = useAuth();
  return <div>...</div>;
}
```

### Week 1의 useAuth 구조

```js
// src/hooks/useAuth.js

export function useAuth() {
  const [user, setUser] = useState(null);

  // 앱이 시작될 때 localStorage에 저장된 토큰으로 유저 정보 복원
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem("token")); // 토큰 만료 시 삭제
    }
  }, []);

  const login = async (name, email) => {
    // 유저 찾기 → 없으면 회원가입 → 로그인 API 호출 → 토큰 저장
    const { token } = await loginWithUserId(foundUser.id);
    localStorage.setItem("token", token);
    setUser(foundUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return {
    user,
    isLoggedIn: !!user, // user가 null이면 false, 객체면 true
    login,
    logout,
  };
}
```

---

## 10. localStorage — 브라우저 저장소

### localStorage란?

브라우저가 제공하는 **key-value 저장소**다. 탭을 닫아도 데이터가 유지된다.

```js
// 저장
localStorage.setItem("token", "eyJhbGci...");

// 읽기 (없으면 null 반환)
const token = localStorage.getItem("token");

// 삭제
localStorage.removeItem("token");

// 전체 삭제
localStorage.clear();
```

### JWT 인증 흐름 (Week 1에서 구현)

```
로그인 요청 → 서버가 JWT 토큰 발급 → localStorage에 저장

이후 모든 API 요청:
  1. localStorage에서 토큰을 꺼냄
  2. HTTP 헤더에 담아서 전송
     Authorization: Bearer eyJhbGci...
  3. 서버가 헤더 확인 → 유효하면 데이터 반환, 아니면 401 에러

로그아웃: localStorage에서 토큰 삭제
```

브라우저 개발자 도구 → Application 탭 → Local Storage에서 저장된 값을 직접 확인할 수 있다.

---

## Week 1 전체 구조 한눈에 보기

```
App.jsx
├── useAuth()                  ← 커스텀 훅 (인증 상태 관리)
│   ├── useState(user)         ← 로그인된 유저
│   └── useEffect              ← 앱 시작 시 토큰으로 유저 복원
│
├── 로그인 전: <LoginForm onLogin={login} />
│   ├── useState(name, error)  ← 입력값, 에러 상태
│   └── handleSubmit           ← 제출 시 useAuth.login() 호출
│
└── 로그인 후: <ProductList />
    ├── useState(products, loading, error)
    ├── useState(query)        ← 검색어
    └── useEffect([query])     ← query 바뀔 때마다 API 호출
```

```
API 호출 흐름:
컴포넌트 → useAuth / searchProducts → api/client.js → fetch() → 백엔드 서버

client.js의 역할:
- 모든 API 요청의 공통 처리
- localStorage에서 토큰을 꺼내 Authorization 헤더 자동 추가
- 에러 응답 시 에러 throw
```
