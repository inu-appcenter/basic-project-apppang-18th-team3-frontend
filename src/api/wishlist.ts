import instance from '@/api/instance';
import type { WishlistRequest, WishlistResponse } from '@/types/wishlist';

export const getWishlist = async () => {
  const { data } = await instance.get<WishlistResponse[]>('/api/wishlist');
  return data;
};

export const addWishlist = async (productId: number) => {
  const { data } = await instance.post<WishlistResponse>('/api/wishlist', {
    productId,
  } satisfies WishlistRequest);
  return data;
};

export const removeWishlist = async (productId: number) => {
  await instance.delete<void>(`/api/wishlist/${productId}`);
};
