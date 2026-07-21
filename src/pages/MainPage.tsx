import type { ReactNode } from 'react';
import {
  Camera,
  Clock7,
  Gift,
  HandPlatter,
  Milk,
  Pizza,
  Popcorn,
  Rocket,
  Search,
  Shirt,
  Star,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getBanners } from '@/api/banner';
import type { BannerResponse } from '@/types/banner';

// ─── Types ────────────────────────────────────────────────
type Category = { id: number; label: string; path: string; icon: ReactNode };

type ProductCard = {
  id: number;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  isRocket: boolean;
};

// ─── Constants ────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    id: 1,
    label: '식품',
    path: '/products?category=식품',
    icon: <Pizza size={36} strokeWidth={1.5} />,
  },
  {
    id: 2,
    label: '생활용품',
    path: '/products?category=생활용품',
    icon: <Popcorn size={36} strokeWidth={1.5} />,
  },
  {
    id: 3,
    label: '뷰티',
    path: '/products?category=뷰티',
    icon: <Milk size={36} strokeWidth={1.5} />,
  },
  {
    id: 4,
    label: '의류·잡화',
    path: '/products?category=의류·잡화',
    icon: <Shirt size={36} strokeWidth={1.5} />,
  },
  {
    id: 5,
    label: '가전·디지털',
    path: '/products?category=가전·디지털',
    icon: <Gift size={36} strokeWidth={1.5} />,
  },
  {
    id: 6,
    label: '홈인테리어',
    path: '/products?category=홈인테리어',
    icon: <Clock7 size={36} strokeWidth={1.5} />,
  },
  {
    id: 7,
    label: '출산·유아',
    path: '/products?category=출산·유아',
    icon: <Shirt size={36} strokeWidth={1.5} />,
  },
  {
    id: 8,
    label: '반려동물',
    path: '/products?category=반려동물',
    icon: <HandPlatter size={36} strokeWidth={1.5} />,
  },
  {
    id: 9,
    label: '스포츠·레저',
    path: '/products?category=스포츠·레저',
    icon: <Rocket size={36} strokeWidth={1.5} />,
  },
  {
    id: 10,
    label: '자동차용품',
    path: '/products?category=자동차용품',
    icon: <Rocket size={36} strokeWidth={1.5} />,
  },
];

const DUMMY_PRODUCTS: ProductCard[] = [
  { id: 1, price: 58380, rating: 4.8, reviewCount: 31387, isRocket: true },
  { id: 2, price: 58380, originalPrice: 70000, rating: 4.8, reviewCount: 31387, isRocket: true },
  { id: 3, price: 58380, rating: 4.8, reviewCount: 31387, isRocket: false },
  { id: 4, price: 58380, originalPrice: 70000, rating: 4.8, reviewCount: 31387, isRocket: false },
  { id: 5, price: 58380, rating: 4.8, reviewCount: 31387, isRocket: true },
  { id: 6, price: 58380, originalPrice: 70000, rating: 4.8, reviewCount: 31387, isRocket: true },
  { id: 7, price: 58380, rating: 4.8, reviewCount: 31387, isRocket: false },
  { id: 8, price: 58380, originalPrice: 70000, rating: 4.8, reviewCount: 31387, isRocket: false },
];

function chunkPairs<T>(arr: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    pairs.push(arr.slice(i, i + 2));
  }
  return pairs;
}

// ─── Sub-components ───────────────────────────────────────
function StarRow({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-end gap-0.5">
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={12}
            className={
              i < Math.round(rating)
                ? 'fill-yellow-300 text-yellow-300'
                : 'fill-gray-200 text-gray-200'
            }
          />
        ))}
      </div>
      <span className="text-[10px] leading-none text-gray-300">
        ({reviewCount.toLocaleString()})
      </span>
    </div>
  );
}

