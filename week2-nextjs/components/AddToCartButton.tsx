'use client';

// ============================================================
// AddToCartButton — 상품 카드에서 장바구니 담기 버튼
//
// Client Component인 이유:
//   - useCart() 훅 사용 (Context 접근)
//   - onClick 이벤트 핸들러 필요
//   - 담기 완료 후 시각적 피드백 (added 상태)
// ============================================================

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import type { CartItem } from '@/lib/cart-context';

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  // TODO [실습 9-a]: useCart 훅에서 addToCart를 가져오세요
  // const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    // TODO [실습 9-b]: handleAddToCart를 구현하세요
    // 1. addToCart(product) 호출
    // 2. setAdded(true)
    // 3. setTimeout(() => setAdded(false), 1500)
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
