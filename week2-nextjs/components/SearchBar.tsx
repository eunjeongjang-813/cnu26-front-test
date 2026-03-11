"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Server Component(ShopPage)에 포함되는 Client Component
// 검색어 입력 → URL 쿼리 파라미터 업데이트 → 서버에서 새 데이터 패칭 (SSR)
export default function SearchBar({ defaultQuery }: { defaultQuery: string }) {
  const [query, setQuery] = useState(defaultQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // URL을 변경하면 server component(ShopPage)가 새로운 searchParams로 다시 실행됨
      router.push(`/shop?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색어를 입력하세요"
      />
      <button type="submit" className="btn-primary">
        검색
      </button>
    </form>
  );
}
