'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Users, Image, AlertTriangle, Activity, Database, Settings, FileText, BarChart3, Radio, Bug } from 'lucide-react';
import Link from 'next/link';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Images', href: '/admin/images', icon: Image },
    { name: 'Reports', href: '/admin/reports', icon: AlertTriangle },
    { name: 'Bug Reports', href: '/admin/bugs', icon: Bug },
    { name: 'Telegram Bots', href: '/admin/telegram-bots', icon: Radio },
    { name: 'System Health', href: '/admin/health', icon: Activity },
    { name: 'Logs', href: '/admin/logs', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            // Check if user is admin
            fetch('/api/admin/verify')
                .then(async res => {
                    if (!res.ok) {
                        const json = await res.json().catch(() => ({}));
                        const msg = json.error || res.statusText;
                        console.error('Admin verification failed:', res.status, msg);
                        setErrorMsg(`${res.status}: ${msg}`);
                        setIsAdmin(false);
                        return null;
                    }
                    return res.json();
                })
                .then(data => {
                    if (data?.isAdmin) {
                        setIsAdmin(true);
                    } else {
                        if (data) {
                            console.error('User is not admin');
                            setErrorMsg('Verification passed but isAdmin is false');
                            setIsAdmin(false);
                        }
                    }
                })
                .catch(err => {
                    console.error('Admin verify error:', err);
                    setErrorMsg(err.message);
                    setIsAdmin(false);
                })
                .finally(() => setLoading(false));
        }
    }, [session, status, router]);

    if (loading || status === 'loading') {
        return (
            <div className="h-screen w-screen bg-[#000108] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-[#0110FC]/30 border-t-[#0110FC] rounded-full animate-spin" />
                    <div className="text-white text-lg">Loading Admin Panel...</div>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="h-screen w-screen bg-gradient-to-br from-[#000108] via-[#000439] to-[#000108] flex flex-col items-center justify-center text-white space-y-4">
                <Shield className="h-16 w-16 text-[#0110FC] mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(1, 16, 252, 0.6))' }} />
                <h1 className="text-3xl font-bold">Access Denied</h1>
                <p className="text-[#8B9EFF]">You do not have permission to access the admin panel.</p>
                {errorMsg && (
                    <div className="p-3 bg-red-900/20 border border-red-500/50 rounded text-red-200 font-mono text-xs">
                        Error: {errorMsg}
                    </div>
                )}
                <div className="bg-[#000439] border border-[#0110FC]/20 p-3 rounded text-sm text-[#8B9EFF] font-mono">
                    Current User: {session?.user?.email || 'Unknown'} (Role: {session?.user?.role || 'user'})
                </div>
                <div className="flex gap-4 mt-6">
                    <Link href="/dashboard" className="px-4 py-2 bg-gradient-to-r from-[#0110FC] to-[#010FCC] rounded-md hover:shadow-[0_0_30px_rgba(1,16,252,0.4)] transition-all">
                        Return to Dashboard
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="px-4 py-2 bg-red-600/20 text-red-500 border border-red-500/50 rounded-md hover:bg-red-600/30 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-br from-[#000108] via-[#000439] to-[#000108] flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#000439]/80 backdrop-blur-xl border-r border-[#0110FC]/20 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-[#0110FC]/20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-[#0110FC] to-[#010FCC] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(1,16,252,0.4)]">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">ADMIN PANEL</h1>
                            <p className="text-xs text-[#8B9EFF]">GOD MODE</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {
                        navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 p-3 rounded-lg text-[#8B9EFF] hover:bg-[#0110FC]/10 hover:text-white hover:border-[#0110FC]/30 border border-transparent transition-all group"
                            >
                                <item.icon className="h-5 w-5 group-hover:text-[#0110FC]" />
                                <span>{item.name}</span>
                            </Link>
                        ))
                    }
                </nav>

                {/* Admin Badge */}
                <div className="p-4 border-t border-[#0110FC]/20">
                    <div className="flex items-center gap-2 text-xs text-[#8B9EFF]">
                        <div className="h-2 w-2 bg-[#0110FC] rounded-full animate-pulse" />
                        <span>System Online</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
