
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Image {
    _id: string;
    fileId: string;
    originalName: string;
    size: number;
    mimeType: string;
    userId: { username: string; email: string };
    views: number;
    createdAt: string;
    moderationStatus: string;
}

export default function AdminImagesPage() {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const isFetching = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLTableDataCellElement>(null);
    const { showToast } = useToast();

    const fetchImages = useCallback(async (pageNum: number, append: boolean) => {
        if (isFetching.current) return;
        isFetching.current = true;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: pageNum.toString(), limit: '20' });
            const res = await fetch(`/api/admin/images?${params}`);
            const data = await res.json();
            if (data.images) {
                setImages(prev => append ? [...prev, ...data.images] : data.images);
                setTotalPages(data.pagination?.pages ?? 1);
                setTotalCount(data.pagination?.total ?? 0);
                setPage(pageNum);
            }
        } catch {
            showToast('Failed to fetch images', 'error');
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [showToast]);

    // Initial load
    useEffect(() => {
        fetchImages(1, false);
    }, [fetchImages]);

    // Infinite scroll — observe sentinel inside the scroll container
    useEffect(() => {
        const sentinel = sentinelRef.current;
        const container = scrollContainerRef.current;
        if (!sentinel || !container) return;

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isFetching.current) {
                    setPage(current => {
                        if (current < totalPages) {
                            fetchImages(current + 1, true);
                        }
                        return current;
                    });
                }
            },
            { root: container, rootMargin: '200px', threshold: 0 }
        );
        obs.observe(sentinel);
        return () => obs.disconnect();
    }, [totalPages, fetchImages]);

    const handleDelete = async (imageId: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;
        try {
            const res = await fetch(`/api/admin/images?imageId=${imageId}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Image deleted successfully', 'success');
                setImages(prev => prev.filter(img => img._id !== imageId));
                setTotalCount(c => c - 1);
            } else {
                showToast('Failed to delete image', 'error');
            }
        } catch {
            showToast('Failed to delete image', 'error');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Images</h1>
                <span className="text-sm text-gray-400">{totalCount} total</span>
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
                            <th className="p-4">Preview</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Size</th>
                            <th className="p-4">Views</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {images.length === 0 && !loading ? (
                            <tr><td colSpan={7} className="p-8 text-center">No images found</td></tr>
                        ) : (
                            images.map((image) => (
                                <tr key={image._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="h-10 w-10 bg-gray-800 rounded overflow-hidden">
                                            <img
                                                src={`/api/cdn/${image._id}?size=small`}
                                                alt="Preview"
                                                loading="lazy"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    const el = e.currentTarget;
                                                    el.style.display = 'none';
                                                    const placeholder = document.createElement('div');
                                                    placeholder.className = 'h-full w-full flex items-center justify-center text-xs text-gray-600';
                                                    placeholder.textContent = 'IMG';
                                                    el.parentElement?.appendChild(placeholder);
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-white truncate max-w-[200px]" title={image.originalName}>
                                                {image.originalName}
                                            </span>
                                            <span className="text-xs">{image.mimeType}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {image.userId ? (
                                            <div className="flex flex-col">
                                                <span className="text-white">{image.userId.username}</span>
                                                <span className="text-xs">{image.userId.email}</span>
                                            </div>
                                        ) : 'Unknown'}
                                    </td>
                                    <td className="p-4">{formatSize(image.size)}</td>
                                    <td className="p-4">{image.views}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            image.moderationStatus === 'approved' ? 'bg-green-500/10 text-green-400' :
                                            image.moderationStatus === 'removed'  ? 'bg-red-500/10 text-red-400' :
                                            'bg-gray-500/10 text-gray-400'
                                        }`}>
                                            {image.moderationStatus || 'active'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <a
                                                href={`/api/cdn/${image._id}`}
                                                target="_blank"
                                                className="p-1 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 rounded transition-colors"
                                                title="View Image"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(image._id)}
                                                className="p-1 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded transition-colors"
                                                title="Delete Image"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}

                        {/* Sentinel row — triggers next page load when scrolled into view */}
                        {page < totalPages && (
                            <tr>
                                <td colSpan={7} ref={sentinelRef} className="p-4 text-center text-gray-500 text-xs">
                                    {loading ? 'Loading more...' : ''}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {loading && images.length > 0 && (
                    <div className="py-4 text-center text-sm text-gray-500">Loading...</div>
                )}
            </div>

            <div className="text-xs text-gray-500 text-right">
                Showing {images.length} of {totalCount} &nbsp;·&nbsp; Page {page} of {totalPages}
            </div>
        </div>
    );
}
