import { ChevronLeft, ChevronUp, Minus, Plus, TriangleAlert, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteCartItem, getCart, updateCartQuantity } from '@/api/cart';
import CheckBox from '@/components/CheckBox';
import ConfirmModal from '@/components/ConfirmModal';
import { useCheckoutStore } from '@/store/checkoutStore';
import type { CartItemResponse } from '@/types/cart';

// ─── Types ────────────────────────────────────────────────
// 실제 CartItemResponse엔 브랜드/옵션/배송정보/할인율 등이 없어(cartItemId,
// productId, productName, price, quantity, subtotal뿐) UI가 요구하던 필드는 뺐다.
type CartItem = {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

function toCartItem(res: CartItemResponse): CartItem {
  return {
    id: res.cartItemId,
    productId: res.productId,
    name: res.productName,
    price: res.price,
    quantity: res.quantity,
    subtotal: res.subtotal,
  };
}

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

function Toast({ text }: { text: string | null }) {
  return (
    <div
      className={`pointer-events-none fixed bottom-28 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded bg-white px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300 ${
        text ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <TriangleAlert size={12} className="shrink-0 text-yellow-300" />
      <span className="text-body-9 font-semibold whitespace-nowrap text-black">
        {text ?? '수량은 하나 이상이여야 합니다'}
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
  checked,
  onCheck,
  onDelete,
  onIncrease,
  onDecrease,
}: {
  item: CartItem;
  checked: boolean;
  onCheck: () => void;
  onDelete: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <div className="flex flex-col border-b border-gray-200">
      {/* 상품 헤더: 체크박스 + 상품명 + 삭제 */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <button type="button" aria-label={checked ? '선택 해제' : '선택'} onClick={onCheck}>
            <CheckBox checked={checked} />
          </button>
          <p className="text-body-10 min-w-0 flex-1 truncate text-black">{item.name}</p>
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
          <span className="text-body-5 font-bold text-black">{item.price.toLocaleString()}원</span>
          <span className="text-body-10 text-gray-300">
            소계 {item.subtotal.toLocaleString()}원
          </span>

          {/* 수량 스테퍼 */}
          <Stepper value={item.quantity} onIncrease={onIncrease} onDecrease={onDecrease} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
function CartPage() {
  const navigate = useNavigate();
  const setCheckoutItems = useCheckoutStore((state) => state.setItems);

  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [priceSheetOpen, setPriceSheetOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | 'checked' | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    getCart()
      .then((res) => {
        const cartItems = res.items.map(toCartItem);
        setItems(cartItems);
        setCheckedIds(new Set(cartItems.map((item) => item.id)));
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2000);
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

  const removeItemLocal = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const restoreItem = (item: CartItem) => {
    setItems((prev) => [...prev, item]);
    setCheckedIds((prev) => new Set(prev).add(item.id));
  };

  const confirmDelete = () => {
    if (pendingDeleteId === 'checked') {
      const idsToDelete = Array.from(checkedIds);
      const deletedItems = items.filter((item) => idsToDelete.includes(item.id));
      idsToDelete.forEach((id) => removeItemLocal(id));
      Promise.allSettled(idsToDelete.map((id) => deleteCartItem(id))).then((results) => {
        const failed = deletedItems.filter((_, index) => results[index].status === 'rejected');
        if (failed.length > 0) {
          failed.forEach(restoreItem);
          showToast('상품 삭제에 실패했습니다');
        }
      });
    } else if (pendingDeleteId !== null) {
      const id = pendingDeleteId;
      const deletedItem = items.find((item) => item.id === id);
      removeItemLocal(id);
      deleteCartItem(id).catch(() => {
        if (deletedItem) restoreItem(deletedItem);
        showToast('상품 삭제에 실패했습니다');
      });
    }
    setPendingDeleteId(null);
  };

  const changeQty = (id: number, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (delta < 0 && item.quantity <= 1) {
      showToast('수량은 하나 이상이여야 합니다');
      return;
    }
    const nextQuantity = item.quantity + delta;
    const prevItems = items;
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: nextQuantity, subtotal: i.price * nextQuantity } : i,
      ),
    );
    updateCartQuantity(id, { quantity: nextQuantity }).catch(() => setItems(prevItems));
  };

  const checkedItems = items.filter((item) => checkedIds.has(item.id));
  const totalProductPrice = checkedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalOriginalPrice = totalProductPrice;
  const totalDiscount = 0;
  const totalCount = checkedItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = 0;
  const totalPrice = totalProductPrice + shippingFee;

  const handleBuyNow = () => {
    setCheckoutItems(
      checkedItems.map((item) => ({
        productId: item.productId,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    );
    navigate('/checkout');
  };

  return (
    <div className="flex min-h-screen justify-center">
      <Toast text={toastMessage} />
      <PriceSheet
        open={priceSheetOpen}
        onClose={() => setPriceSheetOpen(false)}
        totalOriginalPrice={totalOriginalPrice}
        totalDiscount={totalDiscount}
        shippingFee={shippingFee}
        totalPrice={totalPrice}
      />
      <ConfirmModal
        open={pendingDeleteId !== null}
        message="상품을 삭제하시겠습니까?"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
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

        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-300" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <p className="text-body-7 text-black">장바구니를 불러오지 못했습니다.</p>
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <p className="text-body-6 text-black">장바구니가 비어 있어요</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-body-9 border-primary-200 text-primary-200 rounded border px-4 py-2 font-semibold"
            >
              쇼핑 계속하기
            </button>
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <>
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
                  disabled={checkedIds.size === 0}
                  onClick={() => setPendingDeleteId('checked')}
                  className="text-body-9 font-semibold text-gray-300 disabled:opacity-40"
                >
                  선택삭제
                </button>
              </div>

              {/* 장바구니 아이템 목록 */}
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  checked={checkedIds.has(item.id)}
                  onCheck={() => toggleItem(item.id)}
                  onDelete={() => setPendingDeleteId(item.id)}
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

              <button
                type="button"
                disabled={totalCount === 0}
                onClick={handleBuyNow}
                className="text-body-5 bg-primary-200 w-full py-4 font-bold text-white disabled:bg-gray-200"
              >
                총 {totalCount}개 상품 구매하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;
