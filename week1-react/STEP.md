# Step 03: 상품 검색 API — encodeURIComponent

> **브랜치:** `week1/step-03`
> **수정 파일:** `src/api/shop.js`

---

## 학습 목표

- GET 요청에서 query parameter를 올바르게 조합하는 방법을 익힌다.
- `encodeURIComponent()`로 한글/특수문자를 URL-safe 형태로 변환하는 이유를 이해한다.
- 템플릿 리터럴로 동적 URL을 만드는 패턴을 체득한다.

---

## 핵심 개념 설명

### URL 인코딩이 필요한 이유

URL에는 ASCII 문자만 안전하게 사용할 수 있다. 한글을 그대로 넣으면 브라우저나 서버에 따라 깨질 수 있다.

```js
// ❌ 인코딩 없음 — 서버에서 인식 실패 가능
/shop/search?query=맥북

// ✅ 인코딩 적용 — 항상 안전
/shop/search?query=%EB%A7%A5%EB%B6%81
```

`encodeURIComponent('맥북')` → `'%EB%A7%A5%EB%B6%81'`

### display 파라미터

```js
searchProducts('맥북', 12)
// → GET /shop/search?query=%EB%A7%A5%EB%B6%81&display=12
```

`display`는 결과 개수를 지정한다. 기본값 12는 한 화면에 딱 맞는 카드 수다.

---

## 프로젝트 구조

```
src/
├── api/
│   ├── client.js       ✅ Step 01 완성
│   ├── auth.js         ✅ Step 02 완성
│   └── shop.js         📝 이번 Step — 상품 검색 API
├── hooks/
│   └── useAuth.js
└── components/
    ├── LoginForm.jsx
    └── ProductList.jsx
```

---

## 주요 코드

```js
// src/api/shop.js

export async function searchProducts(query, display = 12) {
  return get(`/shop/search?query=${encodeURIComponent(query)}&display=${display}`);
  // 예시: searchProducts('맥북')
  // → GET /api/shop/search?query=%EB%A7%A5%EB%B6%81&display=12
  // → Vite proxy → http://localhost:8080/shop/search?...
  // → 네이버 쇼핑 API 결과 반환
}
```

**핵심 포인트:**
- 템플릿 리터럴(`` ` `` )로 경로와 파라미터를 깔끔하게 조합한다.
- `get()` 함수는 Step 01의 `client.js`에서 토큰 헤더를 자동으로 추가한다.

---

## 프로젝트 실행법

```bash
cd week1-react
npm install      # 최초 1회
npm run dev      # 개발 서버 시작
```

브라우저에서 `http://localhost:3000` 접속.

> 백엔드 서버(`localhost:8080`)가 실행 중이어야 상품 검색이 동작한다.

---

## 확인할 것들

1. **구현 전:** 로그인 후 상품 목록 화면에서 상품이 뜨지 않거나 에러 발생 확인
2. **구현 후:** 검색창에 한글 입력 → 검색 버튼 클릭 → 상품 목록 표시 확인
3. **Network 탭:** `/api/shop/search?query=%EB%A7%A5...` 형태로 요청 가는지 확인
4. **콘솔:** `encodeURIComponent('맥북')` 직접 실행해 결과 확인

---

## 핵심 정리

> **`encodeURIComponent()`는 한글처럼 URL에 안전하지 않은 문자를 `%XX` 형태로 변환한다. 이 처리 없이 한글을 URL에 넣으면 서버에 따라 다르게 처리되어 예측 불가능한 버그가 생긴다. Week 2에서는 이 함수가 서버(Server Component)에서 실행되어 CORS 걱정 없이 백엔드를 직접 호출한다.**
