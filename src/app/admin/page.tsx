'use client';

import { useEffect, useState } from 'react';
import { Users, Image, AlertTriangle, Trash2, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Stats {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    suspendedUsers: number;
    totalImages: number;
    todayImages: number;
    pendingReports: number;
    deletedImages: number;
}

interface SystemHealth {
    telegramBotStatus: string;
    telegramChannelStatus: string;
    cdnStatus: string;
    dbStatus: string;
    cacheStatus: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error('Failed to fetch stats');

            const data = await res.json();
            setStats(data.stats);
            setHealth(data.systemHealth);
        } catch (error) {
            showToast('Failed to load dashboard stats', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-10 w-10 border-4 border-[#0110FC]/30 border-t-[#0110FC] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-[#8B9EFF] mt-1">System overview and critical metrics</p>
            </div>

            {health && (health.telegramBotStatus === 'down' || health.cdnStatus === 'down') && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-bold">SYSTEM ALERT</span>
                    </div>
                    <p className="text-red-400 mt-2">Critical services are down. Immediate action required.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="blue" />
                <StatCard title="Active Users" value={stats?.activeUsers || 0} icon={Users} color="green" />
                <StatCard title="Total Images" value={stats?.totalImages || 0} icon={Image} color="purple" />
                <StatCard title="Today's Uploads" value={stats?.todayImages || 0} icon={TrendingUp} color="cyan" />
                <StatCard title="Pending Reports" value={stats?.pendingReports || 0} icon={AlertTriangle} color="yellow" alert={stats?.pendingReports && stats.pendingReports > 0} />
                <StatCard title="Banned Users" value={stats?.bannedUsers || 0} icon={Users} color="red" />
                <StatCard title="Suspended Users" value={stats?.suspendedUsers || 0} icon={Users} color="orange" />
                <StatCard title="Deleted Images" value={stats?.deletedImages || 0} icon={Trash2} color="gray" />
            </div>

            <div className="bg-[#000439]/60 backdrop-blur-xl border border-[#0110FC]/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#0110FC]" />
                    System Health
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <HealthIndicator label="Telegram Bot" status={health?.telegramBotStatus || 'up'} />
                    <HealthIndicator label="Telegram Channel" status={health?.telegramChannelStatus || 'up'} />
                    <HealthIndicator label="CDN" status={health?.cdnStatus || 'up'} />
                    <HealthIndicator label="Database" status={health?.dbStatus || 'up'} />
                    <HealthIndicator label="Cache" status={health?.cacheStatus || 'up'} />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, alert }: any) {
    const colors: any = {
        blue: 'bg-[#0110FC]/15 text-[#0110FC] border-[#0110FC]/30',
        green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        purple: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
        cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        red: 'bg-red-500/15 text-red-400 border-red-500/30',
        orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        gray: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
    };

    const glowColors: any = {
        blue: 'shadow-[0_0_20px_rgba(1,16,252,0.2)]',
        green: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
        purple: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',
        cyan: 'shadow-[0_0_20px_rgba(34,211,238,0.2)]',
        yellow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
        red: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
        orange: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
        gray: 'shadow-[0_0_20px_rgba(100,116,139,0.2)]'
    };

    return (
        <div className={`bg-[#000439]/60 backdrop-blur-xl border rounded-xl p-4 transition-all hover:scale-[1.02] ${alert ? 'border-amber-500/50 animate-pulse' : 'border-[#0110FC]/20'} ${glowColors[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[#8B9EFF] text-sm">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value.toLocaleString()}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${colors[color]} flex items-center justify-center border`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

function HealthIndicator({ label, status }: { label: string; status: string }) {
    const getColor = () => {
        switch (status) {
            case 'up': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]';
            case 'warning': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]';
            case 'down': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]';
            default: return 'bg-slate-500';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'up': return 'text-emerald-400';
            case 'warning': return 'text-amber-400';
            case 'down': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#000108]/50 border border-[#0110FC]/10">
            <div className={`h-3 w-3 rounded-full ${getColor()} animate-pulse`} />
            <div>
                <p className="text-sm text-white">{label}</p>
                <p className={`text-xs uppercase font-medium ${getStatusColor()}`}>{status}</p>
            </div>
        </div>
    );
}
