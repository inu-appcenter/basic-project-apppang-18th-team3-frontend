import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { addToCart } from '@/api/cart';
import { getOrders } from '@/api/mypage';
import NavigationBar from '@/components/NavigationBar';
import { useCheckoutStore } from '@/store/checkoutStore';
import type { OrderItemInfo, OrderSummaryResponse } from '@/types/mypage';

type OrderStatus = '배송완료' | '배송중' | '주문접수';

const STATUS_COLOR: Record<OrderStatus, string> = {
  배송완료: 'text-black',
  배송중: 'text-primary-200',
  주문접수: 'text-yellow-300',
};

// 백엔드 status 값이 이 세 한글 라벨과 정확히 일치하는지 확인되지 않아 매칭 실패 시 폴백 (MyPage와 동일 방침)
function toStatus(status: string): OrderStatus {
  const known: OrderStatus[] = ['배송완료', '배송중', '주문접수'];
  return (known as string[]).includes(status) ? (status as OrderStatus) : '주문접수';
}

function formatOrderDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
}

interface Row {
  orderId: number;
  item: OrderItemInfo;
}

function OrderRow({
  row,
  onAddToCart,
  onViewDetail,
  onBuyNow,
}: {
  row: Row;
  onAddToCart: () => void;
  onViewDetail: () => void;
  onBuyNow: () => void;
}) {
  const status = toStatus(row.item.status);
  return (
    <div className="flex flex-col gap-2.5 border-t border-gray-200 bg-white px-2.5 py-3">
      <span className={`text-[15px] font-bold ${STATUS_COLOR[status]}`}>{status}</span>
      <div className="flex items-center gap-2.5 px-2.5">
        <div className="size-20 shrink-0 bg-gray-200" />
        <div className="flex flex-1 flex-col gap-1 text-[15px] text-black">
          <p className="line-clamp-1 font-medium">{row.item.productName}</p>
          <p className="font-medium">
            {row.item.price.toLocaleString()}원 · {row.item.quantity}개
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-2.5">
        <button
          type="button"
          onClick={onViewDetail}
          className="text-body-9 h-8.25 flex-1 rounded-md border border-gray-300 font-bold text-black"
        >
          주문 상세
        </button>
        <button
          type="button"
          onClick={onBuyNow}
          className="text-body-9 text-primary-200 h-8.25 flex-1 rounded-md border border-gray-300 font-bold"
        >
          바로 구매
        </button>
        <button
          type="button"
          onClick={onAddToCart}
          aria-label="장바구니 담기"
          className="flex size-8.25 shrink-0 items-center justify-center rounded-md border border-gray-300"
        >
          <ShoppingCart size={16} className="text-black" />
        </button>
      </div>
    </div>
  );
}

function OrderListPage() {
  const navigate = useNavigate();
  const setCheckoutItems = useCheckoutStore((state) => state.setItems);
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  const handleAddToCart = (productId: number) => {
    addToCart({ productId, quantity: 1 })
      .then(() => setCartMessage('장바구니에 담았습니다'))
      .catch(() => setCartMessage('장바구니 담기에 실패했습니다'))
      .finally(() => setTimeout(() => setCartMessage(null), 2000));
  };

  const handleBuyNow = (item: OrderItemInfo) => {
    setCheckoutItems([
      {
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
      },
    ]);
    navigate('/checkout');
  };

  // 날짜 -> 주문ID -> 아이템 순으로 묶어서, 같은 날짜에 주문이 여러 건이어도
  // 주문 단위로 구분해서 보여준다.
  const groups = new Map<string, Map<number, Row[]>>();
  orders.forEach((order) => {
    const key = formatOrderDate(order.orderDate);
    const dateGroup = groups.get(key) ?? new Map<number, Row[]>();
    const rows = dateGroup.get(order.orderId) ?? [];
    order.items.forEach((item) => rows.push({ orderId: order.orderId, item }));
    dateGroup.set(order.orderId, rows);
    groups.set(key, dateGroup);
  });

  return (
    <div className="flex min-h-screen justify-center">
      <div className="relative flex h-screen w-full max-w-120 flex-col bg-gray-100">
        <div className="flex shrink-0 items-center justify-center bg-white px-3 py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="absolute left-3"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>
          <h1 className="text-body-2 font-bold text-black">주문내역</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {groups.size === 0 && (
            <p className="text-body-9 px-4 py-10 text-center text-gray-300">주문 내역이 없습니다</p>
          )}
          {Array.from(groups.entries()).map(([date, orderGroups]) => (
            <div key={date} className="flex flex-col">
              <p className="bg-white px-3.75 py-2.5 text-[15px] font-bold text-black">{date}</p>
              {Array.from(orderGroups.entries()).map(([orderId, rows], index) => (
                <div key={orderId} className="flex flex-col">
                  {index > 0 && <div className="h-2 bg-gray-100" />}
                  {rows.map((row) => (
                    <OrderRow
                      key={row.item.orderItemId}
                      row={row}
                      onAddToCart={() => handleAddToCart(row.item.productId)}
                      onViewDetail={() => navigate(`/mypage/orders/${row.orderId}`)}
                      onBuyNow={() => handleBuyNow(row.item)}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <NavigationBar />

        {cartMessage && (
          <div className="absolute top-18 left-1/2 z-30 w-max -translate-x-1/2 rounded-lg bg-white px-4 py-3 shadow-[4px_4px_12px_0px_rgba(0,0,0,0.2)]">
            <p className="text-body-9 whitespace-nowrap text-black">{cartMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderListPage;
