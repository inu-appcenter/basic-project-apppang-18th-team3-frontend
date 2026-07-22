import { X } from 'lucide-react';

function Toast({
  message,
  onClose,
  tone = 'default',
}: {
  message: string | null;
  onClose: () => void;
  tone?: 'default' | 'error';
}) {
  if (!message) return null;
  return (
    <div className="fixed top-18 left-1/2 z-30 flex w-max -translate-x-1/2 items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-[4px_4px_12px_0px_rgba(0,0,0,0.2)]">
      <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0">
        <X size={12} className="text-gray-300" />
      </button>
      <p
        className={`text-body-9 whitespace-nowrap ${tone === 'error' ? 'text-red-300' : 'text-black'}`}
      >
        {message}
      </p>
    </div>
  );
}

export default Toast;
