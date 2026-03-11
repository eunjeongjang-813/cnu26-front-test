import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { CartItem } from '@/lib/cart-context';

// ============================================================
// POST /api/checkout — 장바구니 일괄 결제
//
// 현재 상태: TO-BE (BE 주문 API 미완성)
// 현재는 Mock 응답을 반환합니다.
//
// TO-BE 구현 시 변경할 부분:
//   1. BE에 POST /orders/batch 엔드포인트 추가
//   2. 아래 Mock 응답 주석 해제 후 실제 BE 호출로 교체
//
// 흐름:
//   CartPage(Client) → POST /api/checkout → BE /orders (예정)
//   쿠키의 토큰을 서버에서 읽어 BE 요청에 포함
// ============================================================

export async function POST(request: NextRequest) {
  // 쿠키에서 인증 토큰 읽기
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const body = await request.json();
  const items: CartItem[] = body.items;

  if (!items || items.length === 0) {
    return NextResponse.json(
      { error: '장바구니가 비어있습니다' },
      { status: 400 }
    );
  }

  // ============================================================
  // TO-BE: BE API 연동 (현재는 Mock 응답)
  //
  // 실제 구현 예시:
  //   const orders = await Promise.all(
  //     items.map((item) =>
  //       fetch(`${process.env.BACKEND_URL}/orders`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({
  //           productId: item.productId,
  //           productName: item.productName,
  //           price: item.price,
  //           quantity: item.quantity,
  //         }),
  //       }).then((r) => r.json())
  //     )
  //   );
  //   return NextResponse.json({ orders }, { status: 201 });
  // ============================================================

  // Mock 응답 (TO-BE 완료 전까지 사용)
  const mockOrders = items.map((item, idx) => ({
    id: Date.now() + idx,
    productId: item.productId,
    productName: item.productName,
    price: item.price,
    quantity: item.quantity,
    totalPrice: item.price * item.quantity,
    orderedAt: new Date().toISOString(),
    status: 'PENDING',
  }));

  return NextResponse.json(
    { message: '주문이 완료되었습니다 (Mock)', orders: mockOrders },
    { status: 201 }
  );
}
