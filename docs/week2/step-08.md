# Step 08: 장바구니 Context — localStorage 영속성

> **브랜치:** `week2/step-08`
> **수정 파일:** `lib/cart-context.tsx`

---

## 학습 목표

- React Context로 전역 상태를 관리하는 패턴을 이해한다.
- `useState` lazy initializer로 `localStorage`에서 초기값을 복원하는 방법을 구현한다.
- `useEffect`로 상태 변경 시 `localStorage`에 동기화하는 방법을 익힌다.

---

## 핵심 개념 설명

### 왜 Context가 필요한가?

장바구니 데이터는 여러 컴포넌트에서 필요하다.

```
App
├── Header (뱃지 숫자)           ← cart.totalCount 필요
├── ShopPage
│   └── ProductCard
│       └── AddToCartButton     ← addToCart() 필요
└── CartPage                    ← cart, removeFromCart() 필요
```

Context 없이 props로 전달하면 모든 중간 컴포넌트를 거쳐야 한다 (**prop drilling**). Context는 어느 깊이에서든 바로 꺼내 쓸 수 있다.

### localStorage 동기화 패턴

```ts
// 초기값: localStorage에서 복원 (lazy initializer)
const [cart, setCart] = useState<CartItem[]>(() => {
  if (typeof window === 'undefined') return []; // SSR 환경 체크
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
});

// cart 변경 시 localStorage 동기화
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cart));
}, [cart]);
```

`useState(() => ...)` 형태는 **lazy initializer**로, 첫 마운트 시 한 번만 실행된다.

---

## 프로젝트 구조

```
week2-nextjs/
├── lib/
│   ├── auth.ts           ✅ Step 01 완성
│   ├── api.ts            ✅ Step 04 완성
│   └── cart-context.tsx  📝 이번 Step — 장바구니 전역 상태
└── app/
    ├── layout.tsx        CartProvider로 앱 전체를 감쌈
    ├── shop/page.tsx     ✅ Step 05 완성
    └── cart/page.tsx
```

---

## 주요 코드

```tsx
// lib/cart-context.tsx (핵심 부분)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // 8-a: localStorage에서 초기값 복원
  const [cart, setCart] = useState<CartItem[]>(() => { // ← [실습 8-a]
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // 8-b: cart 변경 시 localStorage 저장
  useEffect(() => {                                     // ← [실습 8-b]
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) return prev.map((i) =>
        i.productId === product.productId ? { ...i, quantity: i.quantity + 1 } : i
      );
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  // ... removeFromCart, updateQuantity, clearCart ...
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

1. **구현 전:** 상품 담기 후 새로고침 시 장바구니가 비워지는지 확인
2. **구현 후:** 상품 담기 → 새로고침 → 장바구니 유지 확인
3. **Application 탭:** `localStorage → cart` 키에 JSON 배열 저장 확인
4. **Week 1과 비교:** `useAuth.js`의 token localStorage 관리와 패턴이 어떻게 유사한지 확인

---

## 핵심 정리

> **Context는 prop drilling 없이 전역 상태를 공유한다. `useState` lazy initializer로 초기값을 localStorage에서 복원하고, `useEffect`로 변경 시 동기화하는 패턴은 Week 1의 token 관리와 완전히 동일하다. 이 패턴이 React 상태 영속성의 기본이다.**
