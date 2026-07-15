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
