import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getOrderDetail } from '@/api/order';
import NavigationBar from '@/components/NavigationBar';
import type { OrderDetailResponse } from '@/types/order';

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center justify-between text-[15px] font-semibold text-gray-300">
      <p>{label}</p>
      <p>{value}</p>
    </div>
  );
}

function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);

  useEffect(() => {
    if (!orderId) return;
    getOrderDetail(Number(orderId))
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [orderId]);

  return (
    <div className="flex min-h-screen justify-center">
      <div className="relative flex h-screen w-full max-w-120 flex-col bg-white">
        <div className="flex shrink-0 items-center justify-center px-3 py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="absolute left-3"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>
          <h1 className="text-body-2 font-bold text-black">주문상세</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {order && (
            <div className="flex flex-col gap-2.5 px-2.5 pb-4">
              <div className="flex items-center justify-between p-1.25 text-[12px]">
                <p className="font-extrabold text-black">
                  {new Date(order.orderDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                  })}{' '}
                  주문
                </p>
                <p className="font-bold text-gray-300">주문번호 {order.orderId}</p>
              </div>

              <div className="flex flex-col gap-5 border border-gray-200 bg-white px-5 py-3.75">
                <p className="text-[15px] font-extrabold text-black">결제 정보</p>
                <div className="flex flex-col gap-2.5">
                  <AmountRow
                    label="상품 가격"
                    value={`${order.productAmount.toLocaleString()} 원`}
                  />
                  <AmountRow
                    label="할인금액"
                    value={`-${order.discountAmount.toLocaleString()} 원`}
                  />
                  <AmountRow label="배송비" value={`${order.shippingFee.toLocaleString()} 원`} />
                </div>
                <div className="h-px w-full bg-gray-200" />
                <div className="flex flex-col gap-2.5">
                  <AmountRow
                    label={`${order.paymentMethod} / 일시불`}
                    value={`${order.totalPrice.toLocaleString()} 원`}
                  />
                  <div className="flex w-full items-center justify-between text-[15px]">
                    <p className="font-extrabold text-black">총 결제금액</p>
                    <p className="font-semibold text-gray-300">
                      {order.totalPrice.toLocaleString()} 원
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3.75 border border-gray-200 bg-white px-5 py-3.75">
                <div className="flex flex-col gap-2.5">
                  <p className="text-[14px] font-extrabold text-black">{order.recipientName}</p>
                  <div className="flex flex-col gap-0.75 text-[12px] font-semibold text-gray-300">
                    <p>
                      {order.address} {order.detailAddress}
                    </p>
                    <p>{order.phone}</p>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-200" />
                <p className="text-[12px] font-semibold text-gray-300">
                  배송요청사항 · {order.deliveryRequest || '-'}
                </p>
              </div>

              <div className="flex flex-col border border-gray-200 bg-white px-5 py-3">
                {order.items.map((item) => (
                  <div key={item.orderItemId} className="flex flex-col gap-1.5 py-2">
                    <span className="text-[12px] font-extrabold text-black">{item.status}</span>
                    <div className="flex items-center gap-2.75">
                      <div className="size-12.5 shrink-0 bg-gray-200" />
                      <div className="flex flex-1 flex-col gap-0.75 text-[12px] text-black">
                        <p className="line-clamp-1 font-medium">{item.productName}</p>
                        <p className="font-medium">
                          {item.price.toLocaleString()}원 · {item.quantity}개
                        </p>
                      </div>
                      {item.status === '배송완료' && (
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${item.productId}`)}
                          className="text-body-10 border-primary-200 text-primary-200 shrink-0 rounded border px-3 py-1.5 font-semibold"
                        >
                          리뷰 쓰기
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <NavigationBar />
      </div>
    </div>
  );
}

export default OrderDetailPage;
