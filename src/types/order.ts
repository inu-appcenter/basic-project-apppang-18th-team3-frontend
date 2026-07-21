import type { OrderItemInfo } from '@/types/mypage';

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderCreateRequest {
  addressId: number;
  items: OrderItemRequest[];
  paymentMethod: string;
  deliveryRequest: string;
}

export interface OrderCreateResponse {
  orderId: number;
  totalPrice: number;
  status: string;
  remainingMoney: number;
}

export interface OrderEstimateRequest {
  items: OrderItemRequest[];
}

export interface OrderEstimateResponse {
  productAmount: number;
  discountAmount: number;
  shippingFee: number;
  totalPrice: number;
}

export interface OrderDetailResponse {
  orderId: number;
  orderDate: string;
  status: string;
  productAmount: number;
  discountAmount: number;
  shippingFee: number;
  paymentMethod: string;
  totalPrice: number;
  recipientName: string;
  phone: string;
  zipcode: string;
  address: string;
  detailAddress: string;
  deliveryRequest: string;
  items: OrderItemInfo[];
}
