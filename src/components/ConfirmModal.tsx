function ConfirmModal({
  open,
  message,
  confirmLabel = '삭제',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onCancel}
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative w-72 rounded-xl bg-white p-5">
        <p className="text-body-7 mb-4 text-center text-black">{message}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-body-9 flex-1 rounded border border-gray-200 py-2.5 font-semibold text-black"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-body-9 bg-primary-200 flex-1 rounded py-2.5 font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
