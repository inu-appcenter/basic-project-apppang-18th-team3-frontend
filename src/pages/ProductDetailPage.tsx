import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Pencil,
  Play,
  Share2,
  Star,
  ThumbsUp,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { addToCart } from '@/api/cart';
import { getProduct, getReviews } from '@/api/product';
import { addWishlist, removeWishlist } from '@/api/wishlist';
import { useAuthStore } from '@/store/authStore';
import type { ProductDetailResponse, ReviewItemResponse } from '@/types/product';

// ─── Types ────────────────────────────────────────────────
type Review = {
  id: number;
  rating: number;
  reviewer: string;
  isVerified: boolean;
  seller: string;
  date: string;
  text: string;
  helpfulCount?: number;
};

// 실제 리뷰 응답엔 isVerified/seller/helpfulCount 필드가 없어 기본값으로 채운다.
function toReview(item: ReviewItemResponse): Review {
  return {
    id: item.reviewId,
    rating: item.rating,
    reviewer: item.userName,
    isVerified: false,
    seller: '',
    date: item.createdAt.slice(0, 10).replace(/-/g, '.'),
    text: item.content,
  };
}

// ─── Constants ────────────────────────────────────────────
// 백엔드 ProductDetailResponse엔 색상/수량 옵션 구조가 없고 optionInfo 문자열 하나뿐이라
// 아래 두 옵션 목록은 UI 데모용으로 유지한다 (실제 옵션 변경 API 없음).
const COLOR_OPTIONS = ['화이트 + 그레이', '화이트', '그레이'];

const QUANTITY_OPTIONS = [
  { qty: '20개', discount: '9,810원 할인', savings: null },
  { qty: '40개', discount: '9,810원 할인', savings: '40개 사면 840원 절약' },
  { qty: '60개', discount: '9,810원 할인', savings: '60개 사면 1,840원 절약' },
];

