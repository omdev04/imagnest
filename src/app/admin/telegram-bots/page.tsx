'use client';

import { useEffect, useState } from 'react';
import { Radio, Activity, AlertCircle, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';

interface BotStats {
    name: string;
    healthy: boolean;
    requestCount: number;
    errorCount: number;
    avgResponseTime: number;
    lastCheck: string;
    consecutiveFailures: number;
}

interface TelegramBotsData {
    totalBots: number;
    healthyBots: number;
    bots: BotStats[];
}

export default function TelegramBotsPage() {
    const [data, setData] = useState<TelegramBotsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchBotStats = async () => {
        try {
            const res = await fetch('/api/admin/telegram-bots');
            if (!res.ok) {
                throw new Error('Failed to fetch bot stats');
            }
            const json = await res.json();
            setData(json.stats);
            setLastUpdated(new Date());
            setError('');
        } catch (err: any) {
            console.error('Error fetching bot stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBotStats();

        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchBotStats, 10000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-[#0110FC] to-[#010FCC] rounded-lg flex items-center justify-center">
                        <Radio className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Telegram Bots Monitoring</h1>
                        <p className="text-[#8B9EFF] text-sm">Real-time bot health and performance</p>
                    </div>
                </div>

                <div className="flex items-center justify-center py-12">
                    <div className="h-12 w-12 border-4 border-[#0110FC]/30 border-t-[#0110FC] rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-[#0110FC] to-[#010FCC] rounded-lg flex items-center justify-center">
                        <Radio className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Telegram Bots Monitoring</h1>
                        <p className="text-[#8B9EFF] text-sm">Real-time bot health and performance</p>
                    </div>
                </div>

                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                    <div className="flex items-center gap-3 text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">Error Loading Bot Stats</p>
                    </div>
                    <p className="text-red-300 text-sm mt-2">{error}</p>
                    <button
                        onClick={fetchBotStats}
                        className="mt-4 px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/50 rounded-md hover:bg-red-600/30 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const getHealthColor = (healthy: boolean) => {
        return healthy ? 'text-green-400' : 'text-red-400';
    };

    const getHealthBg = (healthy: boolean) => {
        return healthy ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50';
    };

    const getHealthIcon = (healthy: boolean) => {
        return healthy ? CheckCircle : AlertCircle;
    };

    const successRate = (bot: BotStats) => {
        const total = bot.requestCount;
        if (total === 0) return 100;
        return ((total - bot.errorCount) / total * 100).toFixed(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-[#0110FC] to-[#010FCC] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(1,16,252,0.4)]">
                        <Radio className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Telegram Bots Monitoring</h1>
                        <p className="text-[#8B9EFF] text-sm">Real-time bot health and performance</p>
                    </div>
                </div>

                <button
                    onClick={fetchBotStats}
                    className="px-4 py-2 bg-[#0110FC]/20 text-[#0110FC] border border-[#0110FC]/30 rounded-md hover:bg-[#0110FC]/30 transition-all flex items-center gap-2"
                >
                    <Activity className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#000439]/60 backdrop-blur-xl border border-[#0110FC]/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#8B9EFF] text-sm">Total Bots</p>
                            <p className="text-3xl font-bold text-white mt-1">{data?.totalBots || 0}</p>
                        </div>
                        <Radio className="h-8 w-8 text-[#0110FC]" />
                    </div>
                </div>

                <div className="bg-[#000439]/60 backdrop-blur-xl border border-green-500/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#8B9EFF] text-sm">Healthy Bots</p>
                            <p className="text-3xl font-bold text-green-400 mt-1">{data?.healthyBots || 0}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-[#000439]/60 backdrop-blur-xl border border-[#0110FC]/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#8B9EFF] text-sm">Last Updated</p>
                            <p className="text-sm font-medium text-white mt-1">{lastUpdated.toLocaleTimeString()}</p>
                        </div>
                        <Clock className="h-8 w-8 text-[#0110FC]" />
                    </div>
                </div>
            </div>

            {/* System Status Alert */}
            {data && data.healthyBots < data.totalBots && (
                <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 text-yellow-400">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium">⚠️ Warning: Some bots are unhealthy!</p>
                    </div>
                    <p className="text-yellow-300 text-sm mt-2">
                        {data.totalBots - data.healthyBots} bot(s) are currently experiencing issues.
                        The system will automatically failover to healthy bots.
                    </p>
                </div>
            )}

            {/* Bot Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data?.bots.map((bot, index) => {
                    const HealthIcon = getHealthIcon(bot.healthy);

                    return (
                        <div
                            key={bot.name}
                            className={`bg-[#000439]/60 backdrop-blur-xl border rounded-lg p-6 ${bot.healthy ? 'border-green-500/20' : 'border-red-500/20'
                                }`}
                        >
                            {/* Bot Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${bot.healthy ? 'bg-green-900/20' : 'bg-red-900/20'
                                        }`}>
                                        <Radio className={`h-6 w-6 ${getHealthColor(bot.healthy)}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Bot {index + 1}</h3>
                                        <p className="text-xs text-[#8B9EFF]">{bot.name}</p>
                                    </div>
                                </div>

                                <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getHealthBg(bot.healthy)}`}>
                                    <HealthIcon className={`h-4 w-4 ${getHealthColor(bot.healthy)}`} />
                                    <span className={`text-xs font-medium ${getHealthColor(bot.healthy)}`}>
                                        {bot.healthy ? 'Healthy' : 'Unhealthy'}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Requests */}
                                <div className="bg-[#000108]/50 rounded-lg p-4 border border-[#0110FC]/10">
                                    <div className="flex items-center gap-2 text-[#8B9EFF] text-xs mb-1">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>Requests</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{bot.requestCount}</p>
                                </div>

                                {/* Errors */}
                                <div className="bg-[#000108]/50 rounded-lg p-4 border border-[#0110FC]/10">
                                    <div className="flex items-center gap-2 text-[#8B9EFF] text-xs mb-1">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>Errors</span>
                                    </div>
                                    <p className={`text-2xl font-bold ${bot.errorCount > 0 ? 'text-red-400' : 'text-white'}`}>
                                        {bot.errorCount}
                                    </p>
                                </div>

                                {/* Response Time */}
                                <div className="bg-[#000108]/50 rounded-lg p-4 border border-[#0110FC]/10">
                                    <div className="flex items-center gap-2 text-[#8B9EFF] text-xs mb-1">
                                        <Zap className="h-3 w-3" />
                                        <span>Avg Response</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{bot.avgResponseTime}ms</p>
                                </div>

                                {/* Success Rate */}
                                <div className="bg-[#000108]/50 rounded-lg p-4 border border-[#0110FC]/10">
                                    <div className="flex items-center gap-2 text-[#8B9EFF] text-xs mb-1">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>Success Rate</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-400">{successRate(bot)}%</p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-4 pt-4 border-t border-[#0110FC]/10 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#8B9EFF]">Consecutive Failures:</span>
                                    <span className={`font-medium ${bot.consecutiveFailures > 0 ? 'text-red-400' : 'text-white'}`}>
                                        {bot.consecutiveFailures}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#8B9EFF]">Last Health Check:</span>
                                    <span className="text-white font-medium">
                                        {new Date(bot.lastCheck).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>

                            {/* Warning for unhealthy bot */}
                            {!bot.healthy && (
                                <div className="mt-4 bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                                    <p className="text-red-400 text-xs flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        This bot is currently unhealthy and will not receive new requests.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* No Bots Configured */}
            {data && data.totalBots === 0 && (
                <div className="bg-[#000439]/60 backdrop-blur-xl border border-[#0110FC]/20 rounded-lg p-12 text-center">
                    <Radio className="h-16 w-16 text-[#0110FC]/50 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Telegram Bots Configured</h3>
                    <p className="text-[#8B9EFF] mb-4">
                        Configure your Telegram bot tokens in the environment variables to enable load balancing.
                    </p>
                    <div className="bg-[#000108]/50 rounded-lg p-4 text-left text-sm text-[#8B9EFF] font-mono">
                        <p>TELEGRAM_BOT_TOKEN_1=your_token_1</p>
                        <p>TELEGRAM_CHANNEL_ID_1=your_channel_1</p>
                        <p className="mt-2">TELEGRAM_BOT_TOKEN_2=your_token_2</p>
                        <p>TELEGRAM_CHANNEL_ID_2=your_channel_2</p>
                    </div>
                </div>
            )}

            {/* Auto-refresh indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#8B9EFF]">
                <div className="h-2 w-2 bg-[#0110FC] rounded-full animate-pulse" />
                <span>Auto-refreshing every 10 seconds</span>
            </div>
        </div>
    );
}
