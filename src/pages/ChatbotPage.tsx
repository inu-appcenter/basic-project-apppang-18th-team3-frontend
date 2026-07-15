import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, SendHorizontal } from 'lucide-react';

import { getChatHistory, sendChatMessage } from '@/api/chat';
import { useAuthStore } from '@/store/authStore';

type Message = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  time: string;
};

const QUICK_REPLIES = [
  '상품 추천해줘',
  '주문 조회',
  '배송 문의',
  '반품·교환 문의',
  '자주 묻는 질문',
];

const FALLBACK_REPLY =
  '죄송해요, 아직 해당 질문에 대한 답변을 준비 중이에요. 다른 방식으로 질문해 주시겠어요?';

function getTime(date: Date = new Date()) {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? '오후' : '오전';
  const hour = h % 12 || 12;
  const min = String(m).padStart(2, '0');
  return `${ampm} ${hour}:${min}`;
}

function BotBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex gap-2">
      <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100" />
      <div className="flex flex-col items-start gap-1">
        <div className="max-w-[206px] rounded-xl bg-gray-100 p-3">
          <p className="text-body-10 whitespace-pre-wrap text-black">{text}</p>
        </div>
        <span className="text-body-10 text-gray-300">{time}</span>
      </div>
    </div>
  );
}

function UserBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex justify-end gap-2">
      <div className="flex flex-col items-end gap-1">
        <div className="bg-primary-100 max-w-[206px] rounded-xl p-3">
          <p className="text-body-10 whitespace-pre-wrap text-black">{text}</p>
        </div>
        <span className="text-body-10 text-gray-300">{time}</span>
      </div>
      <div className="bg-primary-100 h-8 w-8 shrink-0 rounded-full" />
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex gap-2">
      <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100" />
      <div className="animate-pulse rounded-xl bg-gray-100 p-3">
        <p className="text-body-10 text-black">. . .</p>
      </div>
    </div>
  );
}

function ChatbotPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'bot',
      text: '안녕하세요! 무엇을 도와드릴까요? 상품 추천, 주문 조회, 배송 문의 등 편하게 말씀해 주세요 😊',
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoggedIn) return;
    getChatHistory()
      .then((history) => {
        if (history.length === 0) return;
        setShowQuickReplies(false);
        setMessages((prev) => [
          ...prev,
          ...history.map((item, index) => ({
            id: `history-${index}-${item.createdAt}`,
            role: (item.role === 'user' ? 'user' : 'bot') as Message['role'],
            text: item.message,
            time: getTime(new Date(item.createdAt)),
          })),
        ]);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setShowQuickReplies(false);
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    sendChatMessage({ message: trimmed, sessionId })
      .then((res) => {
        const botMsg: Message = {
          id: `${Date.now()}-bot`,
          role: 'bot',
          text: res.reply,
          time: getTime(),
        };
        setMessages((prev) => [...prev, botMsg]);
      })
      .catch(() => {
        const botMsg: Message = {
          id: `${Date.now()}-bot`,
          role: 'bot',
          text: FALLBACK_REPLY,
          time: getTime(),
        };
        setMessages((prev) => [...prev, botMsg]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    if (value.length > 500) return;
    setInput(value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
  };

  return (
    <div className="flex min-h-screen justify-center">
      <div className="flex h-screen w-full max-w-120 flex-col bg-white">
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-3 py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/40"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>
          <span className="text-xl font-bold text-black">쇼핑 도우미</span>
          <div className="h-8 w-8" />
        </div>

        {/* 채팅 영역 */}
        <div className="flex-1 overflow-y-auto px-3 py-2.5">
          <div className="flex flex-col gap-2.5">
            {messages.map((msg) =>
              msg.role === 'bot' ? (
                <BotBubble key={msg.id} text={msg.text} time={msg.time} />
              ) : (
                <UserBubble key={msg.id} text={msg.text} time={msg.time} />
              ),
            )}
            {isLoading && <LoadingBubble />}
          </div>

          {/* 빠른 답변 버튼 */}
          {showQuickReplies && (
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => sendMessage(reply)}
                  className="border-primary-200 text-body-10 text-primary-200 rounded-full border px-3 py-1.5"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 입력 영역 */}
        <div className="flex shrink-0 items-center gap-2 px-3 py-4 shadow-[0px_-4px_4px_0px_rgba(0,0,0,0.1)]">
          <div className="flex flex-1 items-center gap-2 rounded-3xl border-2 border-black px-4 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className="text-body-1 flex-1 resize-none bg-transparent text-black outline-none placeholder:font-bold placeholder:text-gray-200"
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="ml-1 shrink-0 text-black disabled:text-gray-200"
            >
              <SendHorizontal size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;
