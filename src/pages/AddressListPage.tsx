import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAddresses } from '@/api/address';
import NavigationBar from '@/components/NavigationBar';
import type { AddressResponse } from '@/types/address';

function AddressCard({ address, onEdit }: { address: AddressResponse; onEdit: () => void }) {
  return (
    <div className="flex w-full flex-col items-start gap-3 border border-gray-200 bg-white px-5 py-4.5">
      <p className="text-[15px] font-bold text-black">{address.recipientName}</p>
      <div className="flex flex-col items-start gap-1.5">
        {address.isDefault && (
          <span className="text-body-11 rounded-full border border-gray-300 px-1 py-0.75 text-gray-300">
            기본배송지
          </span>
        )}
        <p className="text-[13px] text-black">
          {address.address} {address.detailAddress}
        </p>
        <p className="text-[13px] text-black">{address.phone}</p>
        <p className="text-body-9 text-black">
          일반 : {address.normalDeliveryRequest || '-'} / 로켓 :{' '}
          {address.rocketDeliveryRequest || '-'}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-body-9 text-primary-200 border border-gray-300 px-5 py-2"
      >
        수정
      </button>
    </div>
  );
}

function AddressListPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);

  useEffect(() => {
    getAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }, []);

  return (
    <div className="flex min-h-screen justify-center">
      <div className="relative flex min-h-screen w-full max-w-120 flex-col bg-white">
        <div className="flex shrink-0 items-center justify-center px-3 py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="absolute left-3"
          >
            <ChevronLeft size={24} className="text-black" />
          </button>
          <h1 className="text-body-2 font-bold text-black">배송지 관리</h1>
        </div>

        <div className="px-2.5 py-2">
          <div className="flex flex-col gap-3.5">
            {addresses.map((address) => (
              <AddressCard
                key={address.addressId}
                address={address}
                onEdit={() =>
                  navigate(`/mypage/addresses/${address.addressId}/edit`, { state: { address } })
                }
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

export default AddressListPage;
