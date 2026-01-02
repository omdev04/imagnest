'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Loader2, ExternalLink, Lock, Globe, Trash2, ChevronLeft, ChevronRight, Shield, Key, MoreVertical, Copy, Link2 } from 'lucide-react';
import PrivateLinkModal from '@/components/dashboard/PrivateLinkModal';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function ImagesPage() {
    const { data: session } = useSession();
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingPrivacyId, setTogglingPrivacyId] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<any | null>(null);
    const [showPrivateModal, setShowPrivateModal] = useState(false);
    const [userPlan, setUserPlan] = useState('free');
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchImages(currentPage);
        fetchUserPlan();
    }, [currentPage]);

    useEffect(() => {
        const handleClickOutside = () => {
            if (openDropdownId) {
                setOpenDropdownId(null);
            }
        };

        if (openDropdownId) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openDropdownId]);

    const fetchUserPlan = async () => {
        try {
            const res = await axios.get('/api/profile');
            setUserPlan(res.data.plan || 'free');
        } catch (error) {
            console.error('Failed to fetch user plan:', error);
        }
    };

    const fetchImages = async (page: number) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/images?page=${page}&limit=20`);
            setImages(res.data.images);
            setPagination(res.data.pagination);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePrivacy = async (img: any, e: React.MouseEvent) => {
        e.stopPropagation();

        const newPrivacy = img.privacy === 'public';

        // Check if user has access to private links
        if (newPrivacy && userPlan === 'free') {
            showToast('Private links are only available for Pro and Enterprise users. Please upgrade your plan.', 'warning', 5000);
            return;
        }

        setTogglingPrivacyId(img.id);
        try {
            const res = await axios.post('/api/images/toggle-privacy', {
                imageId: img.id,
                isPrivate: newPrivacy
            });

            if (res.data.success) {
                // Update the image in the list
                setImages(prev => prev.map(image =>
                    image.id === img.id
                        ? {
                            ...image,
                            privacy: res.data.image.privacy,
                            accessToken: res.data.image.accessToken
                        }
                        : image
                ));

                // If made private, show the modal
                if (newPrivacy && res.data.image.accessToken) {
                    setSelectedImage({
                        ...img,
                        privacy: res.data.image.privacy,
                        accessToken: res.data.image.accessToken
                    });
                    setShowPrivateModal(true);
                }
            }
        } catch (error: any) {
            console.error('Failed to toggle privacy:', error);
            if (error.response?.data?.requiresUpgrade) {
                showToast('Private links are only available for Pro and Enterprise users. Please upgrade your plan.', 'warning', 5000);
            } else {
                showToast('Failed to toggle privacy', 'error');
            }
        } finally {
            setTogglingPrivacyId(null);
        }
    };

    const handleShowPrivateLink = (img: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImage(img);
        setShowPrivateModal(true);
    };

    const handleRegenerateToken = async (imageId: string): Promise<string> => {
        const res = await axios.post('/api/images/regenerate-token', { imageId });

        // Update the image in the list
        setImages(prev => prev.map(image =>
            image.id === imageId
                ? { ...image, accessToken: res.data.accessToken }
                : image
        ));

        return res.data.accessToken;
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this image?")) return;

        setDeletingId(id);
        try {
            await axios.delete(`/api/images/${id}`);
            setImages(prev => prev.filter(img => img.id !== id));
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
            showToast('Image deleted successfully', 'success');
        } catch (error) {
            console.error("Failed to delete image:", error);
            showToast('Failed to delete image', 'error');
        } finally {
            setDeletingId(null);
        }
    };


    const handleCopyLink = async (img: any, e: React.MouseEvent, type: 'report' | 'direct' = 'report') => {
        e.stopPropagation();
        try {
            // Construct full URL with domain
            // Report link is /report/ID, Direct link is /i/ID (img.url)
            const path = type === 'report' ? `/report/${img.id}` : img.url;
            const fullUrl = `${window.location.origin}${path}`;
            await navigator.clipboard.writeText(fullUrl);
            showToast(`${type === 'report' ? 'Report' : 'Direct'} link copied!`, 'success');
        } catch (error) {
            console.error('Failed to copy link:', error);
            showToast('Failed to copy link', 'error');
        }
        setOpenDropdownId(null);
    };

    const toggleDropdown = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.pages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading && images.length === 0) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1da1f2]" /></div>
    }

    const startItem = (pagination.page - 1) * pagination.limit + 1;
    const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white font-display">Your Library</h1>
                {pagination.total > 0 && (
                    <div className="text-sm text-[#72767a]">
                        Showing <span className="text-white font-medium">{startItem}-{endItem}</span> of <span className="text-white font-medium">{pagination.total}</span>
                    </div>
                )}
            </div>

            {/* Images Grid */}
            {pagination.total === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#242628] rounded-xl">
                    <p className="text-[#72767a] mb-4">No images uploaded yet.</p>
                    <Button variant="primary" onClick={() => window.location.href = '/dashboard/upload'} className="bg-[#1da1f2] hover:bg-[#1a91da] text-white">Upload First Image</Button>
                </div>
            ) : (
                <>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        >
                            {images.map((img, index) => (
                                <motion.div
                                    key={img.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="group relative aspect-square bg-black rounded-lg border border-[#2f3336] hover:border-[#1da1f2] transition-colors"
                                >
                                    <img
                                        src={`${img.url}?size=small`}
                                        alt={img.name}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105 rounded-lg"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 rounded-lg">
                                        <p className="text-white text-xs truncate w-full text-center px-2">{img.name}</p>

                                        {/* Three-dot menu button */}
                                        <div className="relative">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={(e) => toggleDropdown(img.id, e)}
                                                className="bg-black/80 hover:bg-[#2f3336] text-white border-[#2f3336]"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>

                                            {/* Dropdown Menu */}
                                            {openDropdownId === img.id && (
                                                <div className="absolute top-full mt-1 right-0 bg-black border border-[#2f3336] rounded-lg shadow-xl z-[100] min-w-[180px] overflow-hidden">
                                                    {/* View Image */}

                                                    {/* Toggle Privacy */}
                                                    <button
                                                        onClick={(e) => {
                                                            setOpenDropdownId(null);
                                                            handleTogglePrivacy(img, e);
                                                        }}
                                                        disabled={togglingPrivacyId === img.id}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#2f3336] transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {togglingPrivacyId === img.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : img.privacy === 'private' ? (
                                                            <>
                                                                <Globe className="h-4 w-4 text-green-500" />
                                                                Make Public
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock className="h-4 w-4 text-yellow-500" />
                                                                Make Private
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* View Private Link (only for private images) */}
                                                    {img.privacy === 'private' && img.accessToken && (
                                                        <button
                                                            onClick={(e) => {
                                                                setOpenDropdownId(null);
                                                                handleShowPrivateLink(img, e);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-[#1da1f2] hover:bg-[#2f3336] transition-colors flex items-center gap-2"
                                                        >
                                                            <Key className="h-4 w-4" />
                                                            View Private Link
                                                        </button>
                                                    )}

                                                    {/* Copy Link */}
                                                    <button
                                                        onClick={(e) => handleCopyLink(img, e, 'report')}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#2f3336] transition-colors flex items-center gap-2"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                        Copy Report Link
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleCopyLink(img, e, 'direct')}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-[#72767a] hover:bg-[#2f3336] transition-colors flex items-center gap-2"
                                                    >
                                                        <Link2 className="h-4 w-4" />
                                                        Copy Direct Link
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={(e) => {
                                                            setOpenDropdownId(null);
                                                            handleDelete(img.id, e);
                                                        }}
                                                        disabled={deletingId === img.id}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-[#2f3336] transition-colors flex items-center gap-2 disabled:opacity-50 border-t border-[#2f3336]"
                                                    >
                                                        {deletingId === img.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Trash2 className="h-4 w-4" />
                                                                Delete
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute top-2 right-2">
                                            {img.privacy === 'private' ? <Lock className="h-3 w-3 text-yellow-500" /> : <Globe className="h-3 w-3 text-green-500" />}
                                        </div>
                                        {userPlan !== 'free' && (
                                            <div className="absolute top-2 left-2" title={`${userPlan.toUpperCase()} Plan`}>
                                                <Shield className="h-3 w-3 text-[#1da1f2]" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Pagination Controls */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className="gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>

                            <div className="flex items-center gap-2 px-4">
                                <span className="text-sm text-[#72767a]">
                                    Page <span className="text-white font-medium">{pagination.page}</span> of <span className="text-white font-medium">{pagination.pages}</span>
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === pagination.pages || loading}
                                className="gap-1"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Private Link Modal */}
            {showPrivateModal && selectedImage && selectedImage.accessToken && (
                <PrivateLinkModal
                    imageId={selectedImage.id}
                    imageName={selectedImage.name}
                    accessToken={selectedImage.accessToken}
                    onClose={() => setShowPrivateModal(false)}
                    onRegenerateToken={handleRegenerateToken}
                />
            )}
        </div>
    );
}
