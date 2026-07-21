import {
  ChevronRight,
  Heart,
  MapPin,
  PackagePlus,
  ReceiptText,
  Rocket,
  Settings,
  Star,
  User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { logout } from '@/api/auth';
import { getMe, getOrders } from '@/api/mypage';
import { useAuthStore } from '@/store/authStore';
import type { OrderSummaryResponse, UserMeResponse } from '@/types/mypage';

// ─── Types ────────────────────────────────────────────────
type OrderStatus = '배송완료' | '배송중' | '주문접수';

type Order = {
  id: number;
  status: OrderStatus;
  hasRocket: boolean;
};

// 백엔드 주문 status 값이 이 세 한글 라벨과 정확히 일치하는지 확인되지 않아
// 매칭 실패 시 "주문접수"로 폴백한다 (docs/api-integration-issues.md 참고).
function toOrder(res: OrderSummaryResponse): Order {
  const knownStatuses: OrderStatus[] = ['배송완료', '배송중', '주문접수'];
  const status = (knownStatuses as string[]).includes(res.status)
    ? (res.status as OrderStatus)
    : '주문접수';
  return { id: res.orderId, status, hasRocket: false };
}

type RelatedProduct = {
  id: number;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  rating: number;
  reviewCount: number;
  hasRocket: boolean;
};

type QuickMenu = {
  label: string;
  path: string;
  icon: ReactNode;
};

// ─── Constants ────────────────────────────────────────────
const RELATED_PRODUCTS: RelatedProduct[] = [
  { id: 1, price: 58380, rating: 4.8, reviewCount: 31387, hasRocket: true },
  {
    id: 2,
    price: 58380,
    originalPrice: 70000,
    discountRate: 17,
    rating: 4.5,
    reviewCount: 12345,
    hasRocket: true,
  },
  { id: 3, price: 58380, rating: 4.8, reviewCount: 31387, hasRocket: false },
  {
    id: 4,
    price: 58380,
    originalPrice: 70000,
    discountRate: 17,
    rating: 4.5,
    reviewCount: 12345,
    hasRocket: false,
  },
  { id: 5, price: 58380, rating: 4.8, reviewCount: 31387, hasRocket: true },
  {
    id: 6,
    price: 58380,
    originalPrice: 70000,
    discountRate: 17,
    rating: 4.5,
    reviewCount: 12345,
    hasRocket: true,
  },
  { id: 7, price: 58380, rating: 4.8, reviewCount: 31387, hasRocket: false },
  {
    id: 8,
    price: 58380,
    originalPrice: 70000,
    discountRate: 17,
    rating: 4.5,
    reviewCount: 12345,
    hasRocket: false,
  },
];

const QUICK_MENUS: QuickMenu[] = [
  { label: '주문내역', path: '/mypage/orders', icon: <ReceiptText size={24} /> },
  { label: '찜리스트', path: '/mypage/wishlist', icon: <Heart size={24} /> },
  { label: '배송지 관리', path: '/mypage/addresses', icon: <MapPin size={24} /> },
];

const STATUS_COLOR: Record<OrderStatus, string> = {
  배송완료: 'text-black',
  배송중: 'text-primary-200',
  주문접수: 'text-yellow-300',
};

// ─── Utils ────────────────────────────────────────────────
function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
}

// ─── Sub-components ───────────────────────────────────────
function StarRow({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-end gap-0.5">
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={10}
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

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="flex h-[154px] w-[124px] shrink-0 flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2">
      {order.hasRocket && (
        <div className="flex items-center gap-0.5">
          <Rocket size={12} className="text-secondary-300" />
          <span className="text-secondary-300 text-[10px] leading-none font-semibold">로켓</span>
          <span className="text-secondary-300 text-[10px] leading-none font-semibold">내일</span>
        </div>
      )}
      <span className={`text-body-10 ${STATUS_COLOR[order.status]}`}>{order.status}</span>
      <div className="relative mt-auto">
        <div className="h-25 w-25 bg-gray-200" />
        <div className="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
          <PackagePlus size={14} className="text-gray-300" />
        </div>
      </div>
    </div>
  );
}

