export interface ProductItemResponse {
  productId: number;
  name: string;
  imageUrl: string;
  optionInfo: string;
  price: number;
  originalPrice: number;
  discountRate: number;
  unitPrice: string;
  averageRating: number;
  reviewCount: number;
  shippingInfo: string;
  rocketDelivery: boolean;
}

export interface ProductListResponse {
  categoryId: number | null;
  categoryName: string | null;
  keyword: string | null;
  page: number;
  size: number;
  total: number;
  hasNext: boolean;
  items: ProductItemResponse[];
}

export interface GetProductsParams {
  categoryId?: number;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ReviewSummaryResponse {
  averageRating: number;
  reviewCount: number;
}

export interface ProductDetailResponse {
  productId: number;
  brand: string;
  name: string;
  images: string[];
  optionInfo: string;
  price: number;
  originalPrice: number;
  discountRate: number;
  unitPrice: string;
  shippingInfo: string;
  rocketDelivery: boolean;
  stock: number;
  description: string;
  detailImages: string[];
  categoryId: number;
  isWished: boolean;
  canWriteReview: boolean;
  reviewSummary: ReviewSummaryResponse;
}

export interface ReviewItemResponse {
  reviewId: number;
  userName: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  images: string[];
}

export interface ReviewListResponse {
  productName: string;
  averageRating: number;
  reviewCount: number;
  page: number;
  total: number;
  items: ReviewItemResponse[];
}

export interface GetReviewsParams {
  page?: number;
  size?: number;
}

export interface ReviewCreateRequest {
  rating: number;
  title: string;
  content: string;
  images: string[];
}

export interface ReviewCreateResponse {
  reviewId: number;
  rating: number;
  title: string;
}
