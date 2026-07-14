import { ChevronRight, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
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
      const { token, user } = await login({ email, password });
      setAuth(token, user);
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
          <X size={24} className="text-gray-300" />
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
              <X size={8} className="text-white" />
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
              <EyeOff size={20} className="text-gray-300" />
            ) : (
              <Eye size={20} className="text-gray-300" />
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
          <ChevronRight size={12} className="text-primary-200" />
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
          <ChevronRight size={12} className="text-primary-200" />
        </button>
      </div>

      {/* Toast — 로그인 실패 */}
      {loginError && (
        <div className="absolute top-18 left-1/2 flex w-max -translate-x-1/2 items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-[4px_4px_12px_0px_rgba(0,0,0,0.2)]">
          <button type="button" onClick={() => setLoginError(false)} className="shrink-0">
            <X size={12} className="text-gray-300" />
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
