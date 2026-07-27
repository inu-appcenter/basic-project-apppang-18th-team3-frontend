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
  const { categoryId, ...rest } = params;
  const { data } = await instance.get<ProductListResponse>('/api/products', {
    params: { ...rest, category_id: categoryId },
  });
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
  const formData = new FormData();
  formData.append('rating', String(payload.rating));
  formData.append('title', payload.title);
  formData.append('content', payload.content);
  payload.images.forEach((image) => formData.append('images', image));

  // 백엔드가 multipart/form-data로만 리뷰 작성을 받아서, 브라우저가 boundary를
  // 포함한 Content-Type을 직접 설정하도록 axios 인스턴스의 기본 json 헤더를 지운다.
  const { data } = await instance.post<ReviewCreateResponse>(
    `/api/products/${productId}/reviews`,
    formData,
    { headers: { 'Content-Type': undefined } },
  );
  return data;
};
