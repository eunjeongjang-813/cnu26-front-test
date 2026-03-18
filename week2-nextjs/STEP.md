# Step 08: 장바구니 Context — localStorage 영속성

> 브랜치: `week2/step-08`

## 학습 목표
- React Context로 전역 상태를 관리하는 패턴을 이해한다
- useState lazy initializer와 useEffect로 localStorage 동기화하는 방법을 익힌다

## 핵심 개념
- `createContext` + `useContext`: 전역 상태 공유 (prop drilling 없이)
- `useState(() => ...)` lazy initializer: 첫 마운트 시 한 번만 실행
- `useEffect(() => ..., [cart])`: cart 변경 시 localStorage 동기화

## 구현

`lib/cart-context.tsx`의 TODO 2곳을 완성하세요:

```ts
// 8-a: localStorage에서 초기값 복원
const [cart, setCart] = useState<CartItem[]>(() => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('cart');
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    return [];
  }
});

// 8-b: cart 변경 시 localStorage에 저장
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cart));
}, [cart]);
```

## 전체 흐름

```
앱 시작 → CartProvider 마운트
→ useState lazy init: localStorage에서 cart 복원
→ 사용자가 상품 담기 → addToCart() → setCart()
→ useEffect 실행: localStorage.setItem('cart', ...)
→ 새로고침 시 다시 복원됨
```

## 이번 Step 에서 수정된 파일
- `lib/cart-context.tsx` — 장바구니 전역 상태 Context

## 생각해볼 점
- Week 1의 useAuth(localStorage + useState)와 CartContext의 패턴이 어떻게 유사한가?
- `useCallback`으로 addToCart 등을 감싸는 이유는?
