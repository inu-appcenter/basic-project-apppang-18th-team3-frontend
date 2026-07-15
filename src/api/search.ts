import instance from '@/api/instance';
import type {
  SearchHistoryListResponse,
  SearchHistoryRequest,
  SearchSuggestionResponse,
} from '@/types/search';

export const getSuggestions = async (keyword: string) => {
  const { data } = await instance.get<SearchSuggestionResponse>('/api/search/suggestions', {
    params: { keyword },
  });
  return data;
};

export const getSearchHistory = async () => {
  const { data } = await instance.get<SearchHistoryListResponse>('/api/search/history');
  return data;
};

export const saveSearchHistory = async (keyword: string) => {
  await instance.post<void>('/api/search/history', { keyword } satisfies SearchHistoryRequest);
};

export const deleteSearchHistory = async (keyword: string) => {
  await instance.delete<void>('/api/search/history', { params: { keyword } });
};
