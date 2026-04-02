// 서버 사이드 API 호출 함수 모음
// 서버 컴포넌트와 Route Handler에서 사용 (클라이언트 X)

// 서버(Server Component, Route Handler): 직접 BE 호출 (CORS 없음)
// 클라이언트(Client Component): /api 경로로 요청 → next.config.ts rewrites가 BE로 중계
const BACKEND_URL =
  typeof window === 'undefined'
    ? (process.env.BACKEND_URL ?? 'http://localhost:8080')
    : '/api';

// ============================================================
// [실습 4] BE API를 서버에서 호출하는 함수들을 구현하세요
//
// 포인트: 서버에서 호출하므로 CORS 없음, API 키 안전하게 보관 가능
// ============================================================

export interface ShoppingItem {
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productId: number;
  brand: string;
  maker: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Order {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  createdAt: string;
}

// 상품 검색 (SSR/ISR용)
// GET /shop/search?query=맥북&display=12
export async function searchProducts(query: string, display = 12, token?: string): Promise<ShoppingItem[]> {
  const res = await fetch(
    `${BACKEND_URL}/shop/search?query=${encodeURIComponent(query)}&display=${display}`,
    {
      next: { revalidate: 60 }, // 60초마다 갱신 (ISR)
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!res.ok) throw new Error('상품 검색 실패');
  return res.json();
}

// 내 정보 조회 (SSR용 - 토큰 필요)
// GET /users/me
export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${BACKEND_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store', // 항상 최신 정보
  });

  if (!res.ok) throw new Error('사용자 정보 조회 실패');
  return res.json();
}

// 이름으로 유저 조회 — 없으면 null 반환
export async function findUserByName(name: string): Promise<User | null> {
  const res = await fetch(
    `${BACKEND_URL}/users/search?name=${encodeURIComponent(name)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return null;
  const page = await res.json();
  return page.content?.[0] ?? null;
}

// 회원가입
export async function signUpUser(name: string, email: string): Promise<User> {
  const res = await fetch(`${BACKEND_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });
  if (!res.ok) throw new Error('회원가입 실패');
  return res.json();
}

// 로그인 - JWT 토큰 발급
export async function loginUser(userId: number): Promise<{ token: string }> {
  const res = await fetch(`${BACKEND_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('로그인 실패');
  return res.json();
}

// 주문 목록 조회 (SSR용 — 서버에서 BE 직접 호출)
// GET /orders/me
export async function getMyOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${BACKEND_URL}/orders/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store', // 주문은 사용자마다 다르고 항상 최신이어야 함
  });
  if (!res.ok) throw new Error('주문 목록 조회 실패');
  return res.json();
}
