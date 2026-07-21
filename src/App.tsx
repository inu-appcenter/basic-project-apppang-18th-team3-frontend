import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { getMe } from '@/api/mypage';
import AuthLayout from '@/layouts/AuthLayout';
import CommonLayout from '@/layouts/CommonLayout';
import AddressFormPage from '@/pages/AddressFormPage';
import AddressListPage from '@/pages/AddressListPage';
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
import SettingsPage from '@/pages/SettingsPage';
import { useAuthStore } from '@/store/authStore';

function App() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    getMe()
      .then((me) => setAuth(token, { userId: me.userId, name: me.name }))
      .catch(() => clearAuth());
  }, [setAuth, clearAuth]);

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
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/mypage/addresses" element={<AddressListPage />} />
        <Route path="/mypage/addresses/new" element={<AddressFormPage />} />
        <Route path="/mypage/addresses/:addressId/edit" element={<AddressFormPage />} />

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
