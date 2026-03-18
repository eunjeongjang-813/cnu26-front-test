import { get } from './client';

// 네이버 쇼핑 API를 통한 상품 검색
// BE: GET /shop/search?query=맥북&display=10
// 응답: ShoppingItem[] - { title, link, image, lprice, hprice, mallName, productId, brand, ... }
export async function searchProducts(query, display = 12) {
  // ============================================================
  // [실습 3] 상품 검색 API를 호출하세요
  // 힌트: get() 함수와 query parameter를 조합하세요
  // 힌트: encodeURIComponent()로 한글 인코딩을 처리하세요
  //
  // ✅ 모범 정답:
  //   return get(`/shop/search?query=${encodeURIComponent(query)}&display=${display}`);
  //
  // 📝 해설:
  //   get()은 client.js의 공통 함수로 GET 요청을 보냅니다.
  //   encodeURIComponent()는 '맥북' → '%EB%A7%A5%EB%B6%81' 처럼
  //   한글/특수문자를 URL에서 안전한 형태로 인코딩합니다.
  //   이 처리 없이 한글을 URL에 넣으면 서버에서 제대로 인식하지 못할 수 있습니다.
  //   display 파라미터는 검색 결과 개수를 조절하며 기본값은 12개입니다.
  //   템플릿 리터럴(``)을 사용해 경로와 파라미터를 깔끔하게 조합합니다.
  // ============================================================
  // TODO: GET /shop/search?query=...&display=... 를 호출하세요
  // 힌트: get() 함수와 encodeURIComponent()를 사용하세요
  // 힌트: return get(`/shop/search?query=${encodeURIComponent(query)}&display=${display}`);
}
