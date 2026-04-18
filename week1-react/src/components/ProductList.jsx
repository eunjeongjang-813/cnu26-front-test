import { useState, useEffect } from 'react';
import { searchProducts } from '../api/shop';
import ProductCard from './ProductCard';

const DEFAULT_QUERY = '맥북';

export default function ProductList() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [inputValue, setInputValue] = useState(DEFAULT_QUERY);


  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQuery(inputValue.trim());
    }
  };

  return (
    <div className="product-list-container">
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="검색어를 입력하세요"
        />
        <button type="submit" className="btn-primary">
          검색
        </button>
      </form>

      {loading && <p className="status-msg">상품을 불러오는 중...</p>}
      {error && <p className="error-msg">오류: {error}</p>}

      {!loading && !error && (
        <>
          <p className="result-count">
            &quot;{query}&quot; 검색 결과 {products.length}개
          </p>
          <div className="product-grid">
            {products.map((product) => (
              // key: 리스트 렌더링 시 React가 각 항목을 구분하는 고유 식별자
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
