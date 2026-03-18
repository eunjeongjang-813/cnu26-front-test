# Step 03: 상품 검색 API

> 브랜치: `week1/step-03`

## 학습 목표
- GET 요청에서 query parameter를 올바르게 인코딩하는 방법을 익힌다
- 템플릿 리터럴로 동적 URL을 만드는 패턴을 이해한다

## 핵심 개념
- `get(path)`: client.js의 공통 GET 함수
- `encodeURIComponent()`: 한글/특수문자를 URL-safe 형태로 변환
- 템플릿 리터럴: `` `/shop/search?query=${...}` ``

## 구현

`src/api/shop.js`의 TODO를 완성하세요:

```js
return get(`/shop/search?query=${encodeURIComponent(query)}&display=${display}`);
```

## 전체 흐름

```
ProductList → searchProducts('맥북')
→ GET /api/shop/search?query=%EB%A7%A5%EB%B6%81&display=12
→ Vite proxy → http://localhost:8080/shop/search?...
→ 네이버 쇼핑 API 결과 반환
```

## 이번 Step 에서 수정된 파일
- `src/api/shop.js` — 상품 검색 API 함수

## 생각해볼 점
- `encodeURIComponent('맥북')`의 결과는 무엇인가?
- 인코딩 없이 한글을 URL에 넣으면 어떻게 될까?
