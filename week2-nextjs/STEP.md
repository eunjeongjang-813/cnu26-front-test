# Step 10: 장바구니 페이지 — 결제 플로우 완성

> 브랜치: `week2/step-10`

## 학습 목표
- Context 값을 사용해 장바구니 UI를 완성한다
- Route Handler를 통한 결제 플로우를 구현한다

## 핵심 개념
- `useCart()`: 장바구니 상태와 조작 함수 모두 가져오기
- `fetch('/api/checkout')`: Client Component에서 Route Handler 호출
- `clearCart()` + `router.push('/orders')`: 결제 후 상태 초기화 + 페이지 이동

## 구현

`app/cart/page.tsx`의 TODO 2곳을 완성하세요:

```ts
// 10-a: useCart로 필요한 것 가져오기
const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

// 10-b: 결제 핸들러
const handleCheckout = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });
    if (!res.ok) throw new Error('결제 처리 중 오류가 발생했습니다');
    clearCart();
    router.push('/orders');
  } catch (err) {
    setError(err instanceof Error ? err.message : '결제 실패');
  } finally {
    setLoading(false);
  }
};
```

## 전체 흐름

```
CartPage → [결제하기] 클릭 → handleCheckout()
→ POST /api/checkout (Route Handler) → BE 또는 Mock
→ clearCart() → localStorage 비워짐
→ router.push('/orders') → 주문 목록 페이지
```

## 이번 Step 에서 수정된 파일
- `app/cart/page.tsx` — 장바구니 페이지 (Client Component)

## 생각해볼 점
- 전체 Week 2 흐름을 정리해보세요: 로그인 → 상품검색 → 장바구니 → 결제 → 주문확인
- Server Component와 Client Component를 어떤 기준으로 나눴는가?
