
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Trash2, ExternalLink, Eye } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1); // current page for page-based navigation
    const [loadedPages, setLoadedPages] = useState(1); // highest page loaded when lazy-loading
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const { showToast } = useToast();

    useEffect(() => {
        // replace results when navigating pages directly
        fetchImages({ page, append: false });
    }, [page]);

    const fetchImages = async ({ page, append = false }: { page: number; append?: boolean }) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10'
            });
            const res = await fetch(`/api/admin/images?${params}`);
            const data = await res.json();
            if (data.images) {
                if (append) {
                    setImages((prev) => [...prev, ...data.images]);
                } else {
                    setImages(data.images);
                }
                if (data.pagination) {
                    setTotalPages(data.pagination.pages || 1);
                    setTotalCount(data.pagination.total || 0);
                    setLoadedPages(page);
                }
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch images', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (imageId: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const res = await fetch(`/api/admin/images?imageId=${imageId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showToast('Image deleted successfully', 'success');
                fetchImages({ page, append: false });
            } else {
                showToast('Failed to delete image', 'error');
            }
        } catch (error) {
            showToast('Failed to delete image', 'error');
        }
    };

    // Lazy-load: load next page and append
    const loadMore = async () => {
        if (loading) return;
        const nextPage = loadedPages + 1;
        if (nextPage > totalPages) return;
        await fetchImages({ page: nextPage, append: true });
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

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Images</h1>
            </div>

            <div className="bg-[#0A0E1A] border border-white/5 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-gray-200">
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
                        {loading ? (
                            <tr><td colSpan={7} className="p-8 text-center">Loading...</td></tr>
                        ) : images.length === 0 ? (
                            <tr><td colSpan={7} className="p-8 text-center">No images found</td></tr>
                        ) : (
                            images.map((image) => (
                                <tr key={image._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="h-10 w-10 bg-gray-800 rounded overflow-hidden">
                                            <img
                                                src={`/api/cdn/${image._id}?size=small`}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    // @ts-ignore
                                                    e.target.style.display = 'none';
                                                    // @ts-ignore
                                                    e.target.parentNode.innerHTML = '<div class="h-full w-full flex items-center justify-center text-xs text-gray-600">IMG</div>';
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
                                        <span className={`px-2 py-1 rounded-full text-xs ${image.moderationStatus === 'approved' ? 'bg-green-500/10 text-green-400' :
                                            image.moderationStatus === 'removed' ? 'bg-red-500/10 text-red-400' :
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

                {/* Sentinel element for infinite scroll (auto load more) */}
                <div ref={sentinelRef} className="h-6 w-full" />
            </div>
        </div >
    );
}
