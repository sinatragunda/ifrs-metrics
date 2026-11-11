import type { ReactNode } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/react';
import { Show } from '@clerk/react';
import { Link, Redirect } from 'wouter';
import IfrsMetrics from '@/pages/IfrsMetrics';
import { basePath } from '@/auth/clerk-config';
import { SessionUserContext, type SessionUser } from '@/auth/session';

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
  const redirect = authRedirectUrl();
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[#eef4f6] px-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} forceRedirectUrl={redirect} signInForceRedirectUrl={redirect}/></div>;
}

export function ClerkSessionBridge({ children }: { children: ReactNode }) {
  const { user } = useUser();
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
