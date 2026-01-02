'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Download, Flag, Share2, Calendar, User, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';

interface ImageData {
    id: string;
    url: string;
    name: string;
    mimeType: string;
    size: number;
    views: number;
    createdAt: string;
    isOwner: boolean;
    uploader: {
        username: string;
        avatar?: string;
    };
}

export default function ViewImagePage() {
    const params = useParams();
    const id = params?.id as string;
    const [image, setImage] = useState<ImageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const { showToast } = useToast();

    // Report Form State
    const [reason, setReason] = useState('spam');
    const [description, setDescription] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    useEffect(() => {
        if (id) {
            fetchImage();
        }
    }, [id]);

    const fetchImage = async () => {
        try {
            const res = await fetch(`/api/view/${id}`);
            if (res.ok) {
                const data = await res.json();
                setImage(data);
            } else {
                setError('Image not found or private');
            }
        } catch (err) {
            setError('Failed to load image');
        } finally {
            setLoading(false);
        }
    };

    const handleReport = async () => {
        setSubmittingReport(true);
        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageId: id,
                    reason,
                    description
                })
            });

            if (res.ok) {
                showToast('Report submitted successfully', 'success');
                setReportModalOpen(false);
                setDescription('');
                setReason('spam');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to submit report', 'error');
            }
        } catch (err) {
            showToast('Failed to submit report', 'error');
        } finally {
            setSubmittingReport(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#000212] flex items-center justify-center text-white">
            <div className="animate-pulse">Loading image...</div>
        </div>
    );

    if (error || !image) return (
        <div className="min-h-screen bg-[#000212] flex flex-col items-center justify-center text-white p-4">
            <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
            <p className="text-gray-400 mb-6">{error || 'Image unavailable'}</p>
            <Link href="/">
                <Button variant="secondary">Go Home</Button>
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#000212] text-white">
            {/* Header */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#000212]/50 backdrop-blur fixed top-0 w-full z-10">
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <div className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Imagnest
                        </div>
                    </Link>
                </div>
            </header>

            <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-[1fr,350px] gap-8">
                    {/* Image Viewer */}
                    <div className="space-y-4">
                        <div className="bg-[#0A0E1A] border border-white/5 rounded-2xl p-2 flex items-center justify-center min-h-[50vh] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
                            <img
                                src={image.url}
                                alt={image.name}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>

                    {/* Sidebar / Metadata */}
                    <div className="space-y-6">
                        <div className="bg-[#0A0E1A] border border-white/5 rounded-2xl p-6 space-y-6">
                            <div>
                                <h1 className="text-xl font-bold text-white break-words">{image.name}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(image.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-4 border-y border-white/5">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                    {image.uploader.avatar ? (
                                        <img src={image.uploader.avatar} className="h-full w-full rounded-full object-cover" alt="User" />
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{image.uploader.username}</div>
                                    <div className="text-xs text-gray-500">Uploader</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-lg p-3 text-center">
                                    <div className="flex justify-center mb-1 text-gray-400"><Eye className="h-5 w-5" /></div>
                                    <div className="text-lg font-bold text-white">{image.views.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">Views</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 text-center">
                                    <div className="flex justify-center mb-1 text-gray-400"><Download className="h-5 w-5" /></div>
                                    <div className="text-lg font-bold text-white">{(image.size / 1024 / 1024).toFixed(2)} MB</div>
                                    <div className="text-xs text-gray-500">Size</div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <a
                                    href={image.url}
                                    download={image.name}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
                                >
                                    <Download className="h-4 w-4" /> Download Original
                                </a>
                                {!image.isOwner ? (
                                    <button
                                        onClick={() => setReportModalOpen(true)}
                                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
                                    >
                                        <Flag className="h-4 w-4" /> Report Abuse
                                    </button>
                                ) : (
                                    <Link
                                        href="/dashboard/images"
                                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Manage in Dashboard
                                    </Link>
                                )}
                                {image.isOwner && (
                                    <div className="text-center text-xs text-gray-500 mt-1">
                                        (Report button is hidden for owner)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Report Modal */}
            {reportModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0A0E1A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">Report Content</h3>
                            <button onClick={() => setReportModalOpen(false)} className="text-gray-500 hover:text-white">
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            Please select a reason for reporting this content. Reports are reviewed by our moderation team.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full bg-[#1A1D2D] border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="spam">Spam or Misleading</option>
                                    <option value="sexual">Sexual Content</option>
                                    <option value="violence">Violent or Repulsive</option>
                                    <option value="child_unsafe">Child Endangerment</option>
                                    <option value="illegal">Illegal Acts</option>
                                    <option value="copyright">Copyright Infringement</option>
                                    <option value="other">Other Issue</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide additional details..."
                                    className="w-full bg-[#1A1D2D] border border-white/10 rounded-lg p-3 text-white h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>

                            <button
                                onClick={handleReport}
                                disabled={submittingReport}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center"
                            >
                                {submittingReport ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
