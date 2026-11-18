import { LogOut, UserRound } from 'lucide-react';
import { useClerk } from '@clerk/react';
import { Link, useLocation } from 'wouter';
import { useSessionUser } from '@/auth/session';
import { basePath, clerkEnabled } from '@/auth/clerk-config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UserAccountMenuProps = {
  triggerClassName?: string;
  align?: 'start' | 'center' | 'end';
};

function SignOutMenuItem() {
  const { signOut } = useClerk();
  return (
    <DropdownMenuItem
      className="cursor-pointer gap-2 text-[#922f27] focus:bg-[#fdecec] focus:text-[#922f27]"
      onSelect={() => {
        void signOut({ redirectUrl: `${window.location.origin}${basePath}/sign-in` });
      }}
    >
      <LogOut size={14} />
      Sign out
    </DropdownMenuItem>
  );
}

export function UserAccountMenu({
  triggerClassName = 'btn-icon',
  align = 'end',
}: UserAccountMenuProps) {
  const user = useSessionUser();
  const [, setLocation] = useLocation();

  if (!user) {
    return (
      <Link href="/sign-in" title="Sign in" aria-label="Sign in" className={triggerClassName}>
        <UserRound size={16} />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" title="Account menu" aria-label="Account menu" className={triggerClassName}>
          <UserRound size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[10.5rem] border-[#d2dfe3] bg-white text-[#142a3d]">
        <DropdownMenuItem
          className="cursor-pointer gap-2 focus:bg-[#f4f8f8] focus:text-[#142a3d]"
          onSelect={() => setLocation('/account')}
        >
          <UserRound size={14} />
          View Account
        </DropdownMenuItem>
        {clerkEnabled ? <SignOutMenuItem /> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
