import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Smartphone,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { checkEmail, login, signup } from '@/api/auth';
import CheckBox from '@/components/CheckBox';
import Toast from '@/components/Toast';
import { useAuthStore } from '@/store/authStore';

// ─── Constants ────────────────────────────────────────────
const TERMS = [
  { id: 'age', label: '만 14세 이상입니다', required: true, hasLink: false },
  { id: 'service', label: '앱팡 이용약관 동의', required: true, hasLink: true },
  { id: 'finance', label: '전자금융거래 이용약관 동의', required: true, hasLink: true },
  { id: 'privacy', label: '개인정보 수집 및 이용 동의', required: true, hasLink: true },
  { id: 'thirdParty', label: '개인정보 제3자 제공 동의', required: true, hasLink: true },
  {
    id: 'marketing',
    label: '마케팅 및 이벤트 목적의 개인정보 수집 및 이용동의',
    required: false,
    hasLink: true,
  },
] as const;

type TermId = (typeof TERMS)[number]['id'];

// ─── Helpers ──────────────────────────────────────────────
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const isEmailFormat = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPasswordValid = (v: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);
const isNameValid = (v: string) => /^[가-힣a-zA-Z]{2,}$/.test(v);
const isPhoneValid = (v: string) => /^\d{3}-\d{4}-\d{4}$/.test(v);

