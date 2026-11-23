import { useEffect, useState } from 'react';
import { StatusPopup } from '@/components/StatusPopup';
import {
  clearStatusPopup,
  subscribeStatusPopup,
  type StatusPopupNotice,
} from '@/lib/status-popup-store';

/** Mount once near the app root to render pluggable status popups. */
export function StatusPopupHost() {
  const [notice, setNotice] = useState<StatusPopupNotice | null>(null);

  useEffect(() => subscribeStatusPopup(setNotice), []);

  return (
    <StatusPopup
      open={Boolean(notice)}
      message={notice?.message ?? ''}
      isError={notice?.isError}
      title={notice?.title}
      onClose={clearStatusPopup}
    />
  );
}
