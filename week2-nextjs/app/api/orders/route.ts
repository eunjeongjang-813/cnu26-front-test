import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

// ============================================================
// [실습 6] Route Handler로 주문 API를 구현하세요
//
// Next.js Route Handler란?
// - app/api/*/route.ts 파일에 HTTP 메서드별 함수를 export
// - 서버에서만 실행 → 토큰, 환경변수가 클라이언트에 노출 X
// - BE API 호출을 프록시하거나, 직접 DB 접근도 가능
// ============================================================

// POST /api/orders - 주문 생성
export async function POST(request: NextRequest) {
  // TODO [실습 6-a]: 쿠키에서 토큰을 읽어오세요
  // const cookieStore = await cookies();
  // const token = cookieStore.get('token')?.value;
  const token = undefined; // TODO: 위 코드로 구현하세요

  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const body = await request.json();
  const { productId, productName, price, quantity = 1 } = body;

  if (!productId || !productName || !price) {
    return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
  }

  // ============================================================
  // [실습 6-b] BE의 POST /orders 를 호출하세요
  // BE 미완성 시: Mock 응답을 반환하세요
  // ============================================================

  // BE API 미완성 시 Mock 응답 (임시)
  const mockOrder = {
    id: Date.now(),
    productId,
    productName,
    price,
    quantity,
    createdAt: new Date().toISOString(),
  };

  console.log('주문 생성 (Mock):', mockOrder, '| token:', token.slice(0, 20) + '...');
  return NextResponse.json(mockOrder, { status: 201 });

  /* 실제 BE 완성 후 아래 코드로 교체:
  const res = await fetch(`${BACKEND_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, productName, price, quantity }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: '주문 실패' }, { status: res.status });
  }

  const order = await res.json();
  return NextResponse.json(order, { status: 201 });
  */
}

// GET /api/orders - 내 주문 목록
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  // BE API 미완성 시 Mock 응답
  const mockOrders = [
    { id: 1, productId: 12345, productName: '맥북 Pro 14인치', price: 3200000, quantity: 1, createdAt: new Date().toISOString() },
    { id: 2, productId: 67890, productName: 'AirPods Pro', price: 350000, quantity: 1, createdAt: new Date().toISOString() },
  ];

  return NextResponse.json(mockOrders);

  /* 실제 BE 완성 후:
  const res = await fetch(`${BACKEND_URL}/orders/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const orders = await res.json();
  return NextResponse.json(orders);
  */
}
