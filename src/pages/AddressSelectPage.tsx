import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAddresses } from '@/api/address';
import NavigationBar from '@/components/NavigationBar';
import { useCheckoutStore } from '@/store/checkoutStore';
import type { AddressResponse } from '@/types/address';

function AddressSelectCard({
  address,
  onEdit,
  onSelect,
}: {
  address: AddressResponse;
  onEdit: () => void;
  onSelect: () => void;
}) {
  return (
    <div className="flex w-full items-end gap-4 border border-gray-200 bg-white py-4.5 pr-5 pl-5">
      <div className="flex flex-1 flex-col items-start gap-2.75">
        <p className="text-[15px] font-bold text-black">{address.recipientName}</p>
        {address.isDefault && (
          <span className="text-body-11 rounded-full border border-gray-300 px-1 py-0.75 text-gray-300">
            기본배송지
          </span>
        )}
        <div className="text-[13px] text-black">
          <p>
            {address.address} {address.detailAddress}
          </p>
          <p>{address.phone}</p>
        </div>
        {address.normalDeliveryRequest && (
          <p className="text-[12px] text-black">{address.normalDeliveryRequest}</p>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="text-body-9 text-primary-200 border border-gray-300 px-5 py-2"
        >
          수정
        </button>
      </div>
      <button
        type="button"
        onClick={onSelect}
        className="text-body-9 bg-primary-200 h-7.5 shrink-0 px-5 py-2 font-extrabold text-white"
      >
        선택
      </button>
    </div>
  );
}

function AddressSelectPage() {
  const navigate = useNavigate();
  const setAddressId = useCheckoutStore((state) => state.setAddressId);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);

  useEffect(() => {
    getAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }, []);

  const handleSelect = (addressId: number) => {
    setAddressId(addressId);
    navigate(-1);
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
          <h1 className="text-body-2 font-bold text-black">배송지 선택</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-2">
          <div className="flex flex-col gap-3.5">
            {addresses.map((address) => (
              <AddressSelectCard
                key={address.addressId}
                address={address}
                onEdit={() =>
                  navigate(`/mypage/addresses/${address.addressId}/edit`, { state: { address } })
                }
                onSelect={() => handleSelect(address.addressId)}
              />
            ))}

            <button
              type="button"
              onClick={() => navigate('/mypage/addresses/new')}
              className="text-body-5 border-primary-200 text-primary-200 flex h-11.5 w-full items-center justify-center border font-bold"
            >
              배송지 추가
            </button>
          </div>
        </div>

        <NavigationBar />
      </div>
    </div>
  );
}

export default AddressSelectPage;
