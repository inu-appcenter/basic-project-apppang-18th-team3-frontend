import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { getMe } from '@/api/mypage';
import AuthLayout from '@/layouts/AuthLayout';
import CommonLayout from '@/layouts/CommonLayout';
import MainPage from '@/pages/MainPage';
import { useAuthStore } from '@/store/authStore';

// 첫 진입 라우트(MainPage)만 정적 import하고 나머지는 지연 로딩해
// 초기 번들 크기와 첫 진입 딜레이를 줄인다.
const AddressFormPage = lazy(() => import('@/pages/AddressFormPage'));
const AddressListPage = lazy(() => import('@/pages/AddressListPage'));
const AddressSelectPage = lazy(() => import('@/pages/AddressSelectPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const ChatbotPage = lazy(() => import('@/pages/ChatbotPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const FindAccountPage = lazy(() => import('@/pages/FindAccountPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const MyPage = lazy(() => import('@/pages/MyPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));
const OrderListPage = lazy(() => import('@/pages/OrderListPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const ProductListPage = lazy(() => import('@/pages/ProductListPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ReviewWritePage = lazy(() => import('@/pages/ReviewWritePage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));

function RouteFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-300" />
    </div>
  );
}

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
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<CommonLayout />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>

          <Route path="/chatbot" element={<ChatbotPage />} />

          <Route path="/search" element={<SearchPage />} />

          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/products/:productId/reviews/new" element={<ReviewWritePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/mypage/addresses" element={<AddressListPage />} />
          <Route path="/mypage/addresses/new" element={<AddressFormPage />} />
          <Route path="/mypage/addresses/:addressId/edit" element={<AddressFormPage />} />
          <Route path="/mypage/orders" element={<OrderListPage />} />
          <Route path="/mypage/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/mypage/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/address" element={<AddressSelectPage />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/find-account" element={<FindAccountPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
