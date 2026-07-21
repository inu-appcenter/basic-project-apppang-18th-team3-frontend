import instance from '@/api/instance';
import type {
  OrderSummaryResponse,
  UpdateMeRequest,
  UpdateMeResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UserMeResponse,
} from '@/types/mypage';

export const getMe = async () => {
  const { data } = await instance.get<UserMeResponse>('/api/users/me');
  return data;
};

export const getOrders = async () => {
  const { data } = await instance.get<OrderSummaryResponse[]>('/api/orders');
  return data;
};

export const updateMe = async (payload: UpdateMeRequest) => {
  const { data } = await instance.patch<UpdateMeResponse>('/api/users/me', payload);
  return data;
};

export const updatePassword = async (payload: UpdatePasswordRequest) => {
  const { data } = await instance.patch<UpdatePasswordResponse>('/api/users/me/password', payload);
  return data;
};
