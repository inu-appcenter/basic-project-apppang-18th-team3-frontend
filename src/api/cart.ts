import instance from '@/api/instance';
import type {
  CartAddRequest,
  CartItemResponse,
  CartResponse,
  CartUpdateRequest,
} from '@/types/cart';

export const getCart = async () => {
  const { data } = await instance.get<CartResponse>('/api/cart');
  return data;
};

export const addToCart = async (payload: CartAddRequest) => {
  const { data } = await instance.post<CartItemResponse>('/api/cart', payload);
  return data;
};

export const updateCartQuantity = async (cartItemId: number, payload: CartUpdateRequest) => {
  const { data } = await instance.patch<CartItemResponse>(`/api/cart/${cartItemId}`, payload);
  return data;
};

export const deleteCartItem = async (cartItemId: number) => {
  await instance.delete<void>(`/api/cart/${cartItemId}`);
};
