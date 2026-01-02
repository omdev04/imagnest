
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
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1); // current page for direct navigation
    const [loadedPages, setLoadedPages] = useState(1); // highest page loaded when lazy-loading
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const { showToast } = useToast();

    useEffect(() => {
        // replace results when changing page
        fetchLogs({ page, append: false });
    }, [page]);

    const fetchLogs = async ({ page, append = false }: { page: number; append?: boolean }) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10'
            });
            const res = await fetch(`/api/admin/logs?${params}`);
            const data = await res.json();
            if (data.logs) {
                if (append) {
                    setLogs((prev) => [...prev, ...data.logs]);
                } else {
                    setLogs(data.logs);
                }

                if (data.pagination) {
                    setTotalPages(data.pagination.pages || 1);
                    setTotalCount(data.pagination.total || 0);
                    setLoadedPages(page);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const res = await fetch('/api/admin/logs?export=csv');
            if (!res.ok) {
                showToast('Failed to download logs', 'error');
                return;
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `admin-logs-${new Date().toISOString().slice(0,10)}.csv`;
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
                setLoadedPages(1);
                fetchLogs({ page: 1, append: false });
            } else {
                showToast(data.error || 'Failed to delete logs', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to delete logs', 'error');
        }
    };

    // Lazy-load: load next page and append
    const loadMore = async () => {
        if (loading) return;
        const nextPage = loadedPages + 1;
        if (nextPage > totalPages) return;
        await fetchLogs({ page: nextPage, append: true });
    };

    // IntersectionObserver to auto load more when sentinel appears
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const onIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && loadedPages < totalPages) {
            loadMore();
        }
    }, [loading, loadedPages, totalPages]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(onIntersect, { root: null, rootMargin: '200px', threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [onIntersect]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="h-6 w-6 text-gray-400" /> Audit Logs
            </h1>

            <div className="bg-[#0A0E1A] border border-white/5 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-gray-200">
                        <tr>
                            <th className="p-4">Time</th>
                            <th className="p-4">Admin</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Details</th>
                            <th className="p-4">Type</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                        ) : logs.length === 0 ? (
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
                                    <td className="p-4 text-gray-300">
                                        {log.details}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${log.targetType === 'user' ? 'bg-blue-500/10 text-blue-400' :
                                                log.targetType === 'image' ? 'bg-green-500/10 text-green-400' :
                                                    log.targetType === 'report' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {log.targetType}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="disabled:opacity-50 hover:text-white"
                        >
                            Previous
                        </button>

                        <span>Page {page} of {totalPages}</span>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="disabled:opacity-50 hover:text-white"
                        >
                            Next
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">Showing 10 per page{totalCount ? ` • ${totalCount} total` : ''}</span>

                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded hover:bg-white/10"
                            title="Download all logs as CSV"
                        >
                            <Download className="h-4 w-4" /> Download logs
                        </button>

                        <button
                            onClick={handleDeleteAll}
                            className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20"
                            title="Delete all logs (superadmin only)"
                        >
                            <Trash className="h-4 w-4" /> Delete all
                        </button>

                        <button
                            onClick={loadMore}
                            disabled={loadedPages >= totalPages || loading}
                            className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
                        >
                            Load more
                        </button>
                        <span className="text-xs text-gray-500">Loaded pages: {loadedPages}</span>
                    </div>
                </div>

                {/* Sentinel element for infinite scroll (auto load more) */}
                <div ref={sentinelRef} className="h-6 w-full" />
            </div>
        </div>
    );
}
