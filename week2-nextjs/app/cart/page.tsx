'use client';

// ============================================================
// 장바구니 페이지 — Client Component
//
// Client Component인 이유:
//   - useCart() Context 접근 (localStorage 기반)
//   - 수량 조절 버튼(+/-), 삭제 버튼 등 이벤트 핸들러 필요
//
// 페이지 흐름:
//   /shop → [장바구니 담기] → /cart (이 페이지) → [결제하기] → /orders
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  // ============================================================
  // [실습 10-a] useCart로 필요한 값과 함수를 가져오세요
  //
  // ✅ 모범 정답:
  //   const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  //
  // 📝 해설:
  //   useCart()는 CartContext에서 만든 커스텀 훅입니다.
  //   구조 분해 할당으로 필요한 것만 꺼냅니다.
  //   cart: CartItem 배열 → 화면에 표시
  //   removeFromCart: 특정 상품 삭제
  //   updateQuantity: 수량 변경
  //   clearCart: 전체 비우기 (결제 완료 후 호출)
  //   totalPrice: 총 금액 (cart에서 파생된 계산값)
  // ============================================================
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } =
    useCart(); // TODO

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ============================================================
  // [실습 10-b] 결제 핸들러를 구현하세요
  //
  // ✅ 모범 정답:
  //   const handleCheckout = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const res = await fetch('/api/checkout', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ items: cart }),
  //       });
  //       if (!res.ok) throw new Error('결제 처리 중 오류가 발생했습니다');
  //       clearCart();
  //       router.push('/orders');
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : '결제 실패');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  // 📝 해설:
  //   fetch('/api/checkout'): Next.js Route Handler 호출 (서버에서 BE로 전달)
  //   body: JSON.stringify({ items: cart }): 장바구니 전체를 서버로 전송
  //   clearCart(): 결제 성공 후 장바구니를 비웁니다 (localStorage도 초기화)
  //   router.push('/orders'): 주문 목록 페이지로 이동
  //   try/catch/finally: 에러 처리 + 로딩 상태 정리
  // ============================================================
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

  // 빈 장바구니 상태
  if (cart.length === 0) {
    return (
      <div className="main">
        <div className="cart-header">
          <h2 className="page-title">장바구니</h2>
          <Link href="/shop" className="btn-primary">
            쇼핑 계속하기
          </Link>
        </div>
        <div className="empty-state">
          <span style={{ fontSize: '3rem' }}>🛒</span>
          <p>장바구니가 비어있습니다</p>
          <Link href="/shop" className="btn-primary">
            상품 보러가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="cart-header">
        <h2 className="page-title">장바구니 ({cart.length}종)</h2>
        <Link href="/shop" className="btn-back">
          ← 쇼핑 계속하기
        </Link>
      </div>

      {/* 장바구니 아이템 목록 */}
      <div className="cart-list">
        {cart.map((item) => (
          <div key={item.productId} className="cart-item">
            {/* 상품 이미지 */}
            {item.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.productName}
                className="cart-item-image"
              />
            )}

            {/* 상품 정보 */}
            <div className="cart-item-info">
              <p className="cart-item-name">{item.productName}</p>
              <p className="cart-item-price">
                {Number(item.price).toLocaleString()}원
              </p>
            </div>

            {/* 수량 조절 */}
            <div className="cart-item-quantity">
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="qty-value">{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                +
              </button>
            </div>

            {/* 소계 */}
            <p className="cart-item-subtotal">
              {(item.price * item.quantity).toLocaleString()}원
            </p>

            {/* 삭제 */}
            <button
              className="btn-remove"
              onClick={() => removeFromCart(item.productId)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 합계 & 결제 */}
      <div className="cart-summary">
        <div className="cart-total">
          <span>총 결제 금액</span>
          <strong>{totalPrice.toLocaleString()}원</strong>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="cart-actions">
          <button
            className="btn-clear"
            onClick={clearCart}
            disabled={loading}
          >
            전체 삭제
          </button>
          <button
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? '결제 처리 중...' : `${totalPrice.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
}
