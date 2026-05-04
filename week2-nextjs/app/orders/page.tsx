// ============================================================
// [실습 7] 주문 목록 페이지 - Server Component로 SSR 구현
//
// 왜 SSR인가?
// - 사용자마다 다른 주문 데이터 → 캐시하면 안 됨 → cache: 'no-store'
// - 로그인한 사용자만 접근 → 서버에서 인증 체크
// ============================================================

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getMyOrders } from '@/lib/api';
import { getTokenFromCookie } from '@/lib/auth-server';

export default async function OrdersPage() {
  // TODO [실습 7-a]: 토큰을 읽어오고, 없으면 /login으로 리다이렉트
  // const token = await getTokenFromCookie();
  // if (!token) redirect('/login');
  const token = 'placeholder'; // TODO: 위 코드로 교체하세요

  // TODO [실습 7-b]: 주문 목록을 가져오세요
  // const orders = await getMyOrders(token);
  const orders: { id: number; productId: number; productName: string; price: number; quantity: number; createdAt: string; }[] = []; // TODO: 실제 구현으로 교체

  return (
    <div>
      <header className="header">
        <h1>CNU 쇼핑몰</h1>
        <nav className="header-nav">
          <Link href="/shop">쇼핑 계속</Link>
        </nav>
      </header>

      <main className="main">
        <h2 className="page-title">내 주문 목록</h2>

        {orders.length === 0 ? (
          <div className="empty-state">
            <p>아직 주문이 없습니다</p>
            <Link href="/shop" className="btn-primary">쇼핑하러 가기</Link>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-info">
                  <h3 className="order-product-name">{order.productName}</h3>
                  <p className="order-price">
                    {Number(order.price).toLocaleString()}원 × {order.quantity}개
                  </p>
                  <p className="order-total">
                    합계: {(Number(order.price) * order.quantity).toLocaleString()}원
                  </p>
                </div>
                <time className="order-date" dateTime={order.createdAt}>
                  {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                </time>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
