'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { UserNav } from '@/components/dashboard/UserNav';
import { PLANS } from '@/config/plans';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ToastProvider } from '@/contexts/ToastContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [plan, setPlan] = useState('free');
    const [warnings, setWarnings] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningDismissed, setWarningDismissed] = useState(false);
    const [usage, setUsage] = useState({
        storageUsed: 0,
        totalImages: 0,
        maxImages: 100
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }

        if (session?.user) {
            // Fetch user data
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => {
                    // Check for ban status
                    if (data.status === 'banned') {
                        // Force logout logic or redirect
                        window.location.href = '/banned';
                        return;
                    }

                    if (data.warnings) {
                        setWarnings(data.warnings);
                        // restore dismissal state from localStorage (client-only)
                        try {
                            const dismissed = localStorage.getItem('dashboardWarningDismissed');
                            setWarningDismissed(dismissed === '1');
                        } catch (e) {
                            // ignore if unavailable
                        }
                    }

                    const userPlan = data.plan || 'free';
                    const planConfig = PLANS[userPlan as keyof typeof PLANS];

                    setPlan(userPlan);
                    setUsage({
                        storageUsed: data.usage?.storageUsed || 0,
                        totalImages: data.usage?.totalImages || 0,
                        maxImages: planConfig.limits.maxImages
                    });
                })
                .catch(err => console.error('Failed to load profile:', err));
        }
    }, [session, status]);

    if (status === 'loading') {
        return <div className="h-screen w-screen bg-[#000000] flex items-center justify-center">
            <div className="text-white">Loading...</div>
        </div>;
    }

    return (
        <ToastProvider>
            <div className="h-full bg-[#000000]">
                {/* Mobile menu backdrop */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile sidebar */}
                <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                    {/* @ts-ignore */}
                    <Sidebar plan={plan} usage={usage} />
                </div>

                {/* Desktop sidebar */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                    {/* @ts-ignore */}
                    <Sidebar plan={plan} usage={usage} />
                </div>

                <div className="lg:pl-64 h-full min-h-screen flex flex-col">
                    <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-[#242628] bg-[#000000]/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                        {/* Mobile menu button */}
                        <button
                            type="button"
                            className="lg:hidden -m-2.5 p-2.5 text-gray-400 hover:text-white"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
                            {warnings > 0 && !warningDismissed && (
                                <div className="hidden sm:flex items-center mr-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowWarningModal(true)}
                                        className="flex items-center gap-3 px-3 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 hover:bg-yellow-500/15"
                                        aria-label="Account warnings"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-yellow-400">
                                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                            <path d="M12 9v4" />
                                            <path d="M12 17h.01" />
                                        </svg>
                                        <div className="text-xs text-left">
                                            <div className="font-semibold">Account Warning</div>
                                            <div className="text-[11px] text-yellow-200/80">{warnings} warning{warnings > 1 ? 's' : ''}</div>
                                        </div>
                                    </button>
                                </div>
                            )}
                            <UserNav />
                        </div>
                    </header>

                    <main className="py-8">
                        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">

                            {children}

                            {/* Warning Modal */}
                            {showWarningModal && (
                                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-[#0A0E1A] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-yellow-500/10 rounded text-yellow-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white mb-2">Account Warning</h3>
                                                <p className="text-sm text-yellow-200/80 mb-4">You have received {warnings} official warning{warnings > 1 ? 's' : ''} from the administration. Please review our terms of service to avoid account suspension. If you need help, contact support.</p>

                                                <div className="flex justify-end gap-3">
                                                    <a href="/terms" className="px-3 py-2 text-sm text-gray-300 hover:text-white">View Terms</a>
                                                    <button
                                                        onClick={() => {
                                                            try { localStorage.setItem('dashboardWarningDismissed', '1'); } catch (e) { }
                                                            setWarningDismissed(true);
                                                            setShowWarningModal(false);
                                                        }}
                                                        className="px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20"
                                                    >
                                                        Dismiss
                                                    </button>
                                                    <button
                                                        onClick={() => setShowWarningModal(false)}
                                                        className="px-3 py-2 text-sm text-gray-400 hover:text-white"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}
