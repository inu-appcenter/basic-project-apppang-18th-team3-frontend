export interface SearchSuggestionResponse {
  suggestions: string[];
}

export interface SearchHistoryItem {
  productId: number;
  name: string;
  imageUrl: string;
  price: number;
}

export interface SearchHistoryListResponse {
  items: SearchHistoryItem[];
}

export interface SearchHistoryRequest {
  keyword: string;
}
