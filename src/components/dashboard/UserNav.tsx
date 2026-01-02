'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';

export const UserNav = () => {
    const { data: session } = useSession();
    const [plan, setPlan] = useState('free');

    useEffect(() => {
        if (session?.user) {
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => {
                    if (data.plan) {
                        setPlan(data.plan);
                    }
                })
                .catch(err => console.error('Failed to load plan:', err));
        }
    }, [session]);

    return (
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white">
                    {session?.user?.name || 'User'}
                </span>
                <span className="text-xs text-[#72767a]">
                    {plan.toUpperCase()}
                </span>
            </div>
            {session?.user?.image ? (
                <img
                    src={session.user.image}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full ring-2 ring-[#242628]"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1da1f2] to-[#1c9cf0] ring-2 ring-[#242628]" />
            )}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-[#72767a] hover:text-red-400"
            >
                Sign out
            </Button>
        </div>
    );
};