function RelatedProductCard({ product }: { product: RelatedProduct }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-25 w-25 bg-gray-200" />
      {product.originalPrice && product.discountRate && (
        <div className="flex items-center gap-1">
          <span className="text-body-11 font-semibold text-red-300">{product.discountRate}%</span>
          <span className="text-body-11 text-gray-300 line-through">
            {product.originalPrice.toLocaleString()}원
          </span>
        </div>
      )}
      <span className="text-body-9 font-bold text-black">{product.price.toLocaleString()}원</span>
      {product.hasRocket ? (
        <span className="text-body-11 text-secondary-300 font-semibold">로켓 · 내일도착</span>
      ) : (
        <span className="text-body-11 text-black">무료배송</span>
      )}
      <StarRow rating={product.rating} reviewCount={product.reviewCount} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
function MyPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const authUser = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [me, setMe] = useState<UserMeResponse | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    getMe()
      .then(setMe)
      .catch(() => setMe(null));
    getOrders()
      .then((res) => setOrders(res.slice(0, 5).map(toOrder)))
      .catch(() => setOrders([]));
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout()
      .catch(() => {})
      .finally(() => {
        clearAuth();
        navigate('/');
      });
  };

  const displayName = me?.name ?? authUser?.name ?? '';

  return (
    <div className="flex flex-col bg-gray-100 pb-4">
      {/* 프로필 헤더 — Primary-100 배경 */}
      <div className="bg-primary-100 flex flex-col gap-2.5 px-3 py-3">
        {isLoggedIn ? (
          <>
            {/* 프로필 행 */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-end justify-center overflow-hidden rounded-full bg-gray-200 ring-1 ring-white">
                  <User size={24} className="text-gray-100" />
                </div>
                <span className="text-xl font-bold text-black">{maskName(displayName)}</span>
              </div>
              <button type="button" onClick={() => navigate('/settings')} aria-label="계정 설정">
                <Settings size={24} className="text-black" />
              </button>
            </div>

            {/* 캐시/머니 카드 */}
            <div className="rounded-xl bg-white px-3 py-3">
              <div className="flex justify-between px-[60px]">
                <div>
                  <span className="text-xs text-gray-300">쿠팡 캐시 </span>
                  <span className="text-sm font-bold text-black">0 원</span>
                </div>
                <div>
                  <span className="text-xs text-gray-300">쿠페이 머니 </span>
                  <span className="text-sm font-bold text-black">
                    {(me?.appMoney ?? 0).toLocaleString()} 원
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* 비로그인 상태 */
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-end justify-center overflow-hidden rounded-full bg-gray-200 ring-1 ring-white">
                <User size={24} className="text-gray-100" />
              </div>
              <span className="text-body-7 font-medium text-black">로그인이 필요해요</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="border-primary-200 text-primary-200 text-body-10 rounded border px-3 py-1.5 font-semibold"
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="bg-primary-200 text-body-10 rounded px-3 py-1.5 font-semibold text-white"
              >
                회원가입
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 퀵 메뉴 — White */}
      <div className="flex justify-center gap-8 bg-white px-6 py-3">
        {QUICK_MENUS.map((menu) => (
          <button
            key={menu.path}
            type="button"
            onClick={() => navigate(menu.path)}
            className="flex w-[60px] flex-col items-center gap-2 text-black"
          >
            {menu.icon}
            <span className="text-body-10 text-center leading-tight break-keep">{menu.label}</span>
          </button>
        ))}
      </div>

      {/* 8px 구분 */}
      <div className="h-2 bg-gray-100" />

      {/* 주문 내역 — White 카드 */}
      <div className="flex flex-col gap-4 bg-white px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="text-body-1 text-black">주문 내역</span>
          <button
            type="button"
            onClick={() => navigate('/mypage/orders')}
            className="flex items-center gap-1"
          >
            <span className="text-body-9 text-primary-200 font-semibold">전체 보기</span>
            <ChevronRight size={12} className="text-primary-200" />
          </button>
        </div>
        <div className="scrollbar-hide flex gap-2.5 overflow-x-auto">
          {orders.length === 0 && (
            <p className="text-body-10 text-gray-300">주문 내역이 없습니다</p>
          )}
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>

      {/* 8px 구분 */}
      <div className="h-2 bg-gray-100" />

      {/* 연관 상품 — White 카드 */}
      <div className="flex flex-col gap-4 bg-white px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="text-body-1 text-black">최근 찾던 상품의 연관 상품</span>
          <span className="text-body-10 text-gray-300">광고</span>
        </div>
        <div className="scrollbar-hide flex gap-3 overflow-x-auto">
          {Array.from({ length: 4 }, (_, colIdx) => (
            <div key={colIdx} className="flex shrink-0 flex-col gap-2.5">
              <RelatedProductCard product={RELATED_PRODUCTS[colIdx * 2]} />
              <RelatedProductCard product={RELATED_PRODUCTS[colIdx * 2 + 1]} />
            </div>
          ))}
        </div>
      </div>

      {/* 하단 링크 */}
      <div className="flex items-center justify-center gap-6 py-4">
        <button type="button" className="text-body-10 text-gray-300">
          고객센터
        </button>
        <div className="h-2 w-px bg-gray-300" />
        {isLoggedIn && (
          <button type="button" onClick={handleLogout} className="text-body-10 text-gray-300">
            로그아웃
          </button>
        )}
      </div>
    </div>
  );
}

export default MyPage;
