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
  // ============================================================
  // [실습 9-a] useCart 훅에서 addToCart를 가져오세요
  //
  // ✅ 모범 정답:
  //   const { addToCart } = useCart();
  //
  // 📝 해설:
  //   useCart()는 lib/cart-context.tsx에서 정의한 커스텀 훅입니다.
  //   구조 분해 할당으로 필요한 함수만 꺼내씁니다.
  //   CartProvider가 app/layout.tsx에서 앱 전체를 감싸고 있으므로
  //   어느 Client Component에서든 useCart()를 호출할 수 있습니다.
  // ============================================================
  const { addToCart } = useCart(); // TODO
  const [added, setAdded] = useState(false);

  // ============================================================
  // [실습 9-b] handleAddToCart 함수를 구현하세요
  // 1. addToCart(product) 호출
  // 2. added 상태를 true로 변경 (버튼 텍스트 변경)
  // 3. 1.5초 후 added를 다시 false로 복원
  //
  // ✅ 모범 정답:
  //   const handleAddToCart = () => {
  //     addToCart(product);
  //     setAdded(true);
  //     setTimeout(() => setAdded(false), 1500);
  //   };
  //
  // 📝 해설:
  //   addToCart(product): Context의 함수를 호출해 cart 상태를 업데이트합니다.
  //   setAdded(true): 버튼 텍스트를 "담기 완료 ✓"로 변경 → 사용자 피드백
  //   setTimeout: 1.5초 후 버튼을 원래 상태로 복원
  //   이 3줄이 "클릭 → 상태 업데이트 → UI 반영"의 전형적인 React 패턴입니다.
  // ============================================================
  const handleAddToCart = () => {
    addToCart(product); // TODO
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
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
