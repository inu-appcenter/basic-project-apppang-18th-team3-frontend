import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAddresses } from '@/api/address';
import { createOrder, estimateOrder } from '@/api/order';
import { useCheckoutStore } from '@/store/checkoutStore';
import type { AddressResponse } from '@/types/address';
import type { OrderEstimateResponse } from '@/types/order';

const PAYMENT_METHOD = '앱팡 머니';

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, addressId, setItems, setAddressId } = useCheckoutStore();

  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [estimate, setEstimate] = useState<OrderEstimateResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate(-1);
      return;
    }
    getAddresses()
      .then((list) => {
        setAddresses(list);
        if (!addressId) {
          const defaultAddress = list.find((a) => a.isDefault) ?? list[0];
          if (defaultAddress) setAddressId(defaultAddress.addressId);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    estimateOrder({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) })
      .then(setEstimate)
      .catch(() => setEstimate(null));
  }, [items]);

  const selectedAddress = addresses.find((a) => a.addressId === addressId) ?? null;

  const changeQuantity = (productId: number, delta: number) => {
    setItems(
      items
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handlePay = async () => {
    if (!selectedAddress || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const order = await createOrder({
        addressId: selectedAddress.addressId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod: PAYMENT_METHOD,
        deliveryRequest: selectedAddress.normalDeliveryRequest,
      });
      setItems([]);
      navigate(`/mypage/orders/${order.orderId}`, { replace: true });
    } catch {
      setErrorMessage('결제에 실패했습니다');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

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
          <h1 className="text-body-2 font-bold text-black">주문/결제</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-4">
          <div className="flex flex-col gap-4">
            {selectedAddress && (
              <div className="flex flex-col gap-2.5 border border-gray-200 bg-gray-100 px-5 py-3.75">
                <button
                  type="button"
                  onClick={() => navigate('/checkout/address')}
                  className="flex w-full items-start justify-between gap-2"
                >
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-[16px] font-extrabold text-black">
                      배송지 <span className="text-gray-300">|</span>{' '}
                      {selectedAddress.recipientName}
                    </p>
                    {selectedAddress.isDefault && (
                      <span className="text-body-11 rounded-full border border-gray-300 px-1 py-0.75 text-gray-300">
                        기본배송지
                      </span>
                    )}
                    <div className="text-left text-[14px] text-gray-300">
                      <p>
                        {selectedAddress.address} {selectedAddress.detailAddress}
                      </p>
                      <p>{selectedAddress.phone}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="shrink-0 text-black" />
                </button>

                <div className="h-px w-full bg-gray-200" />

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/mypage/addresses/${selectedAddress.addressId}/edit`, {
                      state: { address: selectedAddress },
                    })
                  }
                  className="flex w-full items-center justify-between gap-2"
                >
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-[17px] font-extrabold text-black">배송 요청사항</p>
                    <p className="text-[14px] font-semibold text-gray-300">
                      {selectedAddress.normalDeliveryRequest || '문 앞'}
                    </p>
                  </div>
                  <ChevronRight size={24} className="shrink-0 text-black" />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-1.25">
              <p className="text-[16px] font-extrabold text-black">
                배송 {items.length}건 중 {items.length}
              </p>
              <div className="flex flex-col">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex h-15 items-center gap-2.75 border border-gray-200 bg-white px-5 py-3"
                  >
                    <div className="size-15 shrink-0 bg-gray-200" />
                    <div className="flex flex-1 flex-col items-end gap-1.25">
                      <p className="line-clamp-1 w-full text-right text-[12px] font-medium text-black">
                        {item.productName}
                      </p>
                      <div className="flex h-7.25 items-center justify-between rounded-lg border border-black px-3 py-2">
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.productId, -1)}
                          aria-label="수량 감소"
                        >
                          <Minus size={16} className="text-black" />
                        </button>
                        <span className="px-2 text-[10px] text-black">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.productId, 1)}
                          aria-label="수량 증가"
                        >
                          <Plus size={16} className="text-black" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-col gap-1.5 border border-gray-200 bg-gray-100 px-5 py-3.75">
                <p className="text-[16px] font-extrabold text-black">결제수단</p>
                <p className="text-[14px] font-semibold text-gray-400">{PAYMENT_METHOD}, 일시불</p>
              </div>
              <div className="flex items-center gap-3.75 border border-gray-200 bg-white px-5 py-3.75">
                <span className="border-primary-200 flex size-4 items-center justify-center rounded-full border">
                  <span className="bg-primary-200 size-2 rounded-full" />
                </span>
                <p className="text-[15px] font-extrabold text-black">{PAYMENT_METHOD}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3.75 border border-gray-200 bg-white px-5 py-3.75">
              <p className="text-[16px] font-extrabold text-black">최종 결제 금액</p>
              {estimate && (
                <>
                  <div className="flex items-center justify-between px-0.75 text-[12px] font-medium text-gray-400">
                    <p>총 상품 가격</p>
                    <p>{estimate.productAmount.toLocaleString()}원</p>
                  </div>
                  <div className="flex items-center justify-between px-0.75 text-[12px] font-medium text-gray-400">
                    <p>즉시할인</p>
                    <p>-{estimate.discountAmount.toLocaleString()}원</p>
                  </div>
                  <div className="flex items-center justify-between px-0.75 text-[12px] font-medium text-gray-400">
                    <p>배송비</p>
                    <p>{estimate.shippingFee.toLocaleString()}원</p>
                  </div>
                  <div className="h-px w-full bg-gray-200" />
                  <div className="flex items-center justify-between text-black">
                    <p className="text-[14px] font-extrabold">총 결제 금액</p>
                    <p className="text-[20px] font-extrabold">
                      {estimate.totalPrice.toLocaleString()}
                      <span className="text-[14px]">원</span>
                    </p>
                  </div>
                </>
              )}
            </div>

            {errorMessage && <p className="text-body-9 text-center text-red-300">{errorMessage}</p>}
          </div>
        </div>

        <div className="flex shrink-0 justify-center p-2.5">
          <button
            type="button"
            disabled={!selectedAddress || !estimate || isSubmitting}
            onClick={handlePay}
            className="text-body-5 bg-primary-200 flex h-11.75 w-full items-center justify-center font-extrabold text-white transition-colors disabled:bg-gray-200"
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