function RocketBadge() {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        <Rocket size={12} className="text-secondary-300" />
        <span className="text-secondary-300 text-[10px] leading-none font-semibold">로켓</span>
      </div>
      <span className="text-secondary-200 text-[9px] leading-none font-semibold">내일도착</span>
    </div>
  );
}

function FreeShippingBadge() {
  return (
    <div className="bg-secondary-100 inline-flex items-center rounded-xs px-1 py-0.5">
      <span className="text-[10px] leading-none font-semibold text-black">무료배송</span>
    </div>
  );
}

function ProductCardItem({ product }: { product: ProductCard }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/products/${product.id}`)}
      className="flex w-25 shrink-0 flex-col gap-1 text-left"
    >
      <div className="h-25 w-25 bg-gray-200" />
      {product.originalPrice && (
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-gray-200" />
          <span className="text-body-9 font-semibold text-red-300">
            {product.price.toLocaleString()}원
          </span>
        </div>
      )}
      {!product.originalPrice && (
        <span className="text-body-9 font-semibold text-black">
          {product.price.toLocaleString()}원
        </span>
      )}
      {product.isRocket ? <RocketBadge /> : <FreeShippingBadge />}
      <StarRow rating={product.rating} reviewCount={product.reviewCount} />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────
function MainPage() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<BannerResponse[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    getBanners()
      .then(setBanners)
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length === 0) return undefined;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (banners.length === 0) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      setCurrentBanner((prev) =>
        diff > 0 ? (prev + 1) % banners.length : (prev - 1 + banners.length) % banners.length,
      );
    }
  };

  const productPairs = chunkPairs(DUMMY_PRODUCTS);

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* 검색 바 — 2px black border, 24px radius */}
      <div className="px-3 py-1.5">
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="flex w-full items-center justify-between rounded-3xl border-2 border-black px-4 py-2"
        >
          <div className="flex items-center gap-2">
            <Search size={16} className="shrink-0 text-gray-300" />
            <span className="text-body-9 text-gray-300">앱팡에서 검색하세요!</span>
          </div>
          <Camera size={24} className="shrink-0 text-gray-300" />
        </button>
      </div>

      {/* 배너 슬라이더 — 176px, Secondary-100 bg */}
      <div
        className="bg-secondary-100 relative h-44 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="배너 슬라이더"
      >
        {banners.length > 0 ? (
          <button
            type="button"
            aria-label={`배너 ${currentBanner + 1} 이동`}
            onClick={() => navigate(banners[currentBanner].linkUrl)}
            className="flex h-full w-full items-center justify-center"
          >
            <img
              src={banners[currentBanner].imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ) : (
          <div className="flex h-full items-center justify-center" />
        )}

        {/* 도트 인디케이터 — 8×8px, active=Gray-100+Gray-200 border, inactive=transparent+Gray-200 border */}
        <div className="absolute right-0 bottom-3 left-0 flex justify-center gap-1">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`배너 ${index + 1} 보기`}
              onClick={() => setCurrentBanner(index)}
              className={`h-2 w-2 rounded-full border border-gray-200 transition-colors ${
                index === currentBanner ? 'bg-gray-100' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 카테고리 — 5열×2행, 36px 아이콘, h-[60px] 셀 */}
      <div className="grid grid-cols-5 grid-rows-2 px-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => navigate(cat.path)}
            className="flex h-15 flex-col items-center justify-center gap-0.5 text-black"
          >
            {cat.icon}
            <span className="text-body-11 text-center leading-tight break-keep">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 최근 찾던 상품의 연관 상품 */}
      <div className="flex flex-col gap-3 px-3 pt-1">
        <h2 className="text-body-7 font-bold text-black">최근 찾던 상품의 연관 상품</h2>

        {/* 가로 스크롤: 2개씩 세로 컬럼 쌍 */}
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
          {productPairs.map((pair) => (
            <div
              key={pair.map((product) => product.id).join('-')}
              className="flex shrink-0 flex-col gap-2.5"
            >
              {pair.map((product) => (
                <ProductCardItem key={product.id} product={product} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainPage;
