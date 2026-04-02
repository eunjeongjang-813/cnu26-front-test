import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8080';

// ============================================================
// [실습 6] Route Handler로 주문 API를 구현하세요
//
// Next.js Route Handler란?
// - app/api/*/route.ts 파일에 HTTP 메서드별 함수를 export
// - 서버에서만 실행 → 토큰, 환경변수가 클라이언트에 노출 X
// - Client Component → Route Handler → 백엔드 순서로 호출 (CORS 우회)
// ============================================================

// POST /api/orders - 주문 생성
export async function POST(request: NextRequest) {
  // ============================================================
  // [실습 6-a] 쿠키에서 토큰을 읽어오세요
  // 힌트: cookies()는 next/headers에서 import, await 필요
  // ============================================================
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const body = await request.json();
  const { productId, productName, price, quantity = 1 } = body;

  if (!productId || !productName || !price) {
    return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
  }

  // ============================================================
  // [실습 6-b] 백엔드 POST /orders를 호출하세요
  // - Authorization 헤더에 토큰 포함
  // - 요청 body: { productId, productName, price, quantity }
  // ============================================================
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
}

// GET /api/orders - 내 주문 목록
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  // ============================================================
  // [실습 6-c] 백엔드 GET /orders/me를 호출하세요
  // - Authorization 헤더에 토큰 포함
  // - cache: 'no-store' — 주문 목록은 항상 최신이어야 함
  // ============================================================
  const res = await fetch(`${BACKEND_URL}/orders/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ error: '주문 목록 조회 실패' }, { status: res.status });
  }

  const orders = await res.json();
  return NextResponse.json(orders);
}
