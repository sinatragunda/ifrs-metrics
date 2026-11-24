import { useEffect, type ReactNode } from 'react';
import { SignIn, SignUp, useAuth, useClerk, useUser } from '@clerk/react';
import { Show } from '@clerk/react';
import { Link, Redirect, useSearch } from 'wouter';
import IfrsMetrics from '@/pages/IfrsMetrics';
import { basePath } from '@/auth/clerk-config';
import { SessionUserContext, type SessionUser } from '@/auth/session';
import { httpService } from '@/lib/http-service';
import { readInvitationMember } from '@/lib/workspace-members';

export function HomeRedirect() {
  return <><Show when="signed-in"><Redirect to="/workspace"/></Show><Show when="signed-out"><IfrsMetrics/></Show></>;
}

function authRedirectUrl() {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo');
  if (returnTo === '/checkout') return `${basePath}/checkout`;
  return `${basePath}/workspace`;
}

export function SignInPage() {
  const redirect = authRedirectUrl();
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[#eef4f6] px-4"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} forceRedirectUrl={redirect} signUpForceRedirectUrl={redirect}/></div>;
}

export function SignUpPage() {
  const search = useSearch();
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const redirect = authRedirectUrl();
  const params = new URLSearchParams(search);
  const unsafeParams = params.get('unsafe-metadata');
  const unsafeMetadata: SignUpUnsafeMetadata = unsafeParams ? JSON.parse(unsafeParams) : {};
  const fromInvitation = params.get('fromInvitation') === '1';
  const invitation = readInvitationMember();
  const emailFromQuery = params.get('email')?.trim() || '';
  const emailAddress = invitation?.email || emailFromQuery || undefined;

  useEffect(() => {
    if (!isLoaded || !fromInvitation || !isSignedIn) return;
    // Clerk refuses to render <SignUp /> while signed in and sends users to Home (/workspace).
    // Invitation accept needs a fresh sign-up for the invited email.
    const next = new URLSearchParams({ fromInvitation: '1' });
    if (emailAddress) next.set('email', emailAddress);
    void signOut({ redirectUrl: `${window.location.origin}${basePath}/sign-up?${next}` });
  }, [isLoaded, fromInvitation, isSignedIn, signOut, emailAddress]);

  if (!isLoaded || (fromInvitation && isSignedIn)) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#eef4f6] px-4">
        <p className="text-sm text-[#64748b]">
          {fromInvitation && isSignedIn ? 'Signing out so you can create the invited account…' : 'Loading…'}
        </p>
      </div>
    );
  }

  if (isSignedIn) {
    return <Redirect to="/workspace" />;
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#eef4f6] px-4">
      <SignUp
        key={emailAddress || 'sign-up'}
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        forceRedirectUrl={redirect}
        unsafeMetadata={ unsafeMetadata }
        signInForceRedirectUrl={redirect}
        initialValues={emailAddress ? { emailAddress } : undefined}
      />
    </div>
  );
}

export function ClerkSessionBridge({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    httpService.setTokenGetter(() => getToken());
    return () => httpService.setTokenGetter(null);
  }, [getToken]);

  const sessionUser: SessionUser = user
    ? {
        id: user.id,
        fullName: user.fullName,
        primaryEmailAddress: user.primaryEmailAddress
          ? { emailAddress: user.primaryEmailAddress.emailAddress }
          : null,
      }
    : null;
  return <SessionUserContext.Provider value={sessionUser}>{children}</SessionUserContext.Provider>;
}

export function ClerkSetupPage() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#eef4f6] px-4">
      <div className="max-w-md rounded-xl bg-white p-7 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-[#142a3d]">Clerk keys required</h1>
        <p className="mt-2 text-sm text-[#64748b]">
          Add a real <code>pk_test_...</code> publishable key and matching secret key to the package <code>.env</code> files, then restart the apps.
        </p>
        <Link href="/" className="mt-5 inline-flex rounded-md bg-[#147b69] px-4 py-2 text-sm font-semibold text-white">Back to home</Link>
      </div>
    </main>
  );
}
