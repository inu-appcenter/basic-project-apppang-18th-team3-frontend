import instance from '@/api/instance';
import type {
  OrderCreateRequest,
  OrderCreateResponse,
  OrderDetailResponse,
  OrderEstimateRequest,
  OrderEstimateResponse,
} from '@/types/order';

export const estimateOrder = async (payload: OrderEstimateRequest) => {
  const { data } = await instance.post<OrderEstimateResponse>('/api/orders/estimate', payload);
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
