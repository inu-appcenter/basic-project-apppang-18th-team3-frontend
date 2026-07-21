export interface UserMeResponse {
  userId: number;
  email: string;
  name: string;
  phoneNumber: string;
  appMoney: number;
  createdAt: string;
}

export interface OrderItemInfo {
  orderItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  status: string;
}

export interface OrderSummaryResponse {
  orderId: number;
  orderDate: string;
  status: string;
  totalPrice: number;
  items: OrderItemInfo[];
}

export interface UpdateMeRequest {
  email?: string;
  name?: string;
  phoneNumber?: string;
}

export interface UpdateMeResponse {
  userId: number;
  email: string;
  name: string;
  phoneNumber: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

export interface RecentProductItem {
  productId: number;
  name: string;
  imageUrl: string;
  price: number;
}

export interface RecentProductsResponse {
  items: RecentProductItem[];
}
