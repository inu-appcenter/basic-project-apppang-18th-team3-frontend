import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AuthLayout from '@/layouts/AuthLayout';
import CommonLayout from '@/layouts/CommonLayout';
import CartPage from '@/pages/CartPage';
import ChatbotPage from '@/pages/ChatbotPage';
import LoginPage from '@/pages/LoginPage';
import MainPage from '@/pages/MainPage';
import MyPage from '@/pages/MyPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import ProductListPage from '@/pages/ProductListPage';
import RegisterPage from '@/pages/RegisterPage';
import SearchPage from '@/pages/SearchPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CommonLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        <Route path="/chatbot" element={<ChatbotPage />} />

        <Route path="/search" element={<SearchPage />} />

        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
