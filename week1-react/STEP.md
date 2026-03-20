# Step 06: 상품 목록 — useState + useEffect

> **브랜치:** `week1/step-06`
> **수정 파일:** `src/components/ProductList.jsx`

---

## 학습 목표

- 컴포넌트 마운트 시 API를 호출하는 `useEffect` 패턴을 구현한다.
- 로딩(`loading`) / 에러(`error`) / 데이터(`products`) 3가지 상태를 함께 관리하는 방법을 익힌다.
- 의존성 배열(`[query]`)로 재검색을 트리거하는 원리를 이해한다.

---

## 핵심 개념 설명

### useEffect란?

컴포넌트가 렌더링된 **후** 부수 효과(API 호출, 타이머 등)를 실행하는 훅이다.

```js
useEffect(() => {
  // 실행할 부수 효과
}, [의존성]);
```

| 의존성 배열 | 실행 시점 |
|---|---|
| 생략 | 매 렌더링마다 실행 (무한 루프 위험) |
| `[]` | 마운트 시 한 번만 |
| `[query]` | 마운트 + `query`가 바뀔 때마다 |

### 3가지 상태 관리

```js
const [products, setProducts] = useState([]); // ← 초기값: [] (null이면 .map() 에러)
const [loading, setLoading] = useState(true);  // ← 초기값: true (첫 로딩부터 시작)
const [error, setError] = useState(null);      // ← 초기값: null
```

이 세 상태는 항상 함께 다닌다: API 호출 시 `loading: true` → 완료 시 `loading: false` + 결과/에러 저장.

---

## 프로젝트 구조

```
src/
├── api/
│   ├── client.js       ✅ Step 01 완성
│   ├── auth.js         ✅ Step 02 완성
│   └── shop.js         ✅ Step 03 완성
├── hooks/
│   └── useAuth.js      ✅ Step 04 완성
└── components/
    ├── LoginForm.jsx   ✅ Step 05 완성
    └── ProductList.jsx 📝 이번 Step — 상품 목록 (useState + useEffect)
```

---

## 주요 코드

```jsx
// src/components/ProductList.jsx

export default function ProductList() {
  const [products, setProducts] = useState([]); // ← [실습 6-a]
  const [loading, setLoading] = useState(true);  // ← [실습 6-a]
  const [error, setError] = useState(null);      // ← [실습 6-a]
  const [query, setQuery] = useState('맥북');

  useEffect(() => {                              // ← [실습 6-b]
    setLoading(true);
    setError(null);

    searchProducts(query)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [query]); // query가 바뀔 때마다 재실행

  return (
    <div>
      {loading && <p>상품을 불러오는 중...</p>}
      {error && <p>오류: {error}</p>}
      {!loading && !error && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**핵심 포인트:**
- `loading`, `error`, `products` 세 상태로 UI의 세 가지 경우를 처리한다.
- `key={product.productId}`: 리스트 렌더링 시 React가 각 항목을 구분하는 필수 속성.

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

1. **구현 전:** 로그인 후 상품 목록이 비어있거나 오류 발생 확인
2. **구현 후:** 로그인 시 '맥북' 상품 목록 자동 표시 확인
3. **검색 테스트:** 다른 검색어 입력 후 `query` 상태 바뀌면 `useEffect` 재실행되는지 확인
4. **의존성 배열 실험:** `[query]`를 `[]`로 바꾸면 검색이 어떻게 되는지 실험

---

## 핵심 정리

> **`useEffect`의 의존성 배열은 "이 값이 바뀔 때마다 다시 실행"을 선언적으로 표현한다. `loading/error/data` 3상태 패턴은 모든 비동기 데이터 패칭의 기본 구조다. Week 2(Next.js Server Component)에서는 이 패턴이 `async/await`으로 대체되어 로딩 상태 없이 데이터를 바로 받아 렌더링한다.**
