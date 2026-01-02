'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
    TrendingUp,
    Image as ImageIcon,
    Eye,
    HardDrive,
    Activity,
    BarChart3,
    Crown,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
    overview: {
        totalImages: number;
        totalViews: number;
        totalSize: number;
        avgUploadsPerDay: number;
        avgViewsPerImage: number;
    };
    timeline: Array<{
        date: string;
        uploads: number;
        views: number;
    }>;
    imagesByType: { [key: string]: number };
    topImages: Array<{
        id: string;
        views: number;
        createdAt: string;
        size: number;
    }>;
    dateRange: {
        start: string;
        end: string;
        days: number;
    };
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [requiresUpgrade, setRequiresUpgrade] = useState(false);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/analytics?days=${timeRange}`);
            setAnalytics(res.data.analytics);
            setRequiresUpgrade(false);
        } catch (error: any) {
            if (error.response?.data?.requiresUpgrade) {
                setRequiresUpgrade(true);
            }
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-[#1da1f2] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (requiresUpgrade) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
                    <Crown className="h-16 w-16 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Analytics Requires Pro</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    Unlock powerful insights about your images with detailed analytics.
                    Upgrade to Pro or Enterprise to access this feature.
                </p>
                <Link
                    href="/dashboard/plans"
                    className="px-8 py-3 bg-gradient-to-r from-[#1da1f2] to-[#1a8cd8] hover:from-[#1a8cd8] hover:to-[#1777bd] rounded-xl font-semibold text-white transition-all hover:scale-105 shadow-lg shadow-[#1da1f2]/20"
                >
                    Upgrade to Pro
                </Link>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                No analytics data available
            </div>
        );
    }

    const maxUploads = Math.max(...analytics.timeline.map(d => d.uploads), 1);
    const maxViews = Math.max(...analytics.timeline.map(d => d.views), 1);

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-display tracking-tight">Analytics</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {formatDate(analytics.dateRange.start)} - {formatDate(analytics.dateRange.end)}
                    </p>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setTimeRange(days)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timeRange === days
                                    ? 'bg-white text-black'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {days}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    icon={ImageIcon}
                    label="Total Images"
                    value={analytics.overview.totalImages.toLocaleString()}
                    color="blue"
                />
                <StatCard
                    icon={Eye}
                    label="Total Views"
                    value={analytics.overview.totalViews.toLocaleString()}
                    color="purple"
                />
                <StatCard
                    icon={HardDrive}
                    label="Storage Used"
                    value={formatBytes(analytics.overview.totalSize)}
                    color="cyan"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg Uploads/Day"
                    value={analytics.overview.avgUploadsPerDay.toFixed(1)}
                    color="green"
                />
                <StatCard
                    icon={Activity}
                    label="Avg Views/Image"
                    value={analytics.overview.avgViewsPerImage.toFixed(1)}
                    color="orange"
                />
            </div>

            {/* Timeline Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Uploads Timeline */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="h-5 w-5 text-[#1da1f2]" />
                        <h2 className="text-lg font-semibold text-white">Upload Activity</h2>
                    </div>
                    <div className="h-64 flex items-end gap-1">
                        {analytics.timeline.map((data, i) => {
                            const height = (data.uploads / maxUploads) * 100;
                            return (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className="w-full bg-gradient-to-t from-[#1da1f2] to-[#1da1f2]/50 rounded-t transition-all hover:from-[#1da1f2] hover:to-[#1da1f2]"
                                        style={{ height: `${Math.max(height, 2)}%` }}
                                    />
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {formatDate(data.date)}: {data.uploads} uploads
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-3">
                        <span>{formatDate(analytics.timeline[0]?.date)}</span>
                        <span>{formatDate(analytics.timeline[analytics.timeline.length - 1]?.date)}</span>
                    </div>
                </div>

                {/* Views Timeline */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Eye className="h-5 w-5 text-purple-400" />
                        <h2 className="text-lg font-semibold text-white">View Activity</h2>
                    </div>
                    <div className="h-64 flex items-end gap-1">
                        {analytics.timeline.map((data, i) => {
                            const height = (data.views / maxViews) * 100;
                            return (
                                <div key={i} className="flex-1 group relative">
                                    <div
                                        className="w-full bg-gradient-to-t from-purple-500 to-purple-500/50 rounded-t transition-all hover:from-purple-500 hover:to-purple-500"
                                        style={{ height: `${Math.max(height, 2)}%` }}
                                    />
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {formatDate(data.date)}: {data.views} views
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-3">
                        <span>{formatDate(analytics.timeline[0]?.date)}</span>
                        <span>{formatDate(analytics.timeline[analytics.timeline.length - 1]?.date)}</span>
                    </div>
                </div>
            </div>

            {/* Image Types & Top Performing */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Image Types Distribution */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Image Types</h2>
                    <div className="space-y-3">
                        {Object.entries(analytics.imagesByType).map(([type, count]) => {
                            const percentage = (count / analytics.overview.totalImages) * 100;
                            return (
                                <div key={type}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300 capitalize">{type}</span>
                                        <span className="text-gray-400">{count} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#1da1f2] to-purple-500 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Performing Images */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Top Performing Images</h2>
                    <div className="space-y-2">
                        {analytics.topImages.slice(0, 5).map((img, index) => (
                            <Link
                                key={img.id}
                                href={`/view/${img.id}`}
                                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-[#1da1f2] to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <div className="text-sm text-white font-medium">
                                            {img.views.toLocaleString()} views
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {formatBytes(img.size)} • {formatDate(img.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: {
    icon: any;
    label: string;
    value: string;
    color: string;
}) {
    const colors = {
        blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400',
        purple: 'from-purple-500/20 to-pink-500/20 text-purple-400',
        cyan: 'from-cyan-500/20 to-blue-500/20 text-cyan-400',
        green: 'from-green-500/20 to-emerald-500/20 text-green-400',
        orange: 'from-orange-500/20 to-red-500/20 text-orange-400',
    };

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
            <div className={`inline-flex p-2 bg-gradient-to-br ${colors[color as keyof typeof colors].split(' ').slice(0, 2).join(' ')} rounded-lg mb-3`}>
                <Icon className={`h-5 w-5 ${colors[color as keyof typeof colors].split(' ')[2]}`} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
        </div>
    );
}
