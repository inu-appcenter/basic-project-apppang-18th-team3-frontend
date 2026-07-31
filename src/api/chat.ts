import instance from '@/api/instance';
import type { ChatHistoryResponse, ChatRequest, ChatResponse } from '@/types/chat';

export const getChatHistory = async (params?: { cursor?: number; size?: number }) => {
  const { data } = await instance.get<ChatHistoryResponse>('/api/chat/history', { params });
  return data;
};

export const sendChatMessage = async (payload: ChatRequest) => {
  const { data } = await instance.post<ChatResponse>('/api/chat', payload);
  return data;
};
