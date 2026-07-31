export interface WishlistResponse {
  wishlistId: number;
  productId: number;
  productName: string;
  brand: string;
  price: number;
  rocketDelivery: boolean;
  imageUrl: string | null;
}

export interface WishlistRequest {
  productId: number;
}
