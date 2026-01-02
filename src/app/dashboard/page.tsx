'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Upload, ArrowUpRight, Activity, Image, Zap, Shield, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import TestingPlanToggle from '@/components/dashboard/TestingPlanToggle';

interface RecentImage {
    id: string;
    name: string;
    size: string;
    time: string;
    type: string;
}

interface StatsData {
    totalFiles: number;
    plan: string;
    maxImages: number;
    recentImages: RecentImage[];
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<StatsData>({
        totalFiles: 0,
        plan: 'free',
        maxImages: 100,
        recentImages: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        }

        if (session) {
            fetchStats();
        }
    }, [session]);

    const statCards = [
        {
            name: 'Total Uploads',
            value: stats.totalFiles.toLocaleString(),
            subtitle: loading ? 'Loading...' : `${stats.totalFiles} images`,
            icon: Upload,
            gradient: 'from-[#1da1f2] to-[#1c9cf0]',
            borderColor: 'border-[#1da1f2]/20 hover:border-[#1da1f2]/40'
        },
        {
            name: 'Images Uploaded',
            value: stats.totalFiles.toLocaleString(),
            subtitle: `${stats.totalFiles} / ${stats.maxImages.toLocaleString()}`,
            icon: Image,
            gradient: 'from-[#1c9cf0] to-[#00b8d4]',
            borderColor: 'border-[#1c9cf0]/20 hover:border-[#1c9cf0]/40'
        },
        {
            name: 'Plan',
            value: stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1),
            subtitle: 'Active subscription',
            icon: Shield,
            gradient: 'from-[#f7b928] to-[#f59e0b]',
            borderColor: 'border-[#f7b928]/20 hover:border-[#f7b928]/40'
        },
        {
            name: 'API Status',
            value: 'Active',
            subtitle: '99.9% uptime',
            icon: Zap,
            gradient: 'from-emerald-500 to-emerald-600',
            borderColor: 'border-emerald-500/20 hover:border-emerald-500/40'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white font-display mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1da1f2] via-[#1c9cf0] to-[#00b8d4]">{session?.user?.name || 'User'}</span>
                    </h1>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.name}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}

                        className={`group relative overflow-hidden rounded-2xl bg-card backdrop-blur-xl p-6 border ${card.borderColor} transition-all duration-300 hover:shadow-[0_0_25px_rgba(29,161,242,0.2)]`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                                <card.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-1">{card.name}</p>
                                <p className="text-3xl font-extrabold text-white mb-1">{card.value}</p>
                                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Quick Actions */}
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-card backdrop-blur-xl rounded-3xl border border-border p-8 shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500"
                >
                    <h2 className="text-xl font-semibold text-white mb-6 font-display">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <Link href="/dashboard/upload">
                            <div className="group flex items-center justify-between gap-4 p-4 rounded-lg bg-gradient-to-r from-[#1da1f2] to-[#1c9cf0] hover:shadow-[0_0_30px_rgba(29,161,242,0.4)] transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-md bg-white/10 backdrop-blur-sm border border-white/20"><Upload className="h-5 w-5 text-white" /></div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Upload New Image</div>
                                        <div className="text-xs text-white/70">Quickly add an image to your library</div>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </div>
                        </Link>

                        <Link href="/dashboard/api-keys">
                            <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-card border border-border hover:border-[#1da1f2]/40 hover:bg-[#0a0a0a] transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors"><Database className="h-5 w-5 text-amber-400" /></div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Manage API Keys</div>
                                        <div className="text-xs text-muted-foreground">Create or revoke keys</div>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
                            </div>
                        </Link>

                        <Link href="/dashboard/plans">
                            <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-card border border-border hover:border-[#1da1f2]/40 hover:bg-[#0a0a0a] transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors"><Shield className="h-5 w-5 text-emerald-400" /></div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Manage Plan</div>
                                        <div className="text-xs text-muted-foreground">Upgrade or view billing</div>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />
                            </div>
                        </Link>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-card backdrop-blur-xl rounded-3xl border border-border p-8 shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white font-display">Recent Activity</h2>
                        <Link href="/dashboard/images">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white transition-colors">
                                View All
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-8 w-8 border-4 border-[#1da1f2]/30 border-t-[#1da1f2] rounded-full animate-spin" />
                            </div>
                        ) : stats.recentImages.length === 0 ? (
                            <div className="text-center py-8 bg-card/30 rounded-xl border border-border">
                                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-foreground">No images uploaded yet</p>
                                <p className="text-muted-foreground text-sm mt-1">Upload your first image to get started</p>
                            </div>
                        ) : (
                            stats.recentImages.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-[#1da1f2]/30 hover:bg-[#0a0a0a] transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden group-hover:border-[#1da1f2]/40 transition-colors relative">
                                            {/* Attempt to show small thumbnail if available */}
                                            <img src={`/api/cdn/${item.id}?size=small`} alt="thumb" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Image size={18} className="text-muted-foreground group-hover:text-[#1da1f2] transition-colors" /></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white group-hover:text-[#1da1f2] transition-colors">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.time} • {item.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground bg-[#1da1f2]/10 px-2 py-1 rounded border border-[#1da1f2]/20">{item.type.split('/')[1]?.toUpperCase() || 'IMG'}</span>
                                        <Link href={`/view/${item.id}`}>
                                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white hover:bg-[#1da1f2]/10">View</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Testing Panel - Remove before production */}
            <TestingPlanToggle />
        </div>
    );
}
