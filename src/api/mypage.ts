import instance from '@/api/instance';
import type {
  OrderListResponse,
  RecentProductsResponse,
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

export const getOrders = async (params?: { page?: number; size?: number }) => {
  const { data } = await instance.get<OrderListResponse>('/api/orders', { params });
  return data.items;
};

export const updateMe = async (payload: UpdateMeRequest) => {
  const { data } = await instance.patch<UpdateMeResponse>('/api/users/me', payload);
  return data;
};

export const updatePassword = async (payload: UpdatePasswordRequest) => {
  const { data } = await instance.patch<UpdatePasswordResponse>('/api/users/me/password', payload);
  return data;
};

export const getRecentProducts = async () => {
  const { data } = await instance.get<RecentProductsResponse>('/api/users/me/recent-products');
  return data.items;
};
