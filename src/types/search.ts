export interface SearchSuggestionResponse {
  suggestions: string[];
}

export interface SearchHistoryItem {
  keyword: string;
  searchedAt: string;
}

export interface SearchHistoryListResponse {
  items: SearchHistoryItem[];
}

export interface SearchHistoryRequest {
  keyword: string;
}
