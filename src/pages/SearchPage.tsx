import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft, Info, Search, X } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';
import Toast from '@/components/Toast';
import {
  deleteSearchHistory,
  getSearchHistory,
  getSuggestions,
  saveSearchHistory,
} from '@/api/search';
import { useAuthStore } from '@/store/authStore';

const STORAGE_KEY = 'recentSearches';
const MAX_RECENT = 10;

// 백엔드에 "추천 검색어(입력 전 인기 키워드)" 조회 엔드포인트가 없어 하드코딩 유지.
// GET /api/search/suggestions는 keyword 입력이 있을 때의 자동완성만 제공한다.
const RECOMMENDED: string[] = [
  '휴지',
  '냅킨',
  '물티슈',
  '생수',
  '세제',
  '샴푸',
  '치약',
  '비누',
  '면도기',
  '로션',
];

function HighlightedText({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

function SuggestionList({
  suggestions,
  query,
  onSelect,
}: {
  suggestions: string[];
  query: string;
  onSelect: (keyword: string) => void;
}) {
  if (suggestions.length === 0) {
    return <p className="text-body-9 px-1 py-10 text-center text-gray-300">검색 결과가 없습니다</p>;
  }
  return (
    <ul>
      {suggestions.map((suggestion) => (
        <li key={suggestion}>
          <button
            type="button"
            onClick={() => onSelect(suggestion)}
            className="flex w-full items-center gap-2.5 border-b border-gray-200 py-1"
          >
            <Search size={24} className="shrink-0 text-gray-300" />
            <span className="text-body-1 text-black">
              <HighlightedText text={suggestion} query={query} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SearchPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef('');

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  useEffect(() => {
    inputRef.current?.focus();

    if (isLoggedIn) {
      getSearchHistory()
        .then(({ items }) => setRecentSearches(items.map((item) => item.name)))
        .catch(() => setRecentSearches([]));
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // localStorage 파싱 실패 시 빈 목록 유지
    }
  }, [isLoggedIn]);

  const saveToLocal = (list: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const addRecentSearch = (keyword: string) => {
    if (isLoggedIn) {
      setRecentSearches((prev) =>
        [keyword, ...prev.filter((k) => k !== keyword)].slice(0, MAX_RECENT),
      );
      saveSearchHistory(keyword).catch(() => {});
      return;
    }
    const updated = [keyword, ...recentSearches.filter((k) => k !== keyword)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    saveToLocal(updated);
  };

  const removeRecentSearch = (keyword: string) => {
    if (isLoggedIn) {
      setRecentSearches((prev) => prev.filter((k) => k !== keyword));
      deleteSearchHistory(keyword).catch(() => {});
      return;
    }
    const updated = recentSearches.filter((k) => k !== keyword);
    setRecentSearches(updated);
    saveToLocal(updated);
  };

  const clearAllRecent = () => {
    if (isLoggedIn) {
      const toDelete = recentSearches;
      setRecentSearches([]);
      // 서버에 전체 삭제 엔드포인트가 없어 키워드별 삭제를 순차 호출한다.
      toDelete.forEach((keyword) => {
        deleteSearchHistory(keyword).catch(() => {});
      });
      return;
    }
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSearch = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    setShowSuggestions(false);
    navigate(`/products?q=${encodeURIComponent(trimmed)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 1) {
      debounceRef.current = setTimeout(() => {
        latestQueryRef.current = value;
        getSuggestions(value)
          .then(({ suggestions: result }) => {
            if (latestQueryRef.current !== value) return;
            setSuggestions(result);
            setShowSuggestions(true);
          })
          .catch(() => {
            if (latestQueryRef.current !== value) return;
            setSuggestions([]);
            setShowSuggestions(true);
          });
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch(query);
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setQuery('');
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen justify-center">
      <div className="flex h-screen w-full max-w-120 flex-col bg-white">
        {/* 검색 헤더 */}
        <div className="flex shrink-0 items-center gap-2 px-3 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/40"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>

          <div className="flex flex-1 items-center gap-2 rounded-3xl border-2 border-black px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="검색어 입력"
              className="text-body-1 flex-1 bg-transparent text-black outline-none placeholder:font-bold placeholder:text-gray-200"
            />
            {query ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200"
                aria-label="입력 초기화"
              >
                <X size={12} className="text-black" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => showToast('이미지 검색은 준비 중인 기능입니다')}
                aria-label="이미지로 검색"
              >
                <Camera size={24} className="shrink-0 text-black" />
              </button>
            )}
          </div>
        </div>

        {/* 페이지 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-3">
          {showSuggestions ? (
            <SuggestionList suggestions={suggestions} query={query} onSelect={handleSearch} />
          ) : (
            /* 기본 상태: 최근 검색어 + 추천 검색어 */
            <>
              {/* 최근 검색어 */}
              {recentSearches.length > 0 && (
                <div className="flex flex-col gap-3 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-body-1 text-black">최근 검색어</span>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-body-10 text-gray-300"
                    >
                      전체 삭제
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {recentSearches.map((keyword) => (
                      <div
                        key={keyword}
                        className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2"
                      >
                        <button
                          type="button"
                          onClick={() => handleSearch(keyword)}
                          className="text-body-10 text-black"
                        >
                          {keyword}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRecentSearch(keyword)}
                          className="flex items-center"
                          aria-label={`${keyword} 삭제`}
                        >
                          <X size={12} className="text-gray-300" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 추천 검색어 */}
              <div className="flex flex-col gap-3 py-3">
                <div className="flex items-center gap-1">
                  <span className="text-body-1 text-black">앱팡 추천 검색어</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTooltip((prev) => !prev)}
                      aria-label="추천 검색어 기준 안내"
                    >
                      <Info size={20} className="text-gray-300" />
                    </button>
                    {showTooltip && (
                      <div className="absolute top-0 left-6 z-10 w-48 rounded-lg bg-black px-3 py-2 text-xs leading-relaxed text-white shadow-lg">
                        사용자 검색 데이터를 기반으로 추천된 키워드입니다.
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {RECOMMENDED.map((keyword) => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => handleSearch(keyword)}
                      className="text-body-10 rounded-full border border-gray-200 px-3 py-2 text-black"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <NavigationBar />
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </div>
    </div>
  );
}

export default SearchPage;
