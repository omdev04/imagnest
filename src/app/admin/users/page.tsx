
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MoreVertical, Shield, Ban, UserCheck, AlertTriangle, CreditCard, X, Check } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    plan: string;
    createdAt: string;
    warnings: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [loadedPages, setLoadedPages] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const { showToast } = useToast();

    // Plan Edit State
    const [editingPlanUser, setEditingPlanUser] = useState<User | null>(null);
    const [selectedPlan, setSelectedPlan] = useState('free');
    const [updatingPlan, setUpdatingPlan] = useState(false);

    useEffect(() => {
        fetchUsers({ page, append: false });
    }, [page, search]);


    const fetchUsers = async ({ page, append = false }: { page: number; append?: boolean }) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search
            });
            const res = await fetch(`/api/admin/users?${params}`);
            const data = await res.json();
            if (data.users) {
                if (append) {
                    setUsers((prev) => [...prev, ...data.users]);
                } else {
                    setUsers(data.users);
                }
                if (data.pagination) {
                    setTotalPages(data.pagination.pages || 1);
                    setTotalCount(data.pagination.total || 0);
                    setLoadedPages(page);
                }
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId: string, action: 'ban' | 'unban' | 'warn') => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action, reason: 'Admin action' })
            });

            if (res.ok) {
                showToast(`User ${action} successful`, 'success');
                fetchUsers({ page, append: false });
            } else {
                showToast('Action failed', 'error');
            }
        } catch (error) {
            showToast('Action failed', 'error');
        }
    };

    const handlePlanUpdate = async () => {
        if (!editingPlanUser) return;

        try {
            setUpdatingPlan(true);
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: editingPlanUser._id,
                    action: 'changePlan',
                    plan: selectedPlan
                })
            });

            if (res.ok) {
                showToast(`Plan updated to ${selectedPlan}`, 'success');
                // Update local state
                setUsers(users.map(u => u._id === editingPlanUser._id ? { ...u, plan: selectedPlan } : u));
                setEditingPlanUser(null);
            } else {
                showToast('Failed to update plan', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to update plan', 'error');
        } finally {
            setUpdatingPlan(false);
        }
    };

    const loadMore = async () => {
        if (loading) return;
        const nextPage = loadedPages + 1;
        if (nextPage > totalPages) return;
        await fetchUsers({ page: nextPage, append: true });
    };

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
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Users</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); setUsers([]); }}
                        className="pl-10 pr-4 py-2 bg-[#0A0E1A] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="bg-[#0A0E1A] border border-white/5 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-gray-200">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Plan</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading && users.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center">No users found</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-white">{user.username}</div>
                                            <div className="text-xs">{user.email || 'No email'}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs border ${user.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.plan === 'enterprise' ? 'text-amber-400' :
                                                user.plan === 'pro' ? 'text-blue-400' : 'text-gray-400'
                                                }`}>
                                                {user.plan.toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'active' ? 'bg-green-500/10 text-green-400' :
                                            user.status === 'banned' ? 'bg-red-500/10 text-red-400' :
                                                'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingPlanUser(user);
                                                    setSelectedPlan(user.plan);
                                                }}
                                                className="p-1 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded transition-colors"
                                                title="Change Plan"
                                            >
                                                <CreditCard className="h-4 w-4" />
                                            </button>

                                            {['banned', 'suspended'].includes(user.status) ? (
                                                <button
                                                    onClick={() => handleAction(user._id, 'unban')}
                                                    className="p-1 hover:bg-green-500/10 text-gray-400 hover:text-green-400 rounded transition-colors"
                                                    title="Unban / Restore User"
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAction(user._id, 'ban')}
                                                    className="p-1 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded transition-colors"
                                                    title="Ban User"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleAction(user._id, 'warn')}
                                                className="p-1 hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-400 rounded transition-colors"
                                                title="Warn User"
                                            >
                                                <AlertTriangle className="h-4 w-4" />
                                            </button>
                                        </div>
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
                            onClick={loadMore}
                            disabled={loadedPages >= totalPages || loading}
                            className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
                        >
                            Load more
                        </button>
                        <span className="text-xs text-gray-500">Loaded pages: {loadedPages}</span>
                    </div>
                </div>

                <div ref={sentinelRef} className="h-6 w-full" />
            </div>

            {/* Plan Edit Modal */}
            {editingPlanUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0A0E1A] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Change Plan</h3>
                                <p className="text-sm text-gray-400">User: {editingPlanUser.username}</p>
                            </div>
                            <button
                                onClick={() => setEditingPlanUser(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Select Plan</label>
                                <select
                                    value={selectedPlan}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    className="w-full bg-[#000108] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="free">Free Plan</option>
                                    <option value="pro">Pro Plan</option>
                                    <option value="enterprise">Enterprise Plan</option>
                                </select>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <p className="text-xs text-blue-300">
                                    Updating the plan will immediately unlock features for this user. Ensure you have received payment if applicable.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setEditingPlanUser(null)}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePlanUpdate}
                                    disabled={updatingPlan}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {updatingPlan ? 'Updating...' : (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Update Plan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
