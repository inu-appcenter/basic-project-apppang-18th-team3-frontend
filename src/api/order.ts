import instance from '@/api/instance';
import type {
  OrderCancelResponse,
  OrderCreateRequest,
  OrderCreateResponse,
  OrderDetailResponse,
  OrderEstimateRequest,
  OrderEstimateResponse,
} from '@/types/order';

// GET + 인덱스 쿼리파라미터 방식 (items[0].productId=5&items[0].quantity=2&...)
// PR #82: 순수 조회라 POST+JSON 바디에서 GET+쿼리파라미터로 변경됨
export const estimateOrder = async (payload: OrderEstimateRequest) => {
  const params = new URLSearchParams();
  payload.items.forEach((item, index) => {
    params.append(`items[${index}].productId`, String(item.productId));
    params.append(`items[${index}].quantity`, String(item.quantity));
  });
  const { data } = await instance.get<OrderEstimateResponse>('/api/orders/estimate', { params });
  return data;
};

export const createOrder = async (payload: OrderCreateRequest) => {
  const { data } = await instance.post<OrderCreateResponse>('/api/orders', payload);
  return data;
};

export const getOrderDetail = async (orderId: number) => {
  const { data } = await instance.get<OrderDetailResponse>(`/api/orders/${orderId}`);
  return data;
};

export const cancelOrder = async (orderId: number) => {
  const { data } = await instance.post<OrderCancelResponse>(`/api/orders/${orderId}/cancel`);
  return data;
};
