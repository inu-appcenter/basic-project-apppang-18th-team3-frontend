export interface ChatHistoryItem {
  sessionId: string;
  role: string;
  message: string;
  createdAt: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}
