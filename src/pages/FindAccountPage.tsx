import { ChevronLeft } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { findEmail, resetPassword, verifyPasswordReset } from '@/api/auth';
import Toast from '@/components/Toast';
import { formatPhone } from '@/utils/phone';

type Tab = 'id' | 'password';
type PasswordStep = 'verify' | 'reset' | 'done';

const isPhoneValid = (v: string) => /^\d{3}-\d{4}-\d{4}$/.test(v);
const isEmailFormat = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPasswordValid = (v: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v);

function TextField({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="text-body-7 focus:border-primary-200 w-full border border-gray-200 px-4 py-3.5 text-black outline-none placeholder:text-gray-300"
    />
  );
}

function FindAccountPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('id');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2000);
  };

  // ── 아이디 찾기 ──
  const [idName, setIdName] = useState('');
  const [idPhone, setIdPhone] = useState('');
  const [foundEmails, setFoundEmails] = useState<string[] | null>(null);

  const handleFindEmail = async () => {
    if (!idName || !isPhoneValid(idPhone) || isLoading) return;
    setIsLoading(true);
    try {
      const { emails } = await findEmail({ name: idName, phoneNumber: idPhone.replace(/-/g, '') });
      setFoundEmails(emails);
    } catch {
      showToast('일치하는 회원 정보가 없습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 비밀번호 찾기 ──
  const [pwStep, setPwStep] = useState<PasswordStep>('verify');
  const [pwEmail, setPwEmail] = useState('');
  const [pwName, setPwName] = useState('');
  const [pwPhone, setPwPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const handleVerify = async () => {
    if (!pwEmail || !pwName || !isPhoneValid(pwPhone) || isLoading) return;
    setIsLoading(true);
    try {
      const { resetToken: token } = await verifyPasswordReset({
        email: pwEmail,
        name: pwName,
        phoneNumber: pwPhone.replace(/-/g, ''),
      });
      setResetToken(token);
      setPwStep('reset');
    } catch {
      showToast('일치하는 회원 정보가 없습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isPasswordValid(newPassword) || newPassword !== newPasswordConfirm || isLoading) return;
    setIsLoading(true);
    try {
      await resetPassword({ resetToken, newPassword });
      setPwStep('done');
    } catch {
      showToast('비밀번호 변경에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = (nextTab: Tab) => {
    setTab(nextTab);
    setFoundEmails(null);
    setIdName('');
    setIdPhone('');
    setPwStep('verify');
    setPwEmail('');
    setPwName('');
    setPwPhone('');
    setNewPassword('');
    setNewPasswordConfirm('');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white px-5">
      <header className="relative flex items-center justify-center py-4.5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="absolute left-0 p-1"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        <h1 className="text-body-2 font-bold text-black">아이디·비밀번호 찾기</h1>
      </header>

      {/* 탭 */}
      <div className="mt-2 flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => resetAll('id')}
          className={`text-body-6 flex-1 border-b-2 py-3 font-bold transition-colors ${
            tab === 'id' ? 'border-primary-200 text-black' : 'border-transparent text-gray-300'
          }`}
        >
          아이디 찾기
        </button>
        <button
          type="button"
          onClick={() => resetAll('password')}
          className={`text-body-6 flex-1 border-b-2 py-3 font-bold transition-colors ${
            tab === 'password'
              ? 'border-primary-200 text-black'
              : 'border-transparent text-gray-300'
          }`}
        >
          비밀번호 찾기
        </button>
      </div>

      {tab === 'id' &&
        (foundEmails === null ? (
          <div className="mt-5 flex flex-col gap-3">
            <TextField value={idName} onChange={setIdName} placeholder="이름" />
            <TextField
              value={idPhone}
              onChange={(v) => setIdPhone(formatPhone(v))}
              placeholder="휴대폰 번호"
              type="tel"
            />
            <button
              type="button"
              disabled={!idName || !isPhoneValid(idPhone) || isLoading}
              onClick={handleFindEmail}
              className="text-body-5 bg-primary-200 mt-2 w-full py-3.5 font-bold text-white disabled:bg-gray-200"
            >
              {isLoading ? (
                <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                '아이디 찾기'
              )}
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            <p className="text-body-7 font-bold text-black">
              {foundEmails.length > 0
                ? '아래 아이디로 가입되어 있어요'
                : '일치하는 아이디가 없습니다'}
            </p>
            <div className="flex flex-col gap-2">
              {foundEmails.map((email) => (
                <p
                  key={email}
                  className="text-body-7 border border-gray-200 px-4 py-3.5 text-black"
                >
                  {email}
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-body-5 bg-primary-200 mt-2 w-full py-3.5 font-bold text-white"
            >
              로그인하러 가기
            </button>
          </div>
        ))}

      {tab === 'password' && pwStep === 'verify' && (
        <div className="mt-5 flex flex-col gap-3">
          <TextField value={pwEmail} onChange={setPwEmail} placeholder="아이디(이메일)" />
          <TextField value={pwName} onChange={setPwName} placeholder="이름" />
          <TextField
            value={pwPhone}
            onChange={(v) => setPwPhone(formatPhone(v))}
            placeholder="휴대폰 번호"
            type="tel"
          />
          <button
            type="button"
            disabled={!isEmailFormat(pwEmail) || !pwName || !isPhoneValid(pwPhone) || isLoading}
            onClick={handleVerify}
            className="text-body-5 bg-primary-200 mt-2 w-full py-3.5 font-bold text-white disabled:bg-gray-200"
          >
            {isLoading ? (
              <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              '본인인증'
            )}
          </button>
        </div>
      )}

      {tab === 'password' && pwStep === 'reset' && (
        <div className="mt-5 flex flex-col gap-3">
          <TextField
            value={newPassword}
            onChange={setNewPassword}
            placeholder="새 비밀번호 (8자 이상, 영문+숫자)"
            type="password"
          />
          <TextField
            value={newPasswordConfirm}
            onChange={setNewPasswordConfirm}
            placeholder="새 비밀번호 확인"
            type="password"
          />
          {newPasswordConfirm && newPassword !== newPasswordConfirm && (
            <p className="text-body-10 text-red-300">비밀번호가 일치하지 않습니다</p>
          )}
          <button
            type="button"
            disabled={
              !isPasswordValid(newPassword) || newPassword !== newPasswordConfirm || isLoading
            }
            onClick={handleResetPassword}
            className="text-body-5 bg-primary-200 mt-2 w-full py-3.5 font-bold text-white disabled:bg-gray-200"
          >
            {isLoading ? (
              <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              '비밀번호 변경'
            )}
          </button>
        </div>
      )}

      {tab === 'password' && pwStep === 'done' && (
        <div className="mt-5 flex flex-col gap-4">
          <p className="text-body-7 font-bold text-black">비밀번호가 변경되었습니다</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-body-5 bg-primary-200 w-full py-3.5 font-bold text-white"
          >
            로그인하러 가기
          </button>
        </div>
      )}

      <Toast message={toastMessage} tone="error" onClose={() => setToastMessage(null)} />
    </div>
  );
}

export default FindAccountPage;
