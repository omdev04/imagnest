
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, Check, X, ExternalLink, AlertTriangle, Ban } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Report {
    _id: string;
    imageId: { _id: string; originalName: string; };
    reportedBy: { username: string; email: string };
    reason: string;
    description: string;
    status: string;
    createdAt: string;
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [resolveModal, setResolveModal] = useState<{ open: boolean; reportId: string | null }>({ open: false, reportId: null });
    const isFetching = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLTableRowElement>(null);
    const { showToast } = useToast();

    const fetchReports = useCallback(async (pageNum: number, append: boolean) => {
        if (isFetching.current) return;
        isFetching.current = true;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: pageNum.toString(), limit: '20', status: 'pending' });
            const res = await fetch(`/api/admin/reports?${params}`);
            const data = await res.json();
            if (data.reports) {
                setReports(prev => append ? [...prev, ...data.reports] : data.reports);
                setTotalPages(data.pagination?.pages ?? 1);
                setTotalCount(data.pagination?.total ?? 0);
                setPage(pageNum);
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch reports', 'error');
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [showToast]);

    useEffect(() => {
        fetchReports(1, false);
    }, [fetchReports]);

    // Infinite scroll — use scrollContainerRef as root (admin layout scrolls inside a div)
    useEffect(() => {
        const sentinel = sentinelRef.current;
        const container = scrollContainerRef.current;
        if (!sentinel || !container) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFetching.current) {
                    setPage(current => {
                        if (current < totalPages) fetchReports(current + 1, true);
                        return current;
                    });
                }
            },
            { root: container, rootMargin: '200px', threshold: 0 }
        );
        obs.observe(sentinel);
        return () => obs.disconnect();
    }, [totalPages, fetchReports]);

    const handleResolve = async (reportId: string, userAction: 'none' | 'warn' | 'suspend' | 'ban') => {
        try {
            const res = await fetch('/api/admin/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, action: 'approve', userAction })
            });
            if (res.ok) {
                showToast('Report resolved successfully', 'success');
                setResolveModal({ open: false, reportId: null });
                setReports(prev => prev.filter(r => r._id !== reportId));
                setTotalCount(c => c - 1);
            } else {
                showToast('Failed to resolve report', 'error');
            }
        } catch {
            showToast('Action failed', 'error');
        }
    };

    const handleIgnore = async (reportId: string) => {
        try {
            const res = await fetch('/api/admin/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, action: 'ignore' })
            });
            if (res.ok) {
                showToast('Report dismissed', 'success');
                setReports(prev => prev.filter(r => r._id !== reportId));
                setTotalCount(c => c - 1);
            }
        } catch {
            showToast('Action failed', 'error');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Abuse Reports</h1>
                {totalCount > 0 && (
                    <span className="text-sm text-gray-400">{totalCount} pending</span>
                )}
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
                            <th className="p-4">Reported Image</th>
                            <th className="p-4">Reason</th>
                            <th className="p-4">Reporter</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {reports.length === 0 && !loading ? (
                            <tr><td colSpan={5} className="p-8 text-center">No pending reports</td></tr>
                        ) : (
                            reports.map((report) => (
                                <tr key={report._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        {report.imageId ? (
                                            <a href={`/view/${report.imageId._id}`} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">
                                                View Image <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            <span className="text-red-500">Image Deleted</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-white">{report.reason}</div>
                                        <div className="text-xs max-w-xs">{report.description}</div>
                                    </td>
                                    <td className="p-4">
                                        {report.reportedBy ? report.reportedBy.username : 'Anonymous'}
                                    </td>
                                    <td className="p-4">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setResolveModal({ open: true, reportId: report._id })}
                                                className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                                            >
                                                <Check className="h-4 w-4" /> Resolve
                                            </button>
                                            <button
                                                onClick={() => handleIgnore(report._id)}
                                                className="flex items-center gap-1 px-3 py-1 bg-gray-700/50 text-gray-300 border border-gray-600 rounded hover:bg-gray-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" /> Dismiss
                                            </button>
                                        </div>
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
                Showing {reports.length} of {totalCount} &nbsp;·&nbsp; Page {page} of {totalPages}
            </div>

            {/* Resolve Modal */}
            {resolveModal.open && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0A0E1A] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Resolve Abuse Report</h3>
                        <p className="text-gray-400 mb-6">
                            Verified abuse? Select an action to take against the content and the user.
                            <br />
                            <span className="text-red-400 text-sm">Note: Image will be deleted in all cases.</span>
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleResolve(resolveModal.reportId!, 'none')}
                                className="w-full p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-left transition-colors flex items-center justify-between group"
                            >
                                <div>
                                    <div className="text-red-200 font-medium">Delete Image Only</div>
                                    <div className="text-red-400/60 text-xs">Remove content, no penalty for user</div>
                                </div>
                                <ShieldAlert className="h-5 w-5 text-red-500/50 group-hover:text-red-500" />
                            </button>

                            <button
                                onClick={() => handleResolve(resolveModal.reportId!, 'warn')}
                                className="w-full p-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-left transition-colors flex items-center justify-between group"
                            >
                                <div>
                                    <div className="text-yellow-200 font-medium">Delete & Warn User</div>
                                    <div className="text-yellow-400/60 text-xs">Add 1 warning (Auto-ban at 3)</div>
                                </div>
                                <AlertTriangle className="h-5 w-5 text-yellow-500/50 group-hover:text-yellow-500" />
                            </button>

                            <button
                                onClick={() => handleResolve(resolveModal.reportId!, 'ban')}
                                className="w-full p-3 bg-red-900/20 hover:bg-red-900/30 border border-red-500/50 rounded-lg text-left transition-colors flex items-center justify-between group"
                            >
                                <div>
                                    <div className="text-red-100 font-bold">Delete & Ban User</div>
                                    <div className="text-red-400/60 text-xs">Immediately ban account</div>
                                </div>
                                <Ban className="h-5 w-5 text-red-500 group-hover:text-red-400" />
                            </button>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setResolveModal({ open: false, reportId: null })}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
