import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export type StatusPopupProps = {
  open: boolean;
  message: string;
  isError?: boolean;
  title?: string;
  onClose: () => void;
};

export function StatusPopup({
  open,
  message,
  isError = false,
  title,
  onClose,
}: StatusPopupProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const heading = title ?? (isError ? 'Something went wrong' : 'Success');

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-[#142a3d]/45 p-4"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role={isError ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="status-popup-title"
        aria-describedby="status-popup-message"
        className="relative w-full max-w-md rounded-2xl border border-[#d2dfe3] bg-white p-6 pt-7 shadow-xl"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full border border-[#d2dfe3] bg-white text-[#40596b] shadow-sm hover:bg-[#f4f8f8]"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
              isError ? 'bg-[#fdecec] text-[#922f27]' : 'bg-[#dcece8] text-[#095e55]'
            }`}
            aria-hidden="true"
          >
            {isError ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="status-popup-title" className="text-lg font-bold text-[#142a3d]">
              {heading}
            </h2>
            <p id="status-popup-message" className="mt-1.5 text-sm leading-relaxed text-[#64748b]">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
