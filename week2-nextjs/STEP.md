# Step 09: 장바구니 담기 버튼 — useCart 훅 사용

> 브랜치: `week2/step-09`

## 학습 목표
- 커스텀 훅(`useCart`)으로 Context 값을 가져오는 방법을 익힌다
- 클릭 이벤트 후 시각적 피드백을 setTimeout으로 구현한다

## 핵심 개념
- `const { addToCart } = useCart()`: Context 커스텀 훅 사용
- `setAdded(true)` → `setTimeout(() => setAdded(false), 1500)`: 일시적 상태 변화

## 구현

`components/AddToCartButton.tsx`의 TODO 2곳을 완성하세요:

```ts
// 9-a: useCart에서 addToCart 가져오기
const { addToCart } = useCart();

// 9-b: 클릭 핸들러 구현
const handleAddToCart = () => {
  addToCart(product);
  setAdded(true);
  setTimeout(() => setAdded(false), 1500);
};
```

## 전체 흐름

```
ProductCard → AddToCartButton → [장바구니 담기] 클릭
→ addToCart(product) → CartContext 상태 업데이트
→ localStorage에도 자동 저장 (Step 08의 useEffect)
→ CartCount 뱃지 숫자 변경 (totalCount 구독)
```

## 이번 Step 에서 수정된 파일
- `components/AddToCartButton.tsx` — 장바구니 담기 버튼

## 생각해볼 점
- `useCart()`가 `CartProvider` 밖에서 호출되면 어떻게 되나? (cart-context.tsx 확인)
- `added` 상태로 버튼을 비활성화하는 이유는?
