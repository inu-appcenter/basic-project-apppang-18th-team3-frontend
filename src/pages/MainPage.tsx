import type { ReactNode } from 'react';
import {
  Camera,
  Coffee,
  Gift,
  Globe,
  Leaf,
  Monitor,
  Package,
  Search,
  ShoppingBag,
  Star,
  Tag,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────
type Banner = { id: number; bgColor: string };

type Category = { id: number; label: string; path: string; icon: ReactNode };

type Product = {
  id: number;
  price: number;
  discountedPrice?: number;
  rating: number;
  reviewCount: number;
  isRocket: boolean;
  isFreeShipping: boolean;
  hasTomorrow: boolean;
};

// ─── Constants ────────────────────────────────────────────
const BANNERS: Banner[] = [
  { id: 1, bgColor: 'bg-primary-100' },
  { id: 2, bgColor: 'bg-secondary-100' },
  { id: 3, bgColor: 'bg-primary-100' },
  { id: 4, bgColor: 'bg-secondary-100' },
  { id: 5, bgColor: 'bg-primary-100' },
];

const CATEGORIES: Category[] = [
  {
    id: 1,
    label: '자주산상품',
    path: '/products?category=frequent',
    icon: <ShoppingBag size={28} />,
  },
  { id: 2, label: '쿠팡플레이', path: '/products?category=play', icon: <Monitor size={28} /> },
  { id: 3, label: '로켓프레시', path: '/products?category=fresh', icon: <Leaf size={28} /> },
  { id: 4, label: '쿠팡이츠', path: '/products?category=eats', icon: <Coffee size={28} /> },
  { id: 5, label: '골드박스', path: '/products?category=goldbox', icon: <Gift size={28} /> },
  { id: 6, label: '반짝세일', path: '/products?category=flash', icon: <Zap size={28} /> },
  { id: 7, label: '패션/잡화', path: '/products?category=fashion', icon: <Tag size={28} /> },
  { id: 8, label: 'R.LUX', path: '/products?category=luxury', icon: <Star size={28} /> },
  { id: 9, label: '로켓배송', path: '/products?category=rocket', icon: <Package size={28} /> },
  { id: 10, label: '로켓직구', path: '/products?category=global', icon: <Globe size={28} /> },
];

const DUMMY_PRODUCTS: Product[] = [
  {
    id: 1,
    price: 58380,
    rating: 4.8,
    reviewCount: 31387,
    isRocket: true,
    isFreeShipping: false,
    hasTomorrow: true,
  },
  {
    id: 2,
    price: 58380,
    rating: 4.8,
    reviewCount: 31387,
    isRocket: true,
    isFreeShipping: false,
    hasTomorrow: true,
  },
  {
    id: 3,
    price: 58380,
    discountedPrice: 70000,
    rating: 4.8,
    reviewCount: 31387,
    isRocket: false,
    isFreeShipping: true,
    hasTomorrow: false,
  },
  {
    id: 4,
    price: 58380,
    discountedPrice: 70000,
    rating: 4.8,
    reviewCount: 31387,
    isRocket: false,
    isFreeShipping: true,
    hasTomorrow: false,
  },
];

// ─── Sub-components ───────────────────────────────────────
function StarRating({
  rating,
  reviewCount,
  productId,
}: {
  rating: number;
  reviewCount: number;
  productId: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={`star-${productId}-${i}`}
          size={10}
          className={
            i < Math.floor(rating)
              ? 'fill-yellow-300 text-yellow-300'
              : 'fill-gray-200 text-gray-200'
          }
        />
      ))}
      <span className="text-body-12 ml-0.5 text-gray-300">({reviewCount.toLocaleString()})</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/products/${product.id}`)}
      className="flex flex-col text-left"
    >
      <div className="aspect-square w-full bg-gray-200" />
      <div className="mt-2 flex flex-col gap-1">
        {product.discountedPrice && (
          <span className="text-body-10 text-red-300">
            ● {product.discountedPrice.toLocaleString()}원
          </span>
        )}
        <span className="text-body-7 font-bold text-black">{product.price.toLocaleString()}원</span>
        <div className="flex flex-wrap items-center gap-1">
          {product.isRocket && (
            <span className="text-body-11 bg-primary-100 text-primary-200 rounded px-1 py-0.5">
              로켓
            </span>
          )}
          {product.isFreeShipping && (
            <span className="text-body-11 rounded bg-red-300 px-1 py-0.5 text-white">무료배송</span>
          )}
          {product.hasTomorrow && <span className="text-body-11 text-gray-300">내일</span>}
        </div>
        <StarRating
          rating={product.rating}
          reviewCount={product.reviewCount}
          productId={product.id}
        />
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────
function MainPage() {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
      } else {
        setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
      }
    }
  };

  return (
    <div className="pb-4">
      {/* 검색 바 */}
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="flex w-full items-center gap-3 rounded-full border border-gray-200 px-4 py-2.5"
        >
          <Search size={16} className="shrink-0 text-gray-300" />
          <span className="text-body-8 flex-1 text-left text-gray-200">앱팡에서 검색하세요!</span>
          <Camera size={20} className="shrink-0 text-gray-300" />
        </button>
      </div>

      {/* 배너 슬라이더 */}
      <div
        className="relative h-48 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="배너 슬라이더"
      >
        {BANNERS.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => navigate('/products')}
            aria-label={`배너 ${banner.id}`}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${banner.bgColor} ${
              index === currentBanner ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <span className="text-body-5 text-gray-300">배너 슬라이더</span>
          </button>
        ))}

        {/* 도트 인디케이터 */}
        <div className="absolute right-0 bottom-3 left-0 z-10 flex justify-center gap-1.5">
          {BANNERS.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`배너 ${index + 1} 보기`}
              onClick={() => setCurrentBanner(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentBanner ? 'w-3 bg-black' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 카테고리 메뉴 */}
      <div className="border-b border-gray-200 px-2 py-4">
        <div className="grid grid-cols-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigate(cat.path)}
              className="hover:text-primary-200 flex flex-col items-center gap-1.5 py-2 text-black transition-colors"
            >
              {cat.icon}
              <span className="text-body-11 text-center leading-tight break-keep">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 최근 찾던 상품의 연관 상품 */}
      <div className="pt-5">
        <h2 className="text-body-5 mb-3 px-4 font-semibold text-black">최근 찾던 상품의 연관 상품</h2>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {DUMMY_PRODUCTS.map((product) => (
            <div key={product.id} className="w-36 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainPage;
