import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { createAddress, getAddresses, updateAddress } from '@/api/address';
import NavigationBar from '@/components/NavigationBar';
import type { AddressResponse } from '@/types/address';

type DeliveryOption = 'door' | 'absent-door' | 'security' | 'locker' | 'custom';
type AccessOption = 'code' | 'free';

const DELIVERY_OPTION_LABEL: Record<Exclude<DeliveryOption, 'custom'>, string> = {
  door: '문 앞',
  'absent-door': '직접 받고 부재 시 문 앞',
  security: '경비실',
  locker: '택배함',
};

interface DeliveryState {
  expanded: boolean;
  option: DeliveryOption | null;
  customText: string;
  access: AccessOption | null;
  accessCode: string;
}

const EMPTY_DELIVERY: DeliveryState = {
  expanded: false,
  option: null,
  customText: '',
  access: null,
  accessCode: '',
};

// "문 앞(#1234#)" / "문 앞(자유 출입가능)" 형태로 백엔드 자유텍스트 필드(normalDeliveryRequest 등)를 조합
function composeDeliveryText(state: DeliveryState): string {
  if (!state.option) return '';
  const label = state.option === 'custom' ? state.customText : DELIVERY_OPTION_LABEL[state.option];
  if (!label) return '';
  if (state.access === 'code' && state.accessCode) return `${label}(#${state.accessCode}#)`;
  if (state.access === 'free') return `${label}(자유 출입가능)`;
  return label;
}

