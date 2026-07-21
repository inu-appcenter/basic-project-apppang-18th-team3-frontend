import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getMe, updateMe, updatePassword } from '@/api/mypage';
import NavigationBar from '@/components/NavigationBar';
import { useAuthStore } from '@/store/authStore';

type Toast = { text: string; tone: 'success' | 'error' };

// ─── Local sub-components (이 페이지 전용) ──────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="h-px w-full bg-gray-200" />
      <p className="text-body-7 text-center text-black opacity-50">{label}</p>
      <div className="h-px w-full bg-gray-200" />
    </div>
  );
}

function EditField({
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  type?: 'text' | 'email' | 'tel' | 'password';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex h-10 w-full items-center border border-gray-300 px-3">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-body-9 w-full text-black placeholder:text-gray-300 focus:outline-none"
      />
    </div>
  );
}

function ChangeButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`text-body-5 flex h-10 w-full items-center justify-center font-bold text-white transition-colors ${
        disabled ? 'bg-gray-200' : 'bg-primary-200'
      }`}
    >
      {label}
    </button>
  );
}

// 라벨 열은 왼쪽(그리드 1열), 수정/입력/버튼은 오른쪽(그리드 2열)으로 고정.
// 기본은 접힌 상태(값 + 수정 버튼)이고, 수정 버튼을 눌러야 입력창+변경 버튼이 펼쳐진다.
function FieldGroup({
  label,
  value,
  isEditing,
  onToggleEdit,
  type,
  placeholder,
  inputValue,
  onInputChange,
  buttonLabel,
  onSubmit,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  type?: 'text' | 'email' | 'tel';
  placeholder: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  buttonLabel: string;
  onSubmit: () => void;
}) {
  return (
    <>
      <span className="text-body-9 font-semibold text-black">{label}</span>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="text-body-9 truncate text-black">{value || '-'}</span>
        <button
          type="button"
          onClick={onToggleEdit}
          className="text-body-10 text-primary-200 border-primary-200 h-6.25 w-10.75 shrink-0 rounded border bg-white"
        >
          {isEditing ? '취소' : '수정'}
        </button>
      </div>
      {isEditing && (
        <>
          <div />
          <div className="flex flex-col gap-1">
            <EditField
              type={type}
              placeholder={placeholder}
              value={inputValue}
              onChange={onInputChange}
            />
            <ChangeButton label={buttonLabel} disabled={!inputValue} onClick={onSubmit} />
          </div>
        </>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────
function SettingsPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    getMe()
      .then((me) => {
        setName(me.name);
        setEmail(me.email);
        setPhoneNumber(me.phoneNumber);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const showToast = (text: string, tone: Toast['tone']) => setToast({ text, tone });

  const toggleEditName = () => {
    setEditingName((prev) => !prev);
    setNameInput('');
  };

  const toggleEditEmail = () => {
    setEditingEmail((prev) => !prev);
    setEmailInput('');
  };

  const toggleEditPhone = () => {
    setEditingPhone((prev) => !prev);
    setPhoneInput('');
  };

  const handleUpdateName = async () => {
    if (!nameInput) return;
    try {
      const res = await updateMe({ name: nameInput });
      setName(res.name);
      setNameInput('');
      setEditingName(false);
      showToast('이름이 변경되었습니다', 'success');
    } catch {
      showToast('이름 변경에 실패했습니다', 'error');
    }
  };

  const handleUpdateEmail = async () => {
    if (!emailInput) return;
    try {
      const res = await updateMe({ email: emailInput });
      setEmail(res.email);
      setEmailInput('');
      setEditingEmail(false);
      showToast('이메일이 변경되었습니다', 'success');
    } catch {
      showToast('이메일 변경에 실패했습니다', 'error');
    }
  };

  const handleUpdatePhone = async () => {
    if (!phoneInput) return;
    try {
      const res = await updateMe({ phoneNumber: phoneInput });
      setPhoneNumber(res.phoneNumber);
      setPhoneInput('');
      setEditingPhone(false);
      showToast('휴대폰 번호가 변경되었습니다', 'success');
    } catch {
      showToast('휴대폰 번호 변경에 실패했습니다', 'error');
    }
  };

  const canChangePassword =
    currentPassword.length > 0 && newPassword.length > 0 && newPassword === confirmPassword;

  const handleUpdatePassword = async () => {
    if (!canChangePassword) return;
    try {
      await updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('비밀번호가 변경되었습니다', 'success');
    } catch {
      showToast('비밀번호 변경에 실패했습니다', 'error');
    }
  };

  return (
    <div className="flex min-h-screen justify-center">
      <div className="relative flex min-h-screen w-full max-w-120 flex-col bg-white">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 px-3 pt-3.5">
          <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기">
            <ChevronLeft size={24} className="text-black" />
          </button>
          <h1 className="text-title-5 text-black">내정보관리</h1>
        </div>

        <div className="pt-4.5">
          <div className="flex w-full flex-col items-center gap-5 bg-gray-100 px-2.5 py-5">
            <div className="flex w-full max-w-81.75 flex-col gap-11.75">
              <button
                type="button"
                onClick={() => navigate('/mypage/addresses')}
                className="text-body-7 flex w-full items-center justify-between border border-gray-200 bg-white px-4 py-3 font-bold text-black"
              >
                배송지 관리
                <ChevronRight size={18} className="text-gray-300" />
              </button>

              {/* 기본정보 */}
              <div className="flex flex-col gap-5.5">
                <SectionDivider label="기본정보" />

                <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-3">
                  <FieldGroup
                    label="성명"
                    value={name}
                    isEditing={editingName}
                    onToggleEdit={toggleEditName}
                    placeholder="변경할 이름을 입력하세요."
                    inputValue={nameInput}
                    onInputChange={setNameInput}
                    buttonLabel="이름 변경"
                    onSubmit={handleUpdateName}
                  />
                  <FieldGroup
                    label="아이디(이메일)"
                    value={email}
                    isEditing={editingEmail}
                    onToggleEdit={toggleEditEmail}
                    type="email"
                    placeholder="변경할 이메일을 입력하세요."
                    inputValue={emailInput}
                    onInputChange={setEmailInput}
                    buttonLabel="이메일 변경"
                    onSubmit={handleUpdateEmail}
                  />
                  <FieldGroup
                    label="휴대폰 번호"
                    value={phoneNumber}
                    isEditing={editingPhone}
                    onToggleEdit={toggleEditPhone}
                    type="tel"
                    placeholder="변경할 휴대폰 번호를 입력하세요."
                    inputValue={phoneInput}
                    onInputChange={setPhoneInput}
                    buttonLabel="휴대폰 번호 변경"
                    onSubmit={handleUpdatePhone}
                  />
                </div>
              </div>

              {/* 비밀번호 변경 */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-4">
                  <SectionDivider label="비밀번호 변경" />

                  <div className="flex w-75 flex-col gap-4">
                    <EditField
                      type="password"
                      placeholder="현재 비밀번호를 입력하세요"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                    />
                    <EditField
                      type="password"
                      placeholder="새 비밀번호를 입력하세요."
                      value={newPassword}
                      onChange={setNewPassword}
                    />
                    <EditField
                      type="password"
                      placeholder="새 비밀번호를 한번 더 확인해주세요."
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-81.75">
              <ChangeButton
                label="비밀번호 변경"
                disabled={!canChangePassword}
                onClick={handleUpdatePassword}
              />
            </div>
          </div>
        </div>

        <NavigationBar />

        {/* Toast */}
        {toast && (
          <div className="absolute top-18 left-1/2 flex w-max -translate-x-1/2 items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-[4px_4px_12px_0px_rgba(0,0,0,0.2)]">
            <button type="button" onClick={() => setToast(null)} className="shrink-0">
              <X size={12} className="text-gray-300" />
            </button>
            <p
              className={`text-body-9 whitespace-nowrap ${
                toast.tone === 'success' ? 'text-black' : 'text-red-300'
              }`}
            >
              {toast.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
