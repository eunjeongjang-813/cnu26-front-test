'use client';

// 헤더에 표시되는 장바구니 아이콘 + 개수 뱃지
// Server Component인 ShopPage 헤더 안에서 사용되는 Client Component

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function CartCount() {
  const { totalCount } = useCart();

  return (
    <Link href="/cart" className="cart-icon-link">
      🛒
      {totalCount > 0 && (
        <span className="cart-badge">{totalCount > 99 ? '99+' : totalCount}</span>
      )}
    </Link>
  );
}
