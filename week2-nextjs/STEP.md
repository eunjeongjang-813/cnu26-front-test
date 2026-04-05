# Step 09: 장바구니 담기 버튼 — useCart 훅

> **브랜치:** `week2/step-09`
> **수정 파일:** `components/AddToCartButton.tsx`

---

## 학습 목표

- 커스텀 훅(`useCart`)으로 Context 값을 꺼내 쓰는 방법을 익힌다.
- 클릭 이벤트 후 `setTimeout`으로 일시적 UI 변화를 구현한다.
- Client Component에서 Context를 사용하기 위한 조건을 이해한다.

---

## 핵심 개념 설명

### useCart 커스텀 훅

```ts
// lib/cart-context.tsx 에 정의
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('CartProvider 내부에서만 사용 가능');
  return context;
}
```

사용하는 쪽에서는 단 한 줄로 필요한 것을 꺼낼 수 있다:

```ts
const { addToCart } = useCart(); // 구조 분해 할당으로 필요한 것만
```

### Client Component가 필요한 이유

| 이유 | 코드 |
|---|---|
| Context 사용 | `useCart()` → `useContext()` 내부 사용 |
| 이벤트 핸들러 | `onClick={handleAddToCart}` |
| 상태 | `const [added, setAdded] = useState(false)` |

→ 세 가지 모두 `'use client'` 필요.

---

## 프로젝트 구조

```
week2-nextjs/
├── lib/
│   └── cart-context.tsx  ✅ Step 08 완성
└── components/
    └── AddToCartButton.tsx 📝 이번 Step — 장바구니 담기 버튼
```

---

## 주요 코드

```tsx
// components/AddToCartButton.tsx

'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart(); // ← [실습 9-a]
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {   // ← [실습 9-b]
    addToCart(product);             // Context 상태 업데이트 + localStorage 저장
    setAdded(true);                 // 버튼 텍스트 변경: "담기 완료 ✓"
    setTimeout(() => setAdded(false), 1500); // 1.5초 후 원상복귀
  };

  return (
    <button
      onClick={handleAddToCart}
      className={`btn-add-to-cart ${added ? 'btn-add-to-cart--added' : ''}`}
      disabled={added}
    >
      {added ? '담기 완료 ✓' : '장바구니 담기'}
    </button>
  );
}
```

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

1. **구현 전:** 장바구니 담기 버튼 클릭 시 아무 반응 없음 확인
2. **구현 후:** 클릭 → "담기 완료 ✓" → 1.5초 후 원래 텍스트로 복원 확인
3. **헤더 뱃지:** 담기 클릭 시 장바구니 아이콘 숫자가 즉시 증가하는지 확인 (Context 구독)
4. **새로고침:** 담은 상품이 localStorage에 저장되어 유지되는지 확인 (Step 08 연동)

---

## 핵심 정리

> **`useCart()`는 `CartContext`의 값을 꺼내는 커스텀 훅이다. Provider 외부에서 호출하면 즉시 에러를 던져 실수를 방지한다. `setAdded` + `setTimeout`으로 일시적 UI 피드백을 주는 패턴은 버튼, 복사 기능 등 다양한 곳에서 재사용된다.**
