// ============================================================
// [실습 5] Server Component로 상품 목록을 SSR로 렌더링하세요
//
// Server Component 특징:
// - 'use client' 없음 → 서버에서 실행
// - async/await로 데이터 직접 패칭
// - useState, useEffect 사용 불가
// - 쿠키, 환경변수(비밀값)에 안전하게 접근 가능
// ============================================================

// TODO [실습 5-a, 5-b] 구현 후 아래 주석을 해제하세요:
// import { redirect } from 'next/navigation';
// import { searchProducts } from '@/lib/api';
// import { getTokenFromCookie, getMe } from '@/lib/auth-server';
import { ShoppingItem } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import LogoutButton from '@/components/LogoutButton';
import CartCount from '@/components/CartCount';

// searchParams: URL 쿼리 파라미터 (?query=맥북)
// Next.js App Router에서 Server Component는 searchParams를 props로 받음
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params.query ?? '맥북';

  // TODO [실습 5-a]: 쿠키에서 토큰을 읽고, 없으면 /login으로 리다이렉트
  // const token = await getTokenFromCookie();
  // if (!token) redirect('/login');

  // TODO [실습 5-b]: 병렬로 유저 정보와 상품 목록을 패칭하세요
  // 힌트: Promise.all([getMe(token), searchProducts(query)])
  const user = { name: '학생' }; // TODO: 실제 구현으로 교체
  const products: ShoppingItem[] = []; // TODO: 실제 구현으로 교체

  return (
    <div>
      <header className="header">
        <h1>CNU 쇼핑몰</h1>
        <div className="header-user">
          <span>안녕하세요, {user.name}님!</span>
          <CartCount />
          <LogoutButton />
        </div>
      </header>

      <main className="main">
        {/* SearchBar는 Client Component (입력 이벤트 필요) */}
        <SearchBar defaultQuery={query} />

        <p className="result-count">
          &ldquo;{query}&rdquo; 검색 결과 {products.length}개
        </p>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
