
'use client';

import { useState, useEffect } from 'react';
import { Activity, Database, Server, Clock } from 'lucide-react';

interface HealthDetails {
    telegramBotStatus?: 'up' | 'down' | 'warning';
    telegramChannelStatus?: 'up' | 'down' | 'warning';
    cdnStatus?: 'up' | 'down' | 'warning';
    dbStatus?: 'up' | 'down' | 'warning';
    cacheStatus?: 'up' | 'down' | 'warning';
    uptime?: number;
    lastChecked?: string;
    errorMessages?: string[];
}

interface HealthData {
    status: 'healthy' | 'degraded' | 'unhealthy' | string;
    timestamp: string;
    database: string;
    system: {
        uptime: number;
        memory: {
            rss: string;
            heapTotal: string;
            heapUsed: string;
        };
        version: string;
    };
    healthDetails?: HealthDetails | null;
}

export default function AdminHealthPage() {
    const [data, setData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/health');
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="h-10 w-10 border-4 border-[#0110FC]/30 border-t-[#0110FC] rounded-full animate-spin" />
        </div>
    );
    if (!data) return <div className="text-red-500">Failed to load system health</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="h-6 w-6 text-[#0110FC]" style={{ filter: 'drop-shadow(0 0 10px rgba(1, 16, 252, 0.6))' }} /> System Health
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                    title="Status"
                    value={data.status.toUpperCase()}
                    icon={Activity}
                    color={data.status === 'healthy' ? 'text-emerald-400' : data.status === 'degraded' ? 'text-amber-400' : 'text-red-400'}
                    glowColor={data.status === 'healthy' ? 'rgba(16,185,129,0.3)' : data.status === 'degraded' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}
                />
                <Card
                    title="Database"
                    value={data.database.toUpperCase()}
                    icon={Database}
                    color={data.database === 'connected' ? 'text-emerald-400' : 'text-red-400'}
                    glowColor={data.database === 'connected' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}
                />
                <Card
                    title="Uptime"
                    value={formatUptime(data.system.uptime)}
                    icon={Clock}
                    color="text-[#0110FC]"
                    glowColor="rgba(1,16,252,0.3)"
                />
                <Card
                    title="Node Version"
                    value={data.system.version}
                    icon={Server}
                    color="text-[#4D6AFF]"
                    glowColor="rgba(77,106,255,0.3)"
                />
            </div>

            <div className="bg-[#000439]/60 backdrop-blur-xl border border-[#0110FC]/20 rounded-xl p-6">
                <h2 className="text-lg font-medium text-white mb-4">Memory Usage</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <MemoryStat label="RSS" value={data.system.memory.rss} />
                    <MemoryStat label="Heap Total" value={data.system.memory.heapTotal} />
                    <MemoryStat label="Heap Used" value={data.system.memory.heapUsed} />
                </div>

                {/* Show detailed subsystem statuses if available */}
                {data.healthDetails && (
                    <div className="mt-6">
                        <h3 className="text-sm text-[#8B9EFF] mb-3">Subsystem Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <HealthIndicator label="Telegram Bot" status={data.healthDetails.telegramBotStatus || 'up'} />
                            <HealthIndicator label="Telegram Channel" status={data.healthDetails.telegramChannelStatus || 'up'} />
                            <HealthIndicator label="CDN" status={data.healthDetails.cdnStatus || 'up'} />
                            <HealthIndicator label="Database (Check)" status={data.healthDetails.dbStatus || (data.database === 'connected' ? 'up' : 'down')} />
                            <HealthIndicator label="Cache" status={data.healthDetails.cacheStatus || 'up'} />
                        </div>
                        {data.healthDetails.errorMessages && data.healthDetails.errorMessages.length > 0 && (
                            <div className="mt-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <strong>Errors:</strong>
                                <ul className="list-disc ml-5 mt-1">
                                    {data.healthDetails.errorMessages.map((m, i) => <li key={i}>{m}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-[#000439]/60 backdrop-blur-xl border border-[#0110FC]/20 rounded-xl p-6">
                <h2 className="text-lg font-medium text-white mb-4">Environment</h2>
                <div className="text-sm text-[#8B9EFF] font-mono">
                    <p>Last Updated: {new Date(data.timestamp).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon: Icon, color, glowColor }: any) {
    return (
        <div className="bg-[#000439]/60 backdrop-blur-xl border border-[#0110FC]/20 rounded-xl p-6 hover:scale-[1.02] transition-transform" style={{ boxShadow: `0 0 20px ${glowColor}` }}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#8B9EFF]">{title}</span>
                <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </div>
    );
}

function MemoryStat({ label, value }: any) {
    return (
        <div className="flex flex-col">
            <span className="text-sm text-[#8B9EFF] mb-1">{label}</span>
            <span className="text-xl font-mono text-white">{value}</span>
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
