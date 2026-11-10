import { createContext, useContext } from 'react';

type SessionUser = {
  id: string;
  fullName?: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
} | null;

const SessionUserContext = createContext<SessionUser>(null);
const useSessionUser = () => useContext(SessionUserContext);
export { SessionUserContext, useSessionUser };
export type { SessionUser };

function isPublishableKey(key: string): boolean {
  if (!key.startsWith('pk_test_') && !key.startsWith('pk_live_')) return false;
  const encoded = key.split('_')[2];
  if (!encoded) return false;
  try {
    const decoded = atob(encoded);
    return decoded.endsWith('$') && !decoded.slice(0, -1).includes('$') && decoded.includes('.');
  } catch {
    return false;
  }
}
export { isPublishableKey };
