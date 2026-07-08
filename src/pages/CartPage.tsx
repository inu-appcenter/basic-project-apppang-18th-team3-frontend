import { ChevronLeft, ChevronUp, Clock4, Minus, Plus, TriangleAlert, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CheckBox from '@/components/CheckBox';

// ─── Types ────────────────────────────────────────────────
type CartItem = {
  id: number;
  brand: string;
  name: string;
  option: string;
  monthlyBuyers: string;
  deliveryDate: string;
  countdown: string;
  originalPrice: number;
  price: number;
  discountRate?: number;
  unitPrice?: string;
  hasRocket: boolean;
  tradeInText?: string;
};

// ─── Constants ────────────────────────────────────────────
const CART_ITEMS: CartItem[] = [
  {
    id: 1,
    brand: 'Apple',
    name: 'Apple 2026 아이패드 에어 11(M4 모델)',
    option: '옵션 : 스페이스 그레이, 128GB, Wi-Fi',
    monthlyBuyers: '한달구매 2천+',
    deliveryDate: '내일(목) 도착',
    countdown: '02:32:31',
    originalPrice: 949000,
    price: 917490,
    discountRate: 3,
    hasRocket: true,
    tradeInText: '구매 시 쓰던 기기 보상판매 신청 가능',
  },
  {
    id: 2,
    brand: '허글리',
    name: '허글리 8IN1 딥 클린 초 고농축 캡슐 세탁세제 코튼캔디 향, 100개입 1개',
    option: '옵션 : 스페이스 그레이, 128GB, Wi-Fi',
    monthlyBuyers: '한달구매 2만+',
    deliveryDate: '내일(목) 도착',
    countdown: '02:32:31',
    originalPrice: 6600,
    price: 3300,
    discountRate: 50,
    unitPrice: '10g당 151원',
    hasRocket: true,
  },
];

// ─── Sub-components ───────────────────────────────────────
function PriceSheet({
  open,
  onClose,
  totalOriginalPrice,
  totalDiscount,
  shippingFee,
  totalPrice,
}: {
  open: boolean;
  onClose: () => void;
  totalOriginalPrice: number;
  totalDiscount: number;
  shippingFee: number;
  totalPrice: number;
}) {
  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-center transition-all duration-300 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* 오버레이 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      {/* 바텀 시트 패널: w=390, bg=white */}
      <div
        className={`relative w-full max-w-120 rounded-t-2xl bg-white px-3 py-3 transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 헤더 */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-body-7 font-bold text-black">주문 예상 금액</span>
          <button type="button" aria-label="닫기" onClick={onClose}>
            <X size={20} className="text-gray-300" />
          </button>
        </div>

        {/* 항목 내역: gap=4 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-body-10 text-black">총 상품 가격</span>
            <span className="text-body-7 font-bold text-black">
              {totalOriginalPrice.toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-10 text-black">총 즉시할인</span>
            <span className="text-body-7 font-bold text-black">
              -{totalDiscount.toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-10 text-black">총 쿠폰할인</span>
            <span className="text-body-7 font-bold text-black">-0원</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-10 text-black">총 배송비</span>
            <span className="text-body-7 font-bold text-black">
              + {shippingFee.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 구분선 + 합계 */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 pb-2">
          <span className="text-body-10 text-black">총 결제 예상 금액</span>
          <span className="text-body-10 text-black">{totalPrice.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
}

function Toast({ visible }: { visible: boolean }) {
  return (
    <div
      className={`pointer-events-none fixed bottom-28 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded bg-white px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <TriangleAlert size={12} className="shrink-0 text-yellow-300" />
      <span className="text-body-9 font-semibold whitespace-nowrap text-black">
        수량은 하나 이상이여야 합니다
      </span>
    </div>
  );
}

function Stepper({
  value,
  onIncrease,
  onDecrease,
}: {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <div className="flex h-9 w-30 items-center justify-between rounded-lg border border-black px-3 py-2">
      <button type="button" aria-label="수량 감소" onClick={onDecrease}>
        <Minus size={16} className="text-black" />
      </button>
      <span className="text-body-7 font-bold text-black">{value}</span>
      <button type="button" aria-label="수량 증가" onClick={onIncrease}>
        <Plus size={16} className="text-black" />
      </button>
    </div>
  );
}

function CartItemCard({
  item,
  quantity,
  checked,
  onCheck,
  onDelete,
  onIncrease,
  onDecrease,
}: {
  item: CartItem;
  quantity: number;
  checked: boolean;
  onCheck: () => void;
  onDelete: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  const hasDiscount = !!item.discountRate;
  const isPercentDiscount = item.discountRate && item.discountRate >= 10;

  return (
    <div className="flex flex-col border-b border-gray-200">
      {/* 상품 헤더: 체크박스 + 상품명/옵션 + 삭제 */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <button
            type="button"
            aria-label={checked ? '선택 해제' : '선택'}
            onClick={onCheck}
          >
            <CheckBox checked={checked} />
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-body-10 truncate text-black">{item.name}</p>
            <p className="text-body-10 text-gray-300">{item.option}</p>
          </div>
        </div>
        <button type="button" aria-label="상품 삭제" onClick={onDelete} className="ml-2 shrink-0">
          <X size={20} className="text-gray-300" />
        </button>
      </div>

      {/* 상품 내용: 이미지 + 정보 */}
      <div className="flex gap-3 px-3 py-2.5">
        {/* 이미지: 80×92 */}
        <div className="h-23 w-20 shrink-0 bg-gray-200" />

        {/* 정보 */}
        <div className="flex flex-1 flex-col gap-2">
          {/* 브랜드 */}
          <p className="text-body-10 text-black">{item.brand}</p>

          {/* 월구매 */}
          <p className="text-body-10 text-black">{item.monthlyBuyers}</p>

          {/* 배송 */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-body-10 text-green-300">{item.deliveryDate}</span>
            <Clock4 size={12} className="text-gray-300" />
            <span className="text-body-10 text-black">{item.countdown} 내 주문 시</span>
          </div>

          {/* 가격 */}
          <p className="text-body-10 text-gray-300 line-through">
            {item.originalPrice.toLocaleString()}원
          </p>

          {/* 할인가 */}
          <div className="flex flex-wrap items-end gap-1">
            {hasDiscount && isPercentDiscount && (
              <span className="text-body-7 shrink-0 bg-red-300 px-3 font-bold text-white">
                {item.discountRate}%
              </span>
            )}
            {hasDiscount && !isPercentDiscount && (
              <span className="text-body-10 font-semibold text-black">{item.discountRate}%</span>
            )}
            <span
              className={`text-body-5 font-bold ${hasDiscount && isPercentDiscount ? 'text-red-300' : 'text-black'}`}
            >
              {item.price.toLocaleString()}원
            </span>
            {item.unitPrice && (
              <span className="text-body-10 text-red-300">({item.unitPrice})</span>
            )}
            {item.hasRocket && (
              <span className="text-body-9 text-secondary-300 font-semibold">로켓</span>
            )}
          </div>

          {/* 보상판매 텍스트 */}
          {item.tradeInText && (
            <p className="text-body-10 text-secondary-300">{item.tradeInText}</p>
          )}

          {/* 수량 스테퍼 */}
          <Stepper value={quantity} onIncrease={onIncrease} onDecrease={onDecrease} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
function CartPage() {
  const navigate = useNavigate();

  const [quantities, setQuantities] = useState<Record<number, number>>({ 1: 2, 2: 1 });
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set([1, 2]));
  const [items, setItems] = useState(CART_ITEMS);
  const [toastVisible, setToastVisible] = useState(false);
  const [priceSheetOpen, setPriceSheetOpen] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const allChecked = items.length > 0 && items.every((item) => checkedIds.has(item.id));

  const toggleAll = () => {
    if (allChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(items.map((item) => item.id)));
    }
  };

  const toggleItem = (id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const deleteChecked = () => {
    setItems((prev) => prev.filter((item) => !checkedIds.has(item.id)));
    setCheckedIds(new Set());
  };

  const changeQty = (id: number, delta: number) => {
    const current = quantities[id] ?? 1;
    if (delta < 0 && current <= 1) {
      showToast();
      return;
    }
    setQuantities((prev) => ({ ...prev, [id]: current + delta }));
  };

  const checkedItems = items.filter((item) => checkedIds.has(item.id));
  const totalOriginalPrice = checkedItems.reduce(
    (sum, item) => sum + item.originalPrice * (quantities[item.id] ?? 1),
    0,
  );
  const totalProductPrice = checkedItems.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] ?? 1),
    0,
  );
  const totalDiscount = totalOriginalPrice - totalProductPrice;
  const totalCount = checkedItems.reduce((sum, item) => sum + (quantities[item.id] ?? 1), 0);
  const shippingFee = 0;
  const totalPrice = totalProductPrice + shippingFee;

  return (
    <div className="flex min-h-screen justify-center">
      <Toast visible={toastVisible} />
      <PriceSheet
        open={priceSheetOpen}
        onClose={() => setPriceSheetOpen(false)}
        totalOriginalPrice={totalOriginalPrice}
        totalDiscount={totalDiscount}
        shippingFee={shippingFee}
        totalPrice={totalPrice}
      />
      <div className="flex h-screen w-full max-w-120 flex-col bg-white">
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
          <h1 className="text-title-5 font-bold text-black">장바구니</h1>
        </header>

        {/* 스크롤 영역 */}
        <main className="scrollbar-hide flex-1 overflow-y-auto">
          {/* 전체선택 바 */}
          <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={allChecked ? '전체선택 해제' : '전체선택'}
                onClick={toggleAll}
              >
                <CheckBox checked={allChecked} />
              </button>
              <span className="text-body-5 font-bold text-black">전체선택</span>
            </div>
            <button
              type="button"
              onClick={deleteChecked}
              className="text-body-9 font-semibold text-gray-300"
            >
              선택삭제
            </button>
          </div>

          {/* 장바구니 아이템 목록 */}
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              quantity={quantities[item.id] ?? 1}
              checked={checkedIds.has(item.id)}
              onCheck={() => toggleItem(item.id)}
              onDelete={() => deleteItem(item.id)}
              onIncrease={() => changeQty(item.id, 1)}
              onDecrease={() => changeQty(item.id, -1)}
            />
          ))}

          {/* 결제 금액 */}
          <div className="flex flex-col gap-2.5 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-body-10 text-gray-300">총 상품 가격</span>
              <span className="text-body-10 font-bold text-black">
                {totalProductPrice.toLocaleString()}원
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-10 text-gray-300">총 배송비</span>
              <span className="text-body-10 font-bold text-black">+ 0원</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 py-3">
              <span className="text-body-6 text-black">총 결제 예상 금액</span>
              <span className="text-body-10 font-bold text-red-300">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 하단 여백 (푸터 높이만큼) */}
          <div className="h-24" />
        </main>

        {/* 고정 푸터: 요약 + 구매 버튼 */}
        <div className="shrink-0 border-t border-gray-200">
          {/* 무료배송 요약 */}
          <div className="flex items-center justify-between px-3 py-3">
            <span className="text-body-9 font-semibold text-black">무료배송 혜택 적용됨</span>
            <button
              type="button"
              onClick={() => setPriceSheetOpen(true)}
              className="flex items-center gap-1"
            >
              <span className="text-body-5 font-bold text-black">
                {totalPrice.toLocaleString()}원
              </span>
              <ChevronUp size={16} className="text-black" />
            </button>
          </div>

          {/* 구매 버튼 */}
          <button
            type="button"
            className="text-body-5 bg-primary-200 w-full py-4 font-bold text-white"
          >
            총 {totalCount}개 상품 구매하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