// ─── Sub-components ───────────────────────────────────────
function StarGroup({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.floor(rating)
              ? 'fill-yellow-300 text-yellow-300'
              : 'fill-gray-200 text-gray-200'
          }
        />
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-gray-200 px-3 py-3">
      {/* 헤더: 별점 + 이름 + 날짜 */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <StarGroup rating={review.rating} size={16} />
            <span className="text-body-10 text-black">{review.reviewer}</span>
            {review.isVerified && (
              <span className="text-body-12 rounded bg-[#00cc89] px-1.5 py-0.5 text-white">
                실명리뷰어
              </span>
            )}
          </div>
          <p className="text-body-10 text-gray-300">판매자 : {review.seller}</p>
        </div>
        <span className="text-body-10 text-gray-300">{review.date}</span>
      </div>

      {/* 리뷰 내용: 사진 + 텍스트 */}
      <div className="flex gap-2">
        <div className="h-20 w-20 shrink-0 bg-gray-200" />
        <p className="text-body-10 line-clamp-4 flex-1 text-black">{review.text}</p>
      </div>

      {/* 더보기 */}
      <button type="button" className="text-body-9 text-primary-200 w-fit font-semibold">
        더보기
      </button>

      {/* 도움이 돼요 버튼 */}
      <button
        type="button"
        className="text-body-9 text-primary-200 flex w-fit items-center gap-1 rounded border border-gray-200 px-2 py-1.5 font-semibold"
      >
        <ThumbsUp size={12} />
        {review.helpfulCount ? `${review.helpfulCount}명에게 도움이 됐어요` : '도움이 돼요'}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedQty, setSelectedQty] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    setIsLoading(true);
    setError(false);
    Promise.all([getProduct(productId), getReviews(productId)])
      .then(([productRes, reviewsRes]) => {
        setProduct(productRes);
        setIsLiked(productRes.isWished);
        setReviews(reviewsRes.items.map(toReview));
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleToggleWish = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!product) return;
    const next = !isLiked;
    setIsLiked(next);
    (next ? addWishlist(product.productId) : removeWishlist(product.productId)).catch(() =>
      setIsLiked(!next),
    );
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!product) return;
    addToCart({ productId: product.productId, quantity: 1 })
      .then(() => setCartMessage('장바구니에 담았습니다'))
      .catch(() => setCartMessage('장바구니 담기에 실패했습니다'))
      .finally(() => setTimeout(() => setCartMessage(null), 2000));
  };

  const canWriteReview = isLoggedIn && (product?.canWriteReview ?? false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-300" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-body-7 text-black">상품 정보를 불러오지 못했습니다.</p>
        <button type="button" onClick={() => navigate(-1)} className="text-body-9 text-primary-200">
          이전으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center">
      <div className="relative flex h-screen w-full max-w-120 flex-col bg-white">
        {/* 헤더: pt=20 pb=20 */}
        <header className="relative flex shrink-0 items-center justify-center bg-white px-3 py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="absolute left-3 flex h-8 w-8 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>
          <h1 className="text-title-5 font-bold text-black">상품 상세</h1>
        </header>

        {/* 스크롤 영역 */}
        <main className="scrollbar-hide flex-1 overflow-y-auto">
          {/* 이미지 슬라이더: 390×390 */}
          <div className="bg-secondary-100 relative h-97.5 w-full overflow-hidden">
            {product.images.length > 0 ? (
              <img
                src={product.images[currentSlide]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center" />
            )}
            {/* 좋아요 버튼 */}
            <button
              type="button"
              aria-label={isLiked ? '좋아요 취소' : '좋아요'}
              onClick={handleToggleWish}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <Heart
                size={18}
                className={isLiked ? 'fill-red-300 text-red-300' : 'text-gray-300'}
              />
            </button>
            {/* 도트 인디케이터 */}
            <div className="absolute right-0 bottom-3 left-0 flex justify-center gap-1">
              {product.images.map((imageUrl, i) => (
                <button
                  key={imageUrl}
                  type="button"
                  aria-label={`이미지 ${i + 1} 보기`}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === currentSlide ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 공유 아이콘 */}
          <div className="flex items-center px-3 py-1.5">
            <button type="button" aria-label="공유하기">
              <Share2 size={24} className="text-black" />
            </button>
          </div>

          {/* 브랜드 */}
          <div className="flex items-center gap-2.5 px-3 py-1">
            <div className="h-8 w-8 shrink-0 rounded bg-gray-200" />
            <div className="flex flex-col gap-0.5">
              <button type="button" className="flex items-center gap-0.5">
                <span className="text-body-7 font-bold text-black">{product.brand}</span>
                <ChevronRight size={12} className="text-black" />
              </button>
              <p className="text-body-10 text-gray-300">브랜드 상품 모아보기</p>
            </div>
          </div>

          {/* 상품명: 16px regular */}
          <p className="text-body-6 px-3 py-1.5 text-black">{product.name}</p>

          {/* 가격: 할인뱃지 + 가격 + 원가 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5">
            {product.discountRate > 0 && (
              <span className="text-body-7 shrink-0 bg-red-300 px-3 font-bold text-white">
                {product.discountRate}%
              </span>
            )}
            <span className="text-body-5 font-bold text-red-300">
              {product.price.toLocaleString()}원 ({product.unitPrice})
            </span>
            {product.originalPrice > product.price && (
              <span className="text-body-10 text-gray-300">
                {product.originalPrice.toLocaleString()}원
              </span>
            )}
          </div>

          {/* 구분선 */}
          <div className="h-2 bg-gray-100" />

          {/* 옵션 섹션 */}
          <div className="flex flex-col gap-2.5 px-3 py-2.5">
            {/* 옵션 타이틀 */}
            <div className="flex items-center gap-1">
              <span className="text-body-10 text-black">색상</span>
              <X size={12} className="text-gray-300" />
              <span className="text-body-10 text-black">수량</span>
            </div>

            {/* 색상 선택 (가로 스크롤) */}
            <div className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-1">
              {COLOR_OPTIONS.map((color, idx) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(idx)}
                  className={`flex w-18 shrink-0 flex-col overflow-hidden rounded border transition-colors ${
                    selectedColor === idx ? 'border-primary-200' : 'border-gray-200'
                  }`}
                >
                  <div className="bg-primary-100 flex h-16.25 w-full items-center justify-center">
                    <span className="text-body-10 text-black">이미지</span>
                  </div>
                  <div className="flex items-center justify-center px-2 py-1">
                    <span
                      className={`text-body-10 text-center leading-tight ${
                        selectedColor === idx ? 'font-semibold' : ''
                      }`}
                    >
                      {color}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* 수량 옵션 (라디오 리스트) */}
            <div className="flex flex-col divide-y divide-gray-200 border-t border-b border-gray-200">
              {QUANTITY_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.qty}
                  type="button"
                  onClick={() => setSelectedQty(idx)}
                  className="flex items-start gap-6 py-2 text-left"
                >
                  {/* 라디오 + 수량 */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        selectedQty === idx
                          ? 'border-primary-200 bg-primary-200'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          selectedQty === idx ? 'bg-white' : 'bg-gray-200'
                        }`}
                      />
                    </span>
                    <span className="text-body-10 text-black">{opt.qty}</span>
                  </div>

                  {/* 할인 정보 */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-body-10 text-black">{opt.discount}</span>
                      <span className="text-body-7 text-secondary-200 font-bold">로켓</span>
                    </div>
                    {opt.savings && <p className="text-body-10 text-green-300">{opt.savings}</p>}
                  </div>
                </button>
              ))}
            </div>

            {/* 모든 옵션 보기 */}
            <button
              type="button"
              className="text-body-9 text-primary-200 flex w-full items-center justify-center gap-1 py-3 font-semibold"
            >
              모든 옵션 보기
              <ChevronRight size={12} />
            </button>
          </div>

          {/* 상품정보 */}
          <div className="flex items-center px-3 py-2">
            <h2 className="text-body-5 font-bold text-black">상품정보</h2>
          </div>
          <div className="h-2 bg-gray-100" />
          <p className="text-body-10 px-3 py-2 whitespace-pre-wrap text-black">
            {product.description}
          </p>
          {product.detailImages.map((imageUrl) => (
            <img key={imageUrl} src={imageUrl} alt="" loading="lazy" className="w-full" />
          ))}

          {/* 구분선 */}
          <div className="h-2 bg-gray-100" />

          {/* 상품 리뷰 헤더 */}
          <div className="flex items-center justify-between px-3 py-3">
            <h2 className="text-body-5 font-bold text-black">상품 리뷰</h2>
            <button
              type="button"
              className="text-body-9 text-primary-200 flex items-center gap-0.5 font-semibold"
            >
              전체보기
              <ChevronRight size={12} />
            </button>
          </div>

          {/* 리뷰 요약 */}
          <div className="flex flex-col gap-2.5 px-3 pb-2.5">
            <p className="text-body-10 text-gray-300">
              동일한 상품에 대해 작성된 상품평으로, 판매자는 다를 수 있습니다.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <StarGroup rating={product.reviewSummary.averageRating} size={16} />
                <span className="text-body-7 font-bold text-black">
                  {product.reviewSummary.reviewCount.toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                disabled={isLoggedIn && !canWriteReview}
                onClick={() => {
                  if (!isLoggedIn) navigate('/login');
                }}
                className="text-body-9 text-primary-200 flex items-center gap-1 font-semibold disabled:text-gray-200"
              >
                <Pencil size={12} />
                리뷰 작성하기
              </button>
            </div>
          </div>

          {/* 사진/동영상 */}
          <div className="flex items-center px-3 py-2">
            <h2 className="text-body-5 font-bold text-black">사진/동영상</h2>
          </div>

          {/* 포토 그리드: 4열 */}
          <div className="grid grid-cols-4 gap-1 px-3">
            {/* 동영상 썸네일 */}
            <div className="relative aspect-square bg-gray-200">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <Play size={24} className="fill-white text-white" />
                <span className="text-body-10 text-white">0:14</span>
              </div>
            </div>
            {/* 사진 6개 */}
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="aspect-square bg-gray-200" />
            ))}
            {/* 더보기 타일 */}
            <div className="bg-primary-200 flex aspect-square flex-col items-center justify-center">
              <span className="text-title-5 font-bold text-white">270</span>
              <span className="text-body-7 font-bold text-white">더보기</span>
            </div>
          </div>

          {/* 리뷰 아이템 */}
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}

          {/* 리뷰 전체보기 버튼 */}
          <div className="px-3 py-2">
            <button
              type="button"
              className="text-body-5 text-primary-200 w-full rounded border border-gray-200 py-3 font-bold"
            >
              리뷰 전체보기
            </button>
          </div>

          {/* 하단 여백 (액션바 높이만큼) */}
          <div className="h-16.75" />
        </main>

        {/* 장바구니 담기 결과 토스트 */}
        {cartMessage && (
          <div className="absolute top-18 left-1/2 z-30 w-max -translate-x-1/2 rounded-lg bg-white px-4 py-3 shadow-[4px_4px_12px_0px_rgba(0,0,0,0.2)]">
            <p className="text-body-9 whitespace-nowrap text-black">{cartMessage}</p>
          </div>
        )}

        {/* 하단 액션 바: h=67, px=12, py=12 */}
        <div className="flex shrink-0 items-center gap-2 border-t border-gray-200 px-3 py-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="text-body-5 border-primary-200 text-primary-200 flex-1 rounded border py-3 font-bold"
          >
            장바구니 담기
          </button>
          <button
            type="button"
            className="text-body-5 bg-primary-200 flex-1 rounded py-3 font-bold text-white"
          >
            바로구매
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
