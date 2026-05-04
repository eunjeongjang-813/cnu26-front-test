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
  // TODO [실습 10-a]: useCart로 필요한 값과 함수를 가져오세요
  // const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const cart: { productId: string; productName: string; price: number; image: string; quantity: number; }[] = [];
  const removeFromCart = (_id: string) => {};
  const updateQuantity = (_id: string, _qty: number) => {};
  const clearCart = () => {};
  const totalPrice = 0;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    // TODO [실습 10-b]: 결제 핸들러를 구현하세요
    // 1. setLoading(true), setError(null)
    // 2. fetch('/api/checkout', { method: 'POST', body: JSON.stringify({ items: cart }) })
    // 3. 성공: clearCart() → router.push('/orders')
    // 4. 실패: setError(...)
    // 5. finally: setLoading(false)
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
