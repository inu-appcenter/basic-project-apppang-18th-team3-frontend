import { ChevronDown, ChevronLeft, Star } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────
type SortOption = { label: string; value: string };

type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  unitPrice?: string;
  isFreeShipping: boolean;
  isFreeReturn: boolean;
  isRocket: boolean;
  deliveryDate?: string;
  condition?: string;
  rating: number;
  reviewCount: number;
};

// ─── Constants ────────────────────────────────────────────
const SORT_OPTIONS: SortOption[] = [
  { label: '쿠팡 랭킹순', value: 'rank' },
  { label: '최신순', value: 'latest' },
  { label: '최저가순', value: 'price_asc' },
  { label: '최고가순', value: 'price_desc' },
];

const PRODUCT_POOL: Omit<Product, 'id'>[] = [
  {
    name: '프링글스 사워크림 앤 어니언, 110g, 2개',
    price: 3300,
    originalPrice: 6660,
    discountRate: 50,
    unitPrice: '10g당 151원',
    isFreeShipping: true,
    isFreeReturn: true,
    isRocket: false,
    rating: 4.8,
    reviewCount: 31387,
  },
  {
    name: '찰떡파이 명가 두바이st 피스타치오맛 쫀득, 300g 1개',
    price: 3300,
    unitPrice: '10g당 151원',
    isFreeShipping: true,
    isFreeReturn: true,
    isRocket: false,
    rating: 4.8,
    reviewCount: 31387,
  },
  {
    name: '김치사발면 86g, 6개',
    price: 3300,
    unitPrice: '10g당 151원',
    isFreeShipping: true,
    isFreeReturn: true,
    isRocket: false,
    condition: '새 상품, 반품-미개봉 82',
    rating: 4.8,
    reviewCount: 31387,
  },
  {
    name: '농심 짜파게티 140g, 10개',
    price: 3300,
    discountRate: 50,
    unitPrice: '10g당 151원',
    isFreeShipping: true,
    isFreeReturn: true,
    isRocket: true,
    deliveryDate: '내일(목) 새벽 도착',
    rating: 4.8,
    reviewCount: 31387,
  },
];

const PAGE_SIZE = 10;
const MAX_ITEMS = 30;

function generateProducts(startId: number, count: number): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    ...PRODUCT_POOL[(startId + i) % PRODUCT_POOL.length],
  }));
}

// ─── Sub-components ───────────────────────────────────────
function StarRow({
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
          size={12}
          className={
            i < Math.floor(rating)
              ? 'fill-yellow-300 text-yellow-300'
              : 'fill-gray-200 text-gray-200'
          }
        />
      ))}
      <span className="text-body-10 ml-0.5 text-gray-300">({reviewCount.toLocaleString()})</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const hasDiscount = !!product.discountRate;

  return (
    <button
      type="button"
      onClick={() => navigate(`/products/${product.id}`)}
      className="flex w-full gap-2.5 border-b border-gray-200 px-3 py-4 text-left"
    >
      {/* 이미지: 120×120 */}
      <div className="h-30 w-30 shrink-0 bg-gray-200" />

      {/* 상품 정보 */}
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        {/* 상품명: 12px regular */}
        <p className="text-body-10 line-clamp-2 text-black">{product.name}</p>

        {/* 가격 그룹 */}
        <div className="flex flex-col gap-1">
          {/* 쿠폰 할인 원가 */}
          {product.originalPrice && (
            <div className="text-body-10 flex items-center gap-1">
              <span className="text-red-300">쿠폰할인</span>
              <s className="text-gray-300">{product.originalPrice.toLocaleString()}원</s>
            </div>
          )}

          {/* 할인뱃지 + 가격 */}
          <div className="flex items-center gap-1">
            {hasDiscount && (
              <span className="text-body-7 shrink-0 bg-red-300 px-3 font-bold text-white">
                {product.discountRate}%
              </span>
            )}
            <span
              className={`text-body-5 font-bold ${hasDiscount ? 'text-red-300' : 'text-black'}`}
            >
              {product.price.toLocaleString()}원
            </span>
            {product.unitPrice && (
              <span className={`text-body-10 ${hasDiscount ? 'text-red-300' : 'text-gray-300'}`}>
                ({product.unitPrice})
              </span>
            )}
          </div>
        </div>

        {/* 로켓 배송 */}
        {product.isRocket && product.deliveryDate && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-body-7 text-secondary-200 font-bold">로켓</span>
            <span className="text-body-11 rounded bg-green-300 px-1 py-0.5 text-white">내일</span>
            <span className="text-body-10 text-green-300">{product.deliveryDate}</span>
          </div>
        )}

        {/* 무료배송 · 무료반품 */}
        <p className="text-body-10 text-gray-300">
          {[product.isFreeShipping && '무료배송', product.isFreeReturn && '무료반품']
            .filter(Boolean)
            .join(' · ')}
        </p>

        {/* 상태 */}
        {product.condition && <p className="text-body-10 text-black">{product.condition}</p>}

        {/* 별점 */}
        <StarRow rating={product.rating} reviewCount={product.reviewCount} productId={product.id} />
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────
function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const title = searchParams.get('category') ?? searchParams.get('keyword') ?? '상품';

  const [products, setProducts] = useState<Product[]>(() => generateProducts(0, PAGE_SIZE));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortIndex, setSortIndex] = useState(0);
  const [sortOpen, setSortOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setProducts((prev) => {
        const next = [...prev, ...generateProducts(prev.length, PAGE_SIZE)];
        if (next.length >= MAX_ITEMS) setHasMore(false);
        return next;
      });
      setIsLoading(false);
    }, 800);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    if (!sortOpen) return undefined;
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sortOpen]);

  return (
    <div className="flex flex-col">
      {/* 헤더: pt=20 pb=20 px=12 */}
      <header className="relative flex shrink-0 items-center justify-center px-3 py-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="absolute left-3 flex h-8 w-8 items-center justify-center p-1"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <h1 className="text-title-5 font-bold text-black">{title}</h1>
      </header>

      {/* 정렬 바: pt=12 pb=12 px=12, 좌측 정렬 */}
      <div className="relative border-b border-gray-200 px-3 py-3" ref={sortRef}>
        <button
          type="button"
          onClick={() => setSortOpen((prev) => !prev)}
          className="text-body-10 flex items-center gap-1 text-black"
        >
          {SORT_OPTIONS[sortIndex].label}
          <ChevronDown
            size={12}
            className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {sortOpen && (
          <div className="absolute top-full left-3 z-20 mt-1 w-32 overflow-hidden rounded border border-gray-200 bg-white shadow-md">
            {SORT_OPTIONS.map((opt, idx) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSortIndex(idx);
                  setSortOpen(false);
                }}
                className={`text-body-10 hover:bg-primary-100 w-full px-4 py-2.5 text-left transition-colors ${
                  idx === sortIndex ? 'text-primary-200 font-semibold' : 'text-black'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 상품 목록 */}
      <div>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 무한스크롤 센티넬 */}
      <div ref={sentinelRef} className="flex items-center justify-center py-6">
        {isLoading && (
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-300" />
        )}
        {!hasMore && <p className="text-body-10 text-gray-300">마지막 상품입니다</p>}
      </div>
    </div>
  );
}

export default ProductListPage;
