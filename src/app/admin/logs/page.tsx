
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, User, Download, Trash } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Log {
    _id: string;
    adminId: { username: string; email: string };
    action: string;
    targetType: string;
    details: string;
    timestamp: string;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const isFetching = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLTableRowElement>(null);
    const { showToast } = useToast();

    const fetchLogs = useCallback(async (pageNum: number, append: boolean) => {
        if (isFetching.current) return;
        isFetching.current = true;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: pageNum.toString(), limit: '20' });
            const res = await fetch(`/api/admin/logs?${params}`);
            const data = await res.json();
            if (data.logs) {
                setLogs(prev => append ? [...prev, ...data.logs] : data.logs);
                setTotalPages(data.pagination?.pages ?? 1);
                setTotalCount(data.pagination?.total ?? 0);
                setPage(pageNum);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, []);

    useEffect(() => {
        fetchLogs(1, false);
    }, [fetchLogs]);

    // Infinite scroll — use scrollContainerRef as root (admin layout scrolls inside a div)
    useEffect(() => {
        const sentinel = sentinelRef.current;
        const container = scrollContainerRef.current;
        if (!sentinel || !container) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFetching.current) {
                    setPage(current => {
                        if (current < totalPages) fetchLogs(current + 1, true);
                        return current;
                    });
                }
            },
            { root: container, rootMargin: '200px', threshold: 0 }
        );
        obs.observe(sentinel);
        return () => obs.disconnect();
    }, [totalPages, fetchLogs]);

    const handleDownload = async () => {
        try {
            const res = await fetch('/api/admin/logs?export=csv');
            if (!res.ok) { showToast('Failed to download logs', 'error'); return; }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `admin-logs-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            showToast('Logs downloaded', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to download logs', 'error');
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('Delete ALL logs? This action is irreversible. Proceed?')) return;
        try {
            const res = await fetch('/api/admin/logs', { method: 'DELETE' });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast('All logs deleted', 'success');
                setLogs([]);
                setPage(1);
                setTotalPages(1);
                setTotalCount(0);
            } else {
                showToast(data.error || 'Failed to delete logs', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to delete logs', 'error');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="h-6 w-6 text-gray-400" /> Audit Logs
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 rounded hover:bg-white/10 text-gray-300"
                    >
                        <Download className="h-4 w-4" /> Export CSV
                    </button>
                    <button
                        onClick={handleDeleteAll}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20"
                    >
                        <Trash className="h-4 w-4" /> Delete all
                    </button>
                </div>
            </div>

            {/* Scrollable table container — used as IntersectionObserver root */}
            <div
                ref={scrollContainerRef}
                className="bg-[#0A0E1A] border border-white/5 rounded-lg overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 180px)' }}
            >
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-gray-200 sticky top-0 z-10">
                        <tr>
                            <th className="p-4">Time</th>
                            <th className="p-4">Admin</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Details</th>
                            <th className="p-4">Type</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.length === 0 && !loading ? (
                            <tr><td colSpan={5} className="p-8 text-center">No logs found</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 whitespace-nowrap font-mono text-xs">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <User className="h-3 w-3" />
                                            {log.adminId ? log.adminId.username : 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-purple-400">{log.action}</span>
                                    </td>
                                    <td className="p-4 text-gray-300">{log.details}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                                            log.targetType === 'user'   ? 'bg-blue-500/10 text-blue-400' :
                                            log.targetType === 'image'  ? 'bg-green-500/10 text-green-400' :
                                            log.targetType === 'report' ? 'bg-red-500/10 text-red-400' :
                                            'bg-gray-500/10 text-gray-400'
                                        }`}>
                                            {log.targetType}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}

                        {/* Sentinel row */}
                        {page < totalPages && (
                            <tr ref={sentinelRef}>
                                <td colSpan={5} className="p-4 text-center text-gray-500 text-xs">
                                    {loading ? 'Loading more...' : ''}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="text-xs text-gray-500 text-right">
                Showing {logs.length} of {totalCount} &nbsp;·&nbsp; Page {page} of {totalPages}
            </div>
        </div>
    );
}
