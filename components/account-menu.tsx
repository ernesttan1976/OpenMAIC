'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, UserRound } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AccountMenuProps {
  readonly user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

function userInitials(name: string | null, email: string): string {
  const words = (name || email).trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function AccountMenu({ user }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const displayName = user.name || user.email;

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const response = await fetch('/api/auth/signout', { method: 'POST' });
      if (!response.ok) throw new Error('Unable to sign out');
      window.location.assign('/');
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="fixed top-4 right-4 z-[60] flex size-10 items-center justify-center rounded-full border border-gray-100/70 bg-white/70 shadow-sm backdrop-blur-md transition-colors hover:bg-white dark:border-gray-700/70 dark:bg-gray-800/70 dark:hover:bg-gray-800"
          aria-label="Open account menu"
          aria-expanded={open}
        >
          <Avatar className="size-8">
            {user.image && <AvatarImage src={user.image} alt="" referrerPolicy="no-referrer" />}
            <AvatarFallback>{userInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="z-[60] w-72 p-0">
        <div className="flex items-center gap-3 p-4">
          <Avatar size="lg">
            {user.image && <AvatarImage src={user.image} alt="" referrerPolicy="no-referrer" />}
            <AvatarFallback>{userInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="border-t p-1.5">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <UserRound className="size-4" />
            Profile
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut className="size-4" />
            {signingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
