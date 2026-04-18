import { get } from './client';

// 네이버 쇼핑 API를 통한 상품 검색
// BE: GET /shop/search?query=맥북&display=10
// 응답: ShoppingItem[] - { title, link, image, lprice, hprice, mallName, productId, brand, ... }
export async function searchProducts(query, display = 12) {

}
