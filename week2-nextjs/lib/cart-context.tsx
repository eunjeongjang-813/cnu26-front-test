'use client';

// ============================================================
// 장바구니 전역 상태 관리 — React Context + useState + localStorage
//
// 왜 Context인가?
//   - 장바구니 데이터는 여러 컴포넌트에서 필요합니다:
//     ShopPage(헤더 뱃지), ProductCard(담기 버튼), CartPage(목록)
//   - Context 없이 props로 전달하면 "prop drilling" 발생
//     App → ShopPage → Header → CartCount  ← 너무 깊다
//
// BE와 비교:
//   CartContext ≈ Service 레이어 (비즈니스 로직 캡슐화)
//   useCart()   ≈ @Autowired Service (어디서든 꺼내 쓰기)
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

// ─── 타입 정의 ──────────────────────────────────────────────
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextValue {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
}

// ─── Context 생성 ───────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  // ============================================================
  // [실습 8-a] localStorage에서 장바구니 초기값을 불러오세요
  //
  // ✅ 모범 정답:
  //   const [cart, setCart] = useState<CartItem[]>(() => {
  //     if (typeof window === 'undefined') return [];
  //     try {
  //       const saved = localStorage.getItem('cart');
  //       return saved ? JSON.parse(saved) : [];
  //     } catch {
  //       return [];
  //     }
  //   });
  //
  // 📝 해설:
  //   useState의 초기화 함수(lazy initializer)를 사용합니다.
  //   () => ... 형태로 전달하면 컴포넌트가 처음 마운트될 때 한 번만 실행됩니다.
  //   typeof window === 'undefined': SSR(서버) 환경에서는 localStorage가 없으므로 체크합니다.
  //   JSON.parse: localStorage에는 문자열만 저장되므로 파싱이 필요합니다.
  //   1주차의 localStorage.getItem('token')과 같은 패턴 — 브라우저 저장소에서 복원.
  // ============================================================
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('cart');
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  // ============================================================
  // [실습 8-b] cart가 바뀔 때마다 localStorage에 저장하세요
  //
  // ✅ 모범 정답:
  //   useEffect(() => {
  //     localStorage.setItem('cart', JSON.stringify(cart));
  //   }, [cart]);
  //
  // 📝 해설:
  //   cart 상태가 바뀔 때마다 localStorage에 직렬화해서 저장합니다.
  //   JSON.stringify: 객체/배열 → 문자열 변환 (localStorage는 문자열만 저장)
  //   의존성 배열 [cart]: cart가 바뀔 때만 실행 (1주차 useEffect와 동일 패턴)
  //   새로고침해도 위의 useState 초기화 함수에서 이 값을 읽어 복원됩니다.
  // ============================================================
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ─── 장바구니 추가 ──────────────────────────────────────
  // 이미 있는 상품 → quantity +1 / 없으면 quantity: 1로 새로 추가
  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  // ─── 장바구니 삭제 ──────────────────────────────────────
  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  // ─── 수량 변경 ──────────────────────────────────────────
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return; // 0 이하로 내려가지 않도록 방어
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  // ─── 전체 비우기 ────────────────────────────────────────
  const clearCart = useCallback(() => setCart([]), []);

  // ─── 파생 값 (매 렌더링마다 계산) ─────────────────────
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── 커스텀 훅 ───────────────────────────────────────────────
// CartProvider 외부에서 useCart()를 호출하면 즉시 에러 발생 → 실수 방지
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart는 CartProvider 내부에서만 사용할 수 있습니다');
  }
  return context;
}
