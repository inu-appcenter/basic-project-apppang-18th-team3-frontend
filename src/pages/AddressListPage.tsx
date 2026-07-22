import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteAddress, getAddresses } from '@/api/address';
import ConfirmModal from '@/components/ConfirmModal';
import NavigationBar from '@/components/NavigationBar';
import type { AddressResponse } from '@/types/address';

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: AddressResponse;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="text-body-9 text-primary-200 border border-gray-300 px-5 py-2"
        >
          수정
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-body-9 border border-gray-300 px-5 py-2 text-gray-300"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

function AddressListPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }, []);

  const handleConfirmDelete = () => {
    if (pendingDeleteId === null) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    deleteAddress(id)
      .then(() => setAddresses((prev) => prev.filter((item) => item.addressId !== id)))
      .catch(() => {
        setErrorMessage('배송지 삭제에 실패했습니다');
        setTimeout(() => setErrorMessage(null), 2000);
      });
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
          <h1 className="text-body-2 font-bold text-black">배송지 관리</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 py-2">
          <div className="flex flex-col gap-3.5">
            {addresses.map((address) => (
              <AddressCard
                key={address.addressId}
                address={address}
                onEdit={() =>
                  navigate(`/mypage/addresses/${address.addressId}/edit`, { state: { address } })
                }
                onDelete={() => setPendingDeleteId(address.addressId)}
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

      <ConfirmModal
        open={pendingDeleteId !== null}
        message="배송지를 삭제하시겠습니까?"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />

      {errorMessage && (
        <div className="fixed top-18 left-1/2 z-30 w-max -translate-x-1/2 rounded-lg bg-white px-4 py-3 shadow-[4px_4px_12px_0px_rgba(0,0,0,0.2)]">
          <p className="text-body-9 whitespace-nowrap text-black">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

export default AddressListPage;