// ─── Sub-components ───────────────────────────────────────
// Figma: left gray icon area + right white input area, 52px tall, Gray-300 border
function InputField({
  icon,
  children,
  focused,
  hasError = false,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  focused: boolean;
  hasError?: boolean;
}) {
  let borderClass = 'border-gray-200';
  if (focused) borderClass = 'border-primary-200';
  else if (hasError) borderClass = 'border-red-300';

  return (
    <div className={`flex h-[52px] items-stretch border transition-colors ${borderClass}`}>
      {/* 좌측 아이콘 영역 (Gray-100 배경, 우측 구분선) */}
      <div className="flex w-12 shrink-0 items-center justify-center border-r border-gray-200 bg-gray-100">
        <span className="text-gray-300">{icon}</span>
      </div>
      {/* 우측 입력 영역 */}
      <div className="flex flex-1 items-center gap-2 px-3">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [name, setName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  const [phone, setPhone] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);

  const [checkedTerms, setCheckedTerms] = useState<Record<TermId, boolean>>({
    age: false,
    service: false,
    finance: false,
    privacy: false,
    thirdParty: false,
    marketing: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const showTermDetail = (label: string) => {
    setInfoMessage(`${label} 상세 내용은 준비 중입니다`);
    setTimeout(() => setInfoMessage(null), 2000);
  };

  // ── Derived ───────────────────────────────────────────
  const allChecked = TERMS.every((t) => checkedTerms[t.id]);
  const requiredChecked = TERMS.filter((t) => t.required).every((t) => checkedTerms[t.id]);

  const showPasswordError = passwordTouched && !!password && !isPasswordValid(password);
  const showPasswordSuccess = passwordTouched && isPasswordValid(password);

  const isFormValid =
    isEmailFormat(email) &&
    !emailError &&
    isPasswordValid(password) &&
    isNameValid(name) &&
    isPhoneValid(phone) &&
    requiredChecked;

  // ── Handlers ──────────────────────────────────────────
  const handleEmailBlur = async () => {
    setEmailFocused(false);
    if (!email) return;
    if (!isEmailFormat(email)) {
      setEmailError('이메일 형식을 확인해 주세요.');
      return;
    }
    try {
      const { available } = await checkEmail(email);
      setEmailError(available ? null : '이미 사용 중인 이메일입니다.');
    } catch {
      setEmailError('이메일 확인 중 오류가 발생했습니다.');
    }
  };

  const handleAllTerms = () => {
    const next = !allChecked;
    setCheckedTerms({
      age: next,
      service: next,
      finance: next,
      privacy: next,
      thirdParty: next,
      marketing: next,
    });
  };

  const handleTerm = (id: TermId) => {
    setCheckedTerms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async () => {
    if (!isFormValid || isLoading) return;
    setIsLoading(true);
    try {
      await signup({
        email,
        password,
        name,
        phoneNumber: phone.replace(/-/g, ''),
        agreedRequiredTerms: requiredChecked,
      });
      const { token, user } = await login({ email, password });
      setAuth(token, user);
      navigate('/');
    } catch {
      setSubmitError('회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white pb-10">
      {/* Header */}
      <header className="relative flex items-center justify-center px-5 py-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="absolute left-5 p-1"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <h1 className="text-body-2 font-bold text-black">회원가입</h1>
      </header>

      {/* Logo */}
      <div className="flex justify-center px-16 py-3">
        <img src="/apppang-logo.png" alt="앱팡" className="h-[30px] object-contain" />
      </div>

      {/* Form */}
      <div className="flex flex-col px-3 pt-3">
        <p className="text-body-7 px-1 pb-3 font-bold text-black">회원정보를 입력해주세요</p>

        <div className="flex flex-col gap-2.5">
          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <InputField icon={<Mail size={18} />} focused={emailFocused} hasError={!!emailError}>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={handleEmailBlur}
                placeholder="아이디(이메일)"
                className="text-body-7 flex-1 text-black outline-none placeholder:text-gray-300"
              />
              {email && (
                <button
                  type="button"
                  aria-label="지우기"
                  onClick={() => {
                    setEmail('');
                    setEmailError(null);
                  }}
                  className="shrink-0 text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
            </InputField>
            {emailError && <p className="text-body-10 px-1 text-red-300">{emailError}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <InputField
              icon={<Lock size={18} />}
              focused={passwordFocused}
              hasError={showPasswordError}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => {
                  setPasswordFocused(false);
                  setPasswordTouched(true);
                }}
                placeholder="비밀번호"
                className="text-body-7 flex-1 text-black outline-none placeholder:text-gray-300"
              />
              {/* Figma: eye icon in gray rounded circle */}
              <button
                type="button"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                onClick={() => setShowPassword((prev) => !prev)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-300 text-white"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </InputField>
            {showPasswordError && (
              <p className="text-body-10 px-1 text-red-300">
                비밀번호는 8자 이상, 영문+숫자 조합이어야합니다.
              </p>
            )}
            {showPasswordSuccess && (
              <p className="text-body-10 px-1 text-green-300">✓ 사용가능한 비밀번호입니다.</p>
            )}
          </div>

          {/* 이름 */}
          <div className="flex flex-col gap-1.5">
            <InputField
              icon={<User size={18} />}
              focused={nameFocused}
              hasError={nameTouched && !!name && !isNameValid(name)}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => {
                  setNameFocused(false);
                  setNameTouched(true);
                }}
                placeholder="이름"
                className="text-body-7 flex-1 text-black outline-none placeholder:text-gray-300"
              />
            </InputField>
            {nameTouched && !!name && !isNameValid(name) && (
              <p className="text-body-10 px-1 text-red-300">
                한글 또는 영문 2자 이상으로 입력해 주세요.
              </p>
            )}
          </div>

          {/* 휴대폰 번호 */}
          <InputField icon={<Smartphone size={18} />} focused={phoneFocused}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              placeholder="휴대폰 번호"
              className="text-body-7 flex-1 text-black outline-none placeholder:text-gray-300"
            />
          </InputField>
        </div>
      </div>

      {/* 구분선 */}
      <div className="mx-3 mt-5 h-px bg-gray-200" />

      {/* 약관 동의 */}
      <div className="flex flex-col gap-0 px-3 pt-3">
        <p className="text-body-7 px-1 pb-1 font-bold text-black">앱팡 서비스약관에 동의해주세요</p>

        {/* 전체 동의 */}
        <button
          type="button"
          onClick={handleAllTerms}
          className="flex items-start gap-2 py-3 text-left"
        >
          <CheckBox checked={allChecked} />
          <div className="flex flex-col gap-2.5 pt-0.5">
            <span className="text-body-5 font-bold text-black">모두 동의합니다.</span>
            <p className="text-body-9 leading-relaxed text-gray-300">
              동의에는 필수 및 선택 목적(광고성 정보 수신 포함) 에 대한 동의가 포함되어 있으며, 선택
              목적의 동의를 거부하시는 경우에도 서비스 이용이 가능합니다.
            </p>
          </div>
        </button>

        {/* 개별 약관 */}
        <div className="flex flex-col divide-y divide-gray-200 border border-gray-200 px-3 py-5">
          {TERMS.map((term) => (
            <div key={term.id} className="flex items-center gap-2 py-2.5">
              <button type="button" onClick={() => handleTerm(term.id)} aria-label={term.label}>
                <CheckBox checked={checkedTerms[term.id]} />
              </button>
              <p className="text-body-7 flex-1 text-black">
                <span className={term.required ? 'text-primary-200' : 'text-gray-300'}>
                  {term.required ? '[필수] ' : '[선택] '}
                </span>
                {term.label}
              </p>
              {term.hasLink && (
                <button
                  type="button"
                  aria-label={`${term.label} 상세보기`}
                  onClick={() => showTermDetail(term.label)}
                  className="shrink-0"
                >
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 가입하기 버튼 */}
      <div className="mt-8 px-3">
        <button
          type="button"
          disabled={!isFormValid || isLoading}
          onClick={handleSubmit}
          className={`text-body-5 flex w-full items-center justify-center py-3 font-bold text-white transition-colors ${
            isFormValid && !isLoading ? 'bg-primary-200' : 'bg-gray-200'
          }`}
        >
          {isLoading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            '가입하기'
          )}
        </button>
        {submitError && <p className="text-body-10 mt-2 text-center text-red-300">{submitError}</p>}
      </div>

      <Toast message={infoMessage} onClose={() => setInfoMessage(null)} />
    </div>
  );
}

export default RegisterPage;
