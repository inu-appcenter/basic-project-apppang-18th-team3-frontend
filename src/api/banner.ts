import instance from '@/api/instance';
import type { BannerResponse } from '@/types/banner';

export const getBanners = async () => {
  const { data } = await instance.get<BannerResponse[]>('/api/banners');
  return data;
};
