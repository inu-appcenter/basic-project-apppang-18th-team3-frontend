import type { ReactNode } from 'react';
import { Bot, Home, Search, ShoppingCart, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type NavItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: '홈', path: '/', icon: <Home size={24} /> },
  { label: '검색', path: '/search', icon: <Search size={24} /> },
  { label: '챗봇', path: '/chatbot', icon: <Bot size={24} /> },
  { label: '장바구니', path: '/cart', icon: <ShoppingCart size={24} /> },
  { label: '마이페이지', path: '/mypage', icon: <User size={24} /> },
];

function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex h-16 shrink-0 border-t border-gray-100 bg-white">
      {NAV_ITEMS.map(({ label, path, icon }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={`hover:bg-primary-100 hover:text-primary-200 flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? 'text-primary-200' : 'text-gray-300'
            }`}
          >
            {icon}
            <span className="text-[10px] leading-none">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default NavigationBar;
