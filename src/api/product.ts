import instance from '@/api/instance';
import type {
  GetProductsParams,
  GetReviewsParams,
  ProductDetailResponse,
  ProductListResponse,
  ReviewCreateRequest,
  ReviewCreateResponse,
  ReviewListResponse,
} from '@/types/product';

export const getProducts = async (params: GetProductsParams) => {
  const { data } = await instance.get<ProductListResponse>('/api/products', { params });
  return data;
};

export const getProduct = async (productId: string | number) => {
  const { data } = await instance.get<ProductDetailResponse>(`/api/products/${productId}`);
  return data;
};

export const getReviews = async (productId: string | number, params: GetReviewsParams = {}) => {
  const { data } = await instance.get<ReviewListResponse>(`/api/products/${productId}/reviews`, {
    params,
  });
  return data;
};

export const createReview = async (productId: string | number, payload: ReviewCreateRequest) => {
  const { data } = await instance.post<ReviewCreateResponse>(
    `/api/products/${productId}/reviews`,
    payload,
  );
  return data;
};
