import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { CartItem } from '@/lib/cart-context';

// POST /api/checkout — 장바구니 일괄 결제
//
// 흐름:
//   CartPage(Client) → POST /api/checkout → BE POST /orders (아이템별 개별 저장)
//   쿠키의 토큰을 서버에서 읽어 BE 요청에 포함

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const body = await request.json();
  const items: CartItem[] = body.items;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: '장바구니가 비어있습니다' }, { status: 400 });
  }

  const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

  // 장바구니 아이템을 개별 주문으로 백엔드에 저장 (병렬 처리)
  const results = await Promise.all(
    items.map((item) =>
      fetch(`${BACKEND_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
        }),
      })
    )
  );

  const failed = results.find((r) => !r.ok);
  if (failed) {
    return NextResponse.json({ error: '주문 처리 중 오류가 발생했습니다' }, { status: 500 });
  }

  const orders = await Promise.all(results.map((r) => r.json()));
  return NextResponse.json({ message: '주문이 완료되었습니다', orders }, { status: 201 });
}
