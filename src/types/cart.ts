export interface CartItemResponse {
  cartItemId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
}

export interface CartResponse {
  itemCount: number;
  totalPrice: number;
  items: CartItemResponse[];
}

export interface CartAddRequest {
  productId: number;
  quantity: number;
}

export interface CartUpdateRequest {
  quantity: number;
}
