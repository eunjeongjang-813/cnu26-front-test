'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  productId: number;
  productName: string;
  price: number;
}

// Server Component(ProductCard)에 포함되는 Client Component
// 구매 버튼 클릭 → /api/orders (Route Handler) 호출
export default function PurchaseButton({ productId, productName, price }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // Next.js Route Handler 호출 (/api/orders/route.ts)
      // 쿠키는 자동으로 포함됨 (same-origin 요청)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, productName, price, quantity: 1 }),
      });

      if (!res.ok) throw new Error('구매 실패');

      alert(`"${productName}" 구매 완료!`);
      router.push('/orders'); // 주문 목록으로 이동
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="btn-purchase"
    >
      {loading ? '처리 중...' : '구매하기'}
    </button>
  );
}
