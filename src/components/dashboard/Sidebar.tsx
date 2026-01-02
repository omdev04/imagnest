'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Image as ImageIcon,
    Upload,
    BarChart2,
    Settings,
    CreditCard,
    Key,
    Bug
} from 'lucide-react';
import { PLANS, PlanType } from '@/config/plans';

const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', href: '/dashboard/upload', icon: Upload },
    { name: 'Images', href: '/dashboard/images', icon: ImageIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Plans', href: '/dashboard/plans', icon: CreditCard },
    { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
    { name: 'Bug Report', href: '/dashboard/bug-report', icon: Bug },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

// ... imports remain same ...

interface SidebarProps {
    plan?: PlanType;
    usage?: {
        storageUsed: number;
        totalImages?: number;
        maxImages?: number;
    };
}

export const Sidebar = ({ plan = 'free', usage }: SidebarProps) => {
    const pathname = usePathname();

    // Calculate usage stats based on image count
    const currentPlan = PLANS[plan];
    const imageLimit = usage?.maxImages || currentPlan.limits.maxImages;
    const totalImages = usage?.totalImages || 0;
    const usedPercentage = Math.min(100, Math.round((totalImages / imageLimit) * 100));

    return (
        <div className="flex h-full w-64 flex-col gap-y-5 bg-[#000000] border-r border-[#242628] px-6 pb-4">
            <div className="flex h-20 shrink-0 items-center">
                <Link href="/dashboard">
                    <Image
                        src="/logo/logo.png"
                        alt="Logo"
                        width={120}
                        height={120}
                        className="transition-opacity hover:opacity-80"
                    />
                </Link>
            </div>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                isActive
                                                    ? 'bg-[#1da1f2]/10 text-[#1da1f2] border-r-2 border-[#1da1f2]'
                                                    : 'text-[#72767a] hover:text-[#e7e9ea] hover:bg-[#1da1f2]/5',
                                                'group flex gap-x-3 rounded-r-none rounded-l-lg p-3 text-sm leading-6 font-medium transition-all duration-200'
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    isActive ? 'text-[#1da1f2]' : 'text-[#72767a] group-hover:text-[#e7e9ea]',
                                                    'h-5 w-5 shrink-0 transition-colors'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                    <li className="mt-auto">
                        <div className="rounded-xl bg-black p-4 border border-[#2f3336] shadow-lg">
                            <p className="text-xs text-[#72767a] mb-2">Current Plan</p>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-white">{currentPlan.name} Plan</span>
                                <span className="text-xs text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">Active</span>
                            </div>
                            <div className="w-full bg-[#16181c] rounded-full h-1.5 mb-2 overflow-hidden border border-[#2f3336]">
                                <div
                                    className="bg-gradient-to-r from-[#1da1f2] to-[#1c9cf0] h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${usedPercentage}%` }}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-[10px] text-[#72767a]">
                                    <span>Images</span>
                                    <span>{totalImages} of {imageLimit}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-[#72767a]">
                                    <span>Usage</span>
                                    <span>{usedPercentage}%</span>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    );
};
