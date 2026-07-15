import instance from '@/api/instance';
import type { ChatHistoryItem, ChatRequest, ChatResponse } from '@/types/chat';

export const getChatHistory = async () => {
  const { data } = await instance.get<ChatHistoryItem[]>('/api/chat/history');
  return data;
};

export const sendChatMessage = async (payload: ChatRequest) => {
  const { data } = await instance.post<ChatResponse>('/api/chat', payload);
  return data;
};
