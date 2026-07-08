import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import instance from '@/api/instance';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isActive = email.length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!isActive || isLoading) return;
    setIsLoading(true);
    setLoginError(false);
    try {
      const { data } = await instance.post('/api/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      navigate('/');
    } catch {
      setLoginError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white px-5">
      {/* Header */}
      <header className="flex items-center justify-end py-4.5">
        <button type="button" onClick={() => navigate('/')} aria-label="닫기" className="p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#7E7E7E" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Logo */}
      <div className="flex items-center justify-center py-10">
        <img src="/apppang-logo.png" alt="앱팡" className="h-7.5 object-contain" />
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3">
        {/* Email Field */}
        <div
          className={`flex items-center gap-2 border px-4 py-3.5 transition-colors ${
            emailFocused ? 'border-primary-200' : 'border-gray-200'
          }`}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            placeholder="아이디(이메일)"
            className="text-body-7 flex-1 text-black outline-none placeholder:text-gray-300"
          />
          {email && (
            <button
              type="button"
              onClick={() => setEmail('')}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Password Field */}
        <div
          className={`flex items-center gap-2 border px-4 py-3.5 transition-colors ${
            passwordFocused ? 'border-primary-200' : 'border-gray-200'
          }`}
        >
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            placeholder="비밀번호"
            className="text-body-7 flex-1 text-black outline-none placeholder:text-gray-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="shrink-0"
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7E7E7E"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7E7E7E"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Login Button */}
      <button
        type="button"
        disabled={!isActive || isLoading}
        onClick={handleLogin}
        className={`text-body-5 mt-3 flex w-full items-center justify-center py-3.5 text-white transition-colors ${
          isActive && !isLoading ? 'bg-primary-200' : 'bg-gray-200'
        }`}
      >
        {isLoading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          '로그인'
        )}
      </button>

      {/* Find Account */}
      <div className="mt-3 flex justify-end">
        <button type="button" className="text-body-9 text-primary-200 flex items-center gap-0.5">
          아이디·비밀번호 찾기
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M4.5 2.5L7.5 6l-3 3.5"
              stroke="#346AFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="mt-5 h-px w-full bg-gray-200" />

      {/* Register Button */}
      <button
        type="button"
        onClick={() => navigate('/register')}
        className="text-body-5 text-primary-200 border-primary-200 mt-4 w-full border py-3.5"
      >
        회원가입
      </button>

      {/* Business Row */}
      <div className="mt-4 flex items-center justify-center gap-1">
        <span className="text-body-9 text-black">사업자이신가요?</span>
        <button type="button" className="text-body-9 text-primary-200 flex items-center gap-0.5">
          사업자 회원 가입하기
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M4.5 2.5L7.5 6l-3 3.5"
              stroke="#346AFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Toast — 로그인 실패 */}
      {loginError && (
        <div className="absolute top-18 left-1/2 flex w-max -translate-x-1/2 items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-[4px_4px_12px_0px_rgba(0,0,0,0.2)]">
          <button type="button" onClick={() => setLoginError(false)} className="shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 2l8 8M10 2L2 10"
                stroke="#7E7E7E"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <p className="text-body-9 whitespace-nowrap text-black">
            아이디 또는 비밀번호가 일치하지 않습니다
          </p>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
