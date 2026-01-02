'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Flag, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ReportPage() {
    const params = useParams();
    const id = params?.id as string;
    const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
    const [reason, setReason] = useState('spam');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (id) {
            // Check if image exists just by trying to fetch metadata or check header?
            // For now, we can just assume it exists or let the API fail if not.
            // But to show a preview, we can construct the URL.
            // However, if the image is private, we might not be able to "view" it, 
            // BUT reporting should still be allowed? 
            // The prompt implies we report "what we see". 
            // We will try to fetch public metadata.

            fetch(`/api/view/${id}`)
                .then(res => {
                    if (res.ok) {
                        return res.json();
                    }
                    throw new Error('Image not found');
                })
                .then(data => {
                    setImageUrl(data.url);
                    setStatus('form');
                })
                .catch(() => {
                    // Even if we can't fetch metadata (private/deleted), we might still want to report ID?
                    // But usually you report what you see.
                    // If it errors, maybe the ID is invalid.
                    setStatus('error'); // Or 'form' without preview?
                    // Let's fallback to form without preview if metadata fetch fails but ID is present.
                    // But if it's 404, we can't report.
                });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

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
                setStatus('success');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to submit report', 'error');
            }
        } catch (error) {
            showToast('Something went wrong', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading') return (
        <div className="min-h-screen bg-[#000212] flex items-center justify-center text-white">
            <div className="animate-pulse">Loading...</div>
        </div>
    );

    if (status === 'error') return (
        <div className="min-h-screen bg-[#000212] flex flex-col items-center justify-center text-white p-4">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
            <p className="text-gray-400">Content not found or unavailable.</p>
        </div>
    );

    if (status === 'success') return (
        <div className="min-h-screen bg-[#000212] flex flex-col items-center justify-center text-white p-4">
            <div className="bg-[#0A0E1A] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
                <p className="text-gray-400 mb-6">
                    Thank you for keeping our community safe. Our moderation team will review your report shortly.
                </p>
                <button
                    onClick={() => window.close()}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                    Close this window
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#000212] flex items-center justify-center p-4">
            <div className="bg-[#0A0E1A] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                        <Flag className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Report Content</h1>
                        <p className="text-xs text-gray-500">ID: {id}</p>
                    </div>
                </div>

                <div className="p-6">
                    {/* Preview */}
                    {imageUrl && (
                        <div className="mb-6 bg-black/50 rounded-lg p-2 flex justify-center border border-white/5">
                            <img
                                src={imageUrl}
                                className="max-h-48 object-contain rounded opacity-70 hover:opacity-100 transition-opacity"
                                alt="Content Preview"
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Why are you reporting this?</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-[#1A1D2D] border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500/50 outline-none appearance-none"
                            >
                                <option value="spam">Spam or Misleading</option>
                                <option value="sexual">Sexual Content / Nudity</option>
                                <option value="violence">Violent or Repulsive</option>
                                <option value="child_unsafe">Child Endangerment</option>
                                <option value="illegal">Illegal Acts</option>
                                <option value="copyright">Copyright Infringement</option>
                                <option value="other">Other Issue</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Additional Details</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Please provide any extra context..."
                                className="w-full bg-[#1A1D2D] border border-white/10 rounded-lg p-3 text-white h-24 focus:ring-2 focus:ring-red-500/50 outline-none resize-none"
                            />
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 flex gap-3 items-start">
                            <AlertTriangle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-200/70 leading-relaxed">
                                False reports may result in action against your IP address. Please ensure this content violates our Terms of Service.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50 mt-2"
                        >
                            {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