// ─── Local sub-components (이 페이지 전용) ──────────────────
function IconField({
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  icon: ReactNode;
  type?: 'text' | 'tel';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex h-13 w-full items-stretch border border-gray-300">
      <div className="flex w-12 shrink-0 items-center justify-center border-r border-gray-300 bg-gray-100">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-body-7 flex-1 px-3 font-bold text-black outline-none placeholder:text-gray-300"
      />
    </div>
  );
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
        selected ? 'border-primary-200' : 'border-gray-300'
      }`}
    >
      {selected && <span className="bg-primary-200 size-2 rounded-full" />}
    </span>
  );
}

function DeliverySection({
  title,
  placeholder,
  state,
  onChange,
}: {
  title: string;
  placeholder: string;
  state: DeliveryState;
  onChange: (state: DeliveryState) => void;
}) {
  const summary = composeDeliveryText(state);

  return (
    <div className="flex w-full flex-col border border-gray-300">
      <button
        type="button"
        onClick={() => onChange({ ...state, expanded: !state.expanded })}
        className="flex h-10 w-full items-center justify-between border-b border-gray-300 px-3"
      >
        <span className="text-body-7 font-bold text-gray-300">{summary || placeholder}</span>
        {state.expanded ? (
          <ChevronUp size={20} className="text-gray-300" />
        ) : (
          <ChevronDown size={20} className="text-gray-300" />
        )}
      </button>

      {state.expanded && (
        <div className="flex flex-col gap-3 border-b border-gray-300 px-2.5 py-3">
          <p className="text-body-7 font-bold text-gray-300">배송 정보</p>
          <div className="flex flex-col gap-2">
            {(Object.keys(DELIVERY_OPTION_LABEL) as Exclude<DeliveryOption, 'custom'>[]).map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange({ ...state, option })}
                  className="flex items-center gap-2.5 px-2.5"
                >
                  <RadioDot selected={state.option === option} />
                  <span className="text-body-7 font-bold text-gray-300">
                    {DELIVERY_OPTION_LABEL[option]}
                  </span>
                </button>
              ),
            )}
            <div className="flex flex-col gap-2 px-2.5">
              <button
                type="button"
                onClick={() => onChange({ ...state, option: 'custom' })}
                className="flex items-center gap-2.5"
              >
                <RadioDot selected={state.option === 'custom'} />
                <span className="text-body-7 font-bold text-gray-300">기타사항</span>
              </button>
              {state.option === 'custom' && (
                <input
                  value={state.customText}
                  onChange={(e) => onChange({ ...state, customText: e.target.value })}
                  placeholder="장소만 입력 (필수)"
                  className="text-body-7 h-8.75 border border-gray-300 px-3 font-bold text-gray-300 outline-none placeholder:opacity-60"
                />
              )}
            </div>
          </div>

          <p className="text-body-7 font-bold text-gray-300">공동현관 출입번호</p>
          <div className="flex flex-col gap-2 px-2.5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onChange({ ...state, access: 'code' })}
                className="shrink-0"
              >
                <RadioDot selected={state.access === 'code'} />
              </button>
              <input
                value={state.accessCode}
                onChange={(e) => onChange({ ...state, access: 'code', accessCode: e.target.value })}
                placeholder="예 : #1234"
                className="text-body-7 h-8.75 flex-1 border border-gray-300 px-3 font-bold text-gray-300 outline-none placeholder:opacity-60"
              />
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...state, access: 'free' })}
              className="flex items-center gap-2.5"
            >
              <RadioDot selected={state.access === 'free'} />
              <span className="text-body-7 font-bold text-gray-300">
                비밀번호없이 출입 가능해요
              </span>
            </button>
          </div>

          <button
            type="button"
            disabled={!summary}
            onClick={() => onChange({ ...state, expanded: false })}
            className="bg-primary-200 text-body-7 h-9 w-full font-bold text-white disabled:bg-gray-200"
          >
            완료
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
function AddressFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addressId } = useParams<{ addressId: string }>();
  const isEdit = addressId !== undefined;

  const [editTargetId, setEditTargetId] = useState<number | null>(
    isEdit ? Number(addressId) : null,
  );
  const [recipientName, setRecipientName] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [normal, setNormal] = useState<DeliveryState>(EMPTY_DELIVERY);
  const [rocket, setRocket] = useState<DeliveryState>(EMPTY_DELIVERY);
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const applyExisting = (found: AddressResponse) => {
    setEditTargetId(found.addressId);
    setRecipientName(found.recipientName);
    setAddress(found.address);
    setDetailAddress(found.detailAddress);
    setPhone(found.phone);
    setIsDefault(found.isDefault);
  };

  useEffect(() => {
    if (!isEdit) return;
    const stateAddress = (location.state as { address?: AddressResponse } | null)?.address;
    if (stateAddress) {
      applyExisting(stateAddress);
      return;
    }
    getAddresses()
      .then((list) => {
        const found = list.find((item) => item.addressId === Number(addressId));
        if (found) applyExisting(found);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressId, isEdit]);

  const isActive = recipientName.length > 0 && address.length > 0 && phone.length > 0;

  const handleSave = async () => {
    if (!isActive || isSaving) return;
    setIsSaving(true);
    try {
      const payload = {
        recipientName,
        phone,
        zipcode: '',
        address,
        detailAddress,
        normalDeliveryRequest: composeDeliveryText(normal),
        rocketDeliveryRequest: composeDeliveryText(rocket),
        isDefault,
      };
      if (isEdit && editTargetId !== null) {
        await updateAddress(editTargetId, payload);
      } else {
        await createAddress(payload);
      }
      navigate(-1);
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center">
      <div className="relative flex h-screen w-full max-w-120 flex-col bg-white">
        <div className="flex shrink-0 items-center justify-center px-3 py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="absolute left-3"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>
          <h1 className="text-body-2 font-bold text-black">배송지 입력</h1>
        </div>

        <div className="flex flex-1 flex-col items-center gap-4.5 overflow-y-auto px-2.5 pb-6">
          <IconField
            icon={<User size={20} className="text-gray-300" />}
            placeholder="받는 사람"
            value={recipientName}
            onChange={setRecipientName}
          />
          <div className="flex w-full items-stretch border border-gray-300">
            <div className="flex w-12 shrink-0 items-center justify-center border-r border-gray-300 bg-gray-100">
              <MapPin size={20} className="text-gray-300" />
            </div>
            <div className="flex flex-1 flex-col divide-y divide-gray-300">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="도로명 주소를 입력하세요"
                className="text-body-7 h-13 px-3 font-bold text-black outline-none placeholder:text-gray-300"
              />
              <input
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                placeholder="상세 주소를 입력하세요 (동/호수 등)"
                className="text-body-7 h-13 px-3 font-bold text-black outline-none placeholder:text-gray-300"
              />
            </div>
          </div>
          <IconField
            icon={<Phone size={20} className="text-gray-300" />}
            type="tel"
            placeholder="휴대폰 번호"
            value={phone}
            onChange={setPhone}
          />
          <div className="flex w-full items-stretch border border-gray-300">
            <div className="flex w-12 shrink-0 items-center justify-center border-r border-gray-300 bg-gray-100">
              <MessageSquare size={20} className="text-gray-300" />
            </div>
            <div className="flex flex-1 flex-col">
              <DeliverySection
                title="일반 배송 정보"
                placeholder="일반 배송 정보를 선택해 주세요."
                state={normal}
                onChange={setNormal}
              />
              <DeliverySection
                title="로켓 배송 정보"
                placeholder="로켓 배송 정보를 선택해 주세요."
                state={rocket}
                onChange={setRocket}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!isActive || isSaving}
            onClick={handleSave}
            className={`text-body-5 flex h-11 w-full items-center justify-center font-bold text-white transition-colors ${
              isActive && !isSaving ? 'bg-primary-200' : 'bg-gray-200'
            }`}
          >
            저장
          </button>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
}

export default AddressFormPage;
