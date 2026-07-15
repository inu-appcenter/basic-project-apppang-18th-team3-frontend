import instance from '@/api/instance';
import type { OrderSummaryResponse, UserMeResponse } from '@/types/mypage';

export const getMe = async () => {
  const { data } = await instance.get<UserMeResponse>('/api/users/me');
  return data;
};

export const getOrders = async () => {
  const { data } = await instance.get<OrderSummaryResponse[]>('/api/orders');
  return data;
};
