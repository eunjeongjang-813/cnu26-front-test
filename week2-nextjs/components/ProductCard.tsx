import type { ShoppingItem } from '@/lib/api';
import AddToCartButton from './AddToCartButton';

// Server Component (기본값 — 'use client' 없음)
// AddToCartButton은 Client Component이지만 Server Component 안에 포함 가능합니다.

export default function ProductCard({ product }: { product: ShoppingItem }) {
  const cleanTitle = product.title.replace(/<[^>]+>/g, '');
  const price = product.lprice
    ? `${Number(product.lprice).toLocaleString()}원`
    : '가격 정보 없음';

  return (
    <div className="product-card">
      <a href={product.link} target="_blank" rel="noopener noreferrer">
        {product.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={cleanTitle}
            className="product-image"
            loading="lazy"
          />
        )}
      </a>
      <div className="product-info">
        <h3 className="product-title">{cleanTitle}</h3>
        <p className="product-price">{price}</p>
        {product.brand && (
          <p className="product-brand">브랜드: {product.brand}</p>
        )}
        {product.mallName && (
          <p className="product-mall">{product.mallName}</p>
        )}
        {/* AddToCartButton은 Client Component — useCart() 훅 사용 */}
        <AddToCartButton
          product={{
            productId: String(product.productId), // ShoppingItem.productId는 number, CartItem은 string
            productName: cleanTitle,
            price: Number(product.lprice) || 0,
            image: product.image ?? '',
          }}
        />
      </div>
    </div>
  );
}
