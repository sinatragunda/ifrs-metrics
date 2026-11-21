import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { subscribeHttpLoading } from '@/lib/http-loading-store';

export function HttpLoadingOverlay() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => subscribeHttpLoading(setPendingCount), []);

  if (pendingCount <= 0) return null;

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-[#142a3d]/25 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="grid place-items-center rounded-2xl border border-[#d2dfe3] bg-white px-6 py-5 shadow-lg">
        <Spinner className="size-8 text-[#147b69]" />
        <p className="mt-3 text-sm font-medium text-[#40596b]">Working…</p>
      </div>
    </div>
  );
}
