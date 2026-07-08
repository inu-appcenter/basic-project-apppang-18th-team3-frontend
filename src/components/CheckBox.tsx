import { Check } from 'lucide-react';

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
        checked ? 'border-primary-200 bg-primary-200' : 'border-gray-200 bg-white'
      }`}
    >
      {checked && <Check size={13} strokeWidth={2.5} className="text-white" />}
    </span>
  );
}

export default CheckBox;
