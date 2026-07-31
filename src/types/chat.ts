export interface ChatHistoryItem {
  sessionId: string;
  role: string;
  message: string;
  createdAt: string;
}

export interface ChatHistoryResponse {
  messages: ChatHistoryItem[];
  nextCursor: number | null;
  hasNext: boolean;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
}

// 필드명 주의: 상품명이 productName이 아니라 name (장바구니/주문/찜 응답과 다름, 실제 스펙)
export interface ChatRecommendedProduct {
  productId: number;
  name: string;
  brand: string;
  price: number;
  imageUrl: string | null;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  recommendedProducts: ChatRecommendedProduct[];
}
