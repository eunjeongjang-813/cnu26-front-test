import { useState, useEffect } from "react";
import { searchProducts } from "../api/shop";
import ProductCard from "./ProductCard";

const DEFAULT_QUERY = "맥북";

export default function ProductList() {
  // ============================================================
  // [실습 6-a] 아래 3가지 상태를 useState로 선언하세요
  // - products: 상품 목록 (초기값: 빈 배열 [])
  // - loading: 로딩 여부 (초기값: true)
  // - error: 오류 메시지 (초기값: null)
  //
  // ✅ 모범 정답:
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //
  // 📝 해설:
  //   - products: API 응답 배열을 담으므로 초기값을 [] 로 설정합니다.
  //     null로 설정하면 아래 products.map()에서 null.map() 오류가 발생합니다.
  //   - loading: 컴포넌트 마운트 시 즉시 데이터를 불러오므로 초기값을 true로 설정합니다.
  //     false로 설정하면 데이터 로딩 전에 빈 목록이 잠깐 보이는 깜빡임이 생깁니다.
  //   - error: 오류가 없으면 null, 있으면 오류 메시지 문자열로 사용합니다.
  // ============================================================
  // const [products, setProducts] = useState([]); // TODO
  // const [loading, setLoading] = useState(true); // TODO
  // const [error, setError] = useState(null); // TODO
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [inputValue, setInputValue] = useState(DEFAULT_QUERY);

  // ============================================================
  // [실습 6-b] useEffect를 사용해 상품을 불러오세요
  // - query가 바뀔 때마다 searchProducts(query)를 호출
  // - 성공 시: setProducts(data), setLoading(false)
  // - 실패 시: setError(err.message), setLoading(false)
  // - 힌트: 의존성 배열에 query를 넣으세요
  //
  // ✅ 모범 정답:
  //   useEffect(() => {
  //     setLoading(true);
  //     setError(null);
  //
  //     searchProducts(query)
  //       .then((data) => {
  //         setProducts(data);
  //         setLoading(false);
  //       })
  //       .catch((err) => {
  //         setError(err.message);
  //         setLoading(false);
  //       });
  //   }, [query]);
  //
  // 📝 해설:
  //   useEffect는 컴포넌트가 렌더링된 후 부수 효과(API 호출 등)를 실행합니다.
  //   의존성 배열 [query]: query가 바뀔 때마다 effect가 재실행됩니다.
  //   [] (빈 배열): 마운트 시 한 번만 실행됩니다.
  //   의존성 배열 생략: 매 렌더링마다 실행되어 무한 루프가 발생할 수 있습니다.
  //
  //   effect 내부 흐름:
  //   1) setLoading(true), setError(null) → 새 검색 시작 전 상태 초기화
  //   2) searchProducts(query) → API 호출 (Promise 반환)
  //   3) .then(data => ...): 성공 시 데이터로 상태 업데이트 + 로딩 종료
  //   4) .catch(err => ...): 실패 시 오류 메시지 저장 + 로딩 종료
  //
  //   async/await 방식으로도 작성 가능합니다:
  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         setLoading(true);
  //         const data = await searchProducts(query);
  //         setProducts(data);
  //       } catch (err) {
  //         setError(err.message);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchData();
  //   }, [query]);
  //   (useEffect의 콜백은 직접 async 함수가 될 수 없으므로 내부 함수를 선언해서 호출합니다)
  // ============================================================
  useEffect(() => {
    setLoading(true);
    setError(null);

    searchProducts(query)
      .then((data) => {
        setProducts(data); // TODO: 이 부분을 직접 작성해보세요
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [query]); // TODO: 의존성 배열

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
            "{query}" 검색 결과 {products.length}개
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
