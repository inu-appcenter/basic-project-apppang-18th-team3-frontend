import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getRecentProducts } from '@/api/mypage';
import { useAuthStore } from '@/store/authStore';
import type { RecentProductItem } from '@/types/mypage';

function RecentProductCard({ product }: { product: RecentProductItem }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/products/${product.productId}`)}
      className="flex w-25 shrink-0 flex-col gap-1 text-left"
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt="" className="h-25 w-25 bg-gray-200 object-cover" />
      ) : (
        <div className="h-25 w-25 bg-gray-200" />
      )}
      <p className="text-body-10 line-clamp-1 text-black">{product.name}</p>
      <span className="text-body-9 font-semibold text-black">
        {product.price.toLocaleString()}원
      </span>
    </button>
  );
}

// 최근 찾던 상품의 연관 상품 — 메인/마이페이지 공통 (GET /api/users/recent-products)
function RecentProductsSection({ showAdLabel = false }: { showAdLabel?: boolean }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [products, setProducts] = useState<RecentProductItem[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      setProducts([]);
      return;
    }
    getRecentProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [isLoggedIn]);

  if (products.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 bg-white px-3 pt-1 pb-3">
      <div className="flex items-center justify-between">
        <h2 className="text-body-7 font-bold text-black">최근 찾던 상품의 연관 상품</h2>
        {showAdLabel && <span className="text-body-10 text-gray-300">광고</span>}
      </div>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
        {products.map((product) => (
          <RecentProductCard key={product.productId} product={product} />
        ))}
      </div>
    </div>
  );
}

export default RecentProductsSection;
