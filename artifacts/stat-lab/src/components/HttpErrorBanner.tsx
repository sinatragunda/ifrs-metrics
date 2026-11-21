import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { clearHttpError, subscribeHttpError, type HttpErrorNotice } from '@/lib/http-error-store';

const AUTO_DISMISS_MS = 60_000;

export function HttpErrorBanner() {
  const [notice, setNotice] = useState<HttpErrorNotice | null>(null);

  useEffect(() => subscribeHttpError(setNotice), []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => clearHttpError(), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [notice?.id]);

  if (!notice) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-[100] border-b border-[#f1b4ae] bg-[#fdecec] text-[#922f27]"
    >
      <div className="mx-auto flex max-w-[1500px] items-start gap-3 px-4 py-3 md:px-8">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Request failed{notice.status ? ` · ${notice.status}` : ''}</p>
          <p className="mt-0.5 break-words text-sm">{notice.message}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss error"
          onClick={clearHttpError}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#922f27] hover:bg-[#f8d4d0]"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
