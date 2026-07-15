export interface WishlistResponse {
  wishlistId: number;
  productId: number;
  productName: string;
  brand: string;
  price: number;
  rocketDelivery: boolean;
}

export interface WishlistRequest {
  productId: number;
}
