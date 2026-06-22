import {
  ChevronRight,
  ClipboardList,
  Heart,
  History,
  LayoutGrid,
  RefreshCcw,
  Settings,
  ShoppingCart,
  User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────
type OrderStatus = '배송완료' | '배송중' | '주문접수';

type Order = {
  id: number;
  productName: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  status: OrderStatus;
  imageBg: string;
};

type QuickMenu = {
  label: string;
  path: string;
  icon: ReactNode;
};

// ─── Constants ────────────────────────────────────────────
const IS_LOGGED_IN = true;
const USER_NAME = '임재현';

const ORDERS: Order[] = [
  {
    id: 1,
    productName: 'Apple 2024 아이패드 에어 11(M2 모델)',
    price: 917490,
    originalPrice: 949000,
    discountRate: 3,
    status: '배송완료',
    imageBg: 'bg-gray-200',
  },
  {
    id: 2,
    productName: '허글리 8IN1 딥 클린 초 고농축 캡슐 세탁세제 코튼캔디 향, 100개입',
    price: 3300,
    originalPrice: 6600,
    discountRate: 50,
    status: '배송중',
    imageBg: 'bg-secondary-100',
  },
  {
    id: 3,
    productName: 'Samsung Galaxy S25 Ultra 512GB',
    price: 1200000,
    status: '주문접수',
    imageBg: 'bg-primary-100',
  },
  {
    id: 4,
    productName: '나이키 에어포스 1 07 화이트',
    price: 119000,
    originalPrice: 139000,
    discountRate: 14,
    status: '배송완료',
    imageBg: 'bg-gray-100',
  },
];

const QUICK_MENUS: QuickMenu[] = [
  { label: '주문내역', path: '/mypage/orders', icon: <ClipboardList size={28} /> },
  { label: '찜리스트', path: '/mypage/wishlist', icon: <Heart size={28} /> },
  { label: '최근본상품', path: '/mypage/recent', icon: <History size={28} /> },
  { label: '자주산상품', path: '/mypage/frequent', icon: <RefreshCcw size={28} /> },
  { label: '전체메뉴', path: '/mypage/menu', icon: <LayoutGrid size={28} /> },
];

const STATUS_COLOR: Record<OrderStatus, string> = {
  배송완료: 'text-black',
  배송중: 'text-primary-200',
  주문접수: 'text-yellow-300',
};

// ─── Utils ────────────────────────────────────────────────
function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

// ─── Sub-components ───────────────────────────────────────
function ProfileAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-100">
      <span className="text-title-5 font-bold text-primary-200">{name.charAt(0)}</span>
    </div>
  );
}

function OrderCard({
  order,
  onAddToCart,
}: {
  order: Order;
  onAddToCart: (id: number) => void;
}) {
  return (
    <div className="flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200">
      <div className={`h-28 w-full ${order.imageBg}`} />

      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <span className={`text-body-9 font-semibold ${STATUS_COLOR[order.status]}`}>
          {order.status}
        </span>

        <p className="text-body-10 line-clamp-2 text-black">{order.productName}</p>

        <div className="flex flex-col gap-0.5">
          {order.originalPrice && order.discountRate && (
            <div className="flex items-center gap-1">
              <span className="text-body-11 font-semibold text-red-300">{order.discountRate}%</span>
              <span className="text-body-11 text-gray-300 line-through">
                {order.originalPrice.toLocaleString()}원
              </span>
            </div>
          )}
          <span className="text-body-9 font-bold text-black">
            {order.price.toLocaleString()}원
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(order.id)}
          className="mt-auto flex w-full items-center justify-center gap-1 rounded border border-gray-200 py-1.5 transition-colors hover:bg-gray-100"
        >
          <ShoppingCart size={12} className="text-gray-300" />
          <span className="text-body-11 text-gray-300">장바구니 담기</span>
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
function MyPage() {
  const navigate = useNavigate();

  const handleAddToCart = (_id: number) => {
    // POST /api/cart
  };

  return (
    <div className="flex flex-col pb-4">
      {/* 프로필 섹션 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5">
        {IS_LOGGED_IN ? (
          <>
            <div className="flex items-center gap-3">
              <ProfileAvatar name={USER_NAME} />
              <div className="flex flex-col gap-1">
                <span className="text-body-5 font-semibold text-black">
                  {maskName(USER_NAME)}님
                </span>
                <span className="text-body-9 text-gray-300">반갑습니다!</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/mypage/settings')}
              aria-label="계정 설정"
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
            >
              <Settings size={20} className="text-gray-300" />
            </button>
          </>
        ) : (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <User size={28} className="text-gray-200" />
              </div>
              <span className="text-body-5 font-semibold text-black">로그인이 필요해요</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-body-9 rounded border border-primary-200 px-3 py-1.5 font-semibold text-primary-200 transition-colors hover:bg-primary-100"
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-body-9 rounded bg-primary-200 px-3 py-1.5 font-semibold text-white transition-opacity hover:opacity-90"
              >
                회원가입
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 퀵 메뉴 */}
      <div className="border-b border-gray-200 px-2 py-4">
        <div className="grid grid-cols-5">
          {QUICK_MENUS.map((menu) => (
            <button
              key={menu.path}
              type="button"
              onClick={() => navigate(menu.path)}
              className="flex flex-col items-center gap-1.5 py-2 text-black transition-colors hover:text-primary-200"
            >
              {menu.icon}
              <span className="text-body-11 break-keep text-center leading-tight">
                {menu.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 주문 내역 섹션 */}
      <div className="pt-5">
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="text-body-5 font-semibold text-black">주문 내역</h2>
          <button
            type="button"
            onClick={() => navigate('/mypage/orders')}
            className="flex items-center gap-0.5"
          >
            <span className="text-body-9 text-gray-300">전체 보기</span>
            <ChevronRight size={14} className="text-gray-300" />
          </button>
        </div>
        <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2">
          {ORDERS.map((order) => (
            <OrderCard key={order.id} order={order} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
