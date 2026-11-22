import { useEffect, useState } from 'react';
import { useSearch } from 'wouter';
import { httpService } from '@/lib/http-service';

export function ConfirmInvitationPage() {
  const search = useSearch();
  const token = new URLSearchParams(search).get('token')?.trim() || '';
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>(
    token ? 'pending' : 'error',
  );
  const [message, setMessage] = useState(
    token ? 'Confirming invitation…' : 'Missing invitation token.',
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setStatus('pending');
    setMessage('Confirming invitation…');

    httpService
      .post('/confirm_invitation', { token })
      .then(() => {
        if (cancelled) return;
        setStatus('success');
        setMessage('Invitation confirmed.');
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Could not confirm invitation.');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#eef4f6] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#d2dfe3] bg-white p-6 text-center shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#147b69]">Invitation</p>
        <h1 className="mt-2 text-xl font-bold text-[#142a3d]">Confirm invitation</h1>
          {status === 'success' ? (
              <Signup email_address="rooms@gmail.com" />
          ) : (
              <p
                  className={`mt-3 text-sm ${
                      status === 'error' ? 'text-[#922f27]' : 'text-[#64748b]'
                  }`}
                  role="status"
              >
                  {message}
              </p>
          )}
      </div>
    </main>
  );
}
