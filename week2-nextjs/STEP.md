# Step 10: 장바구니 페이지 — 결제 플로우 완성

> **브랜치:** `week2/step-10`
> **수정 파일:** `app/cart/page.tsx`

---

## 학습 목표

- `useCart()`로 장바구니 전체 상태와 조작 함수를 가져와 UI를 완성한다.
- Client Component에서 Route Handler(`/api/checkout`)를 호출하는 결제 플로우를 구현한다.
- Week 2 전체 흐름을 하나로 연결한다.

---

## 핵심 개념 설명

### 결제 플로우

```
CartPage (Client Component)
  → [결제하기] 클릭
  → fetch('POST /api/checkout', { items: cart })
  → Route Handler (서버)
      → 쿠키에서 token 읽기
      → BE POST /orders 호출 (또는 Mock)
  → 성공: clearCart() + router.push('/orders')
  → 실패: setError(...)
```

### Week 2 전체 흐름 정리

```
로그인 (Client) → document.cookie 저장
  ↓
proxy.ts: 모든 보호 경로에서 쿠키 확인
  ↓
ShopPage (Server): searchProducts + getMe 병렬 패칭
  ↓
AddToCartButton (Client): useCart().addToCart → localStorage 저장
  ↓
CartPage (Client): useCart() + fetch('/api/checkout')
  ↓
Route Handler (Server): 쿠키 읽기 → BE 호출
  ↓
OrdersPage (Server): getMyOrders → SSR 렌더링
```

---

## 프로젝트 구조

```
week2-nextjs/
├── proxy.ts              ✅ Step 02 완성
├── lib/
│   ├── auth.ts           ✅ Step 01 완성
│   ├── api.ts            ✅ Step 04 완성
│   └── cart-context.tsx  ✅ Step 08 완성
└── app/
    ├── shop/page.tsx     ✅ Step 05 완성
    ├── api/orders/route.ts ✅ Step 06 완성
    ├── orders/page.tsx   ✅ Step 07 완성
    └── cart/
        └── page.tsx      📝 이번 Step — 장바구니 결제 완성
```

---

## 주요 코드

```tsx
// app/cart/page.tsx

'use client';

export default function CartPage() {
  // 10-a: useCart로 필요한 것 모두 가져오기
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart(); // ← [실습 10-a]

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 10-b: 결제 핸들러
  const handleCheckout = async () => {      // ← [실습 10-b]
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      if (!res.ok) throw new Error('결제 처리 중 오류가 발생했습니다');
      clearCart();              // localStorage도 함께 비워짐 (Step 08)
      router.push('/orders');   // 주문 목록 페이지로 이동
    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {cart.map((item) => ( /* 장바구니 아이템 목록 */ ))}
      <button onClick={handleCheckout} disabled={loading}>
        {totalPrice.toLocaleString()}원 결제하기
      </button>
    </div>
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

1. **구현 전:** 장바구니 페이지에 상품 목록이 표시되지 않고 결제 버튼 클릭 시 아무 반응 없음 확인
2. **구현 후:** 장바구니 목록 표시 → 수량 조절 → 결제 → 주문 목록 페이지 이동 확인
3. **clearCart():** 결제 후 localStorage의 `cart` 키가 `[]`로 초기화되는지 확인
4. **전체 플로우:** 로그인 → 상품 담기 → 결제 → 주문 확인 전체를 한 번 실행해보기

---

## 핵심 정리

> **Step 10은 Week 2의 마지막 퍼즐 조각이다. Client Component(`CartPage`) → Route Handler(`/api/checkout`) → 서버 쿠키 인증 → BE 호출의 흐름이 Week 2에서 배운 모든 개념을 하나로 연결한다. Server Component와 Client Component, 쿠키 인증, Route Handler, Context — 이 다섯 개념이 함께 동작하는 완성된 쇼핑몰이다.**
