import { useEffect, useState } from 'react';
import { useSearch } from 'wouter';
import { basePath } from '@/auth/clerk-config';
import { httpService } from '@/lib/http-service';
import {
  parseWorkspaceMember,
  storeInvitationMember,
} from '@/lib/workspace-members';

function invitationSignUpUrl(email?: string ,unsafeMetadata? : SignUpUnsafeMetadata) {
  const params = new URLSearchParams({ fromInvitation: '1' });
  if (email) {
      params.set('email', email);
  }
  if(unsafeMetadata)params.set('unsafe_metadata',JSON.stringify(unsafeMetadata));

  params.set('returnTo','sign-up-complete');

  alert("params set "+params);

  return `${window.location.origin}${basePath}/sign-up?${params}`;
}

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
      .then((res :any) => {
        if (cancelled) return;

        alert(JSON.stringify(res));

        const member = parseWorkspaceMember(res);
        if (member) storeInvitationMember(member);

        setStatus('success');
        setMessage('Invitation confirmed. Redirecting to sign up…');

        // Full navigation so Clerk remounts SignUp with invitation initialValues
        // (SPA setLocation was bouncing signed-in sessions to /workspace).
        const unsafeMetadata = {
            'post-event':'workspace_membership_join',
            'invitation_id' : res.get('invitation_id'),
        };

        window.location.assign(invitationSignUpUrl(member?.email?.trim() ,unsafeMetadata));
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
        <p
          className={`mt-3 text-sm ${
            status === 'error' ? 'text-[#922f27]' : status === 'success' ? 'text-[#095e55]' : 'text-[#64748b]'
          }`}
          role="status"
        >
          {message}
        </p>
      </div>
    </main>
  );
}
