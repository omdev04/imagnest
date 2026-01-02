'use client';

import { Mail, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BannedPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (session?.user) {
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => {
                    if (data.status !== 'banned') {
                        router.push('/dashboard');
                    } else {
                        setVerifying(false);
                    }
                })
                .catch(() => {
                    setVerifying(false);
                });
        }
    }, [session, status, router]);

    if (status === 'loading' || verifying) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md">
                {/* Main Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8 text-center">
                    {/* Logo & Name */}
                    <div className="flex justify-center mb-6 sm:mb-8">
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 sm:p-3">
                                <Image
                                    src="/logo/only_logo_icon.png"
                                    alt="Imagnest"
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-white/90 tracking-tight">Imagnest</h2>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                        Account Suspended
                    </h1>

                    {/* Message */}
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 px-2">
                        Your account has been suspended for violating our terms of service.
                        You can no longer access the dashboard or upload images.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href="mailto:support@imagnest.com"
                            className="w-full px-6 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 rounded-xl font-medium text-sm sm:text-base text-white transition-all flex items-center justify-center gap-2 touch-manipulation"
                        >
                            <Mail className="h-4 w-4" />
                            Contact Support
                        </Link>

                        <Link
                            href="/"
                            className="w-full px-6 py-3 sm:py-3.5 bg-white hover:bg-white/90 active:bg-white/80 rounded-xl font-medium text-sm sm:text-base text-black transition-all flex items-center justify-center gap-2 touch-manipulation"
                        >
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>

                    {/* Footer */}
                    <p className="text-xs text-gray-600 mt-6 px-2">
                        If you believe this is a mistake, contact support.
                    </p>
                </div>
            </div>
        </div>
    );
}
