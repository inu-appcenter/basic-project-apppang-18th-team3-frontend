import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLoginRequest = error.config?.url?.includes('/api/auth/login');
    const hadToken = Boolean(localStorage.getItem('accessToken'));
    // 토큰이 있었는데(로그인 세션 만료) 401이 온 경우에만 강제 로그아웃한다.
    // 토큰 없이 비로그인 상태로 요청했다가 401이 온 경우(공개 페이지에서 인증 필요한
    // 부가 데이터 조회 등)는 호출부의 catch가 조용히 처리하도록 두고 리다이렉트하지 않는다.
    if (error.response?.status === 401 && !isLoginRequest && hadToken) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default instance;
