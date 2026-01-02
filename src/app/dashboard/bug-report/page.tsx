'use client';

import { useState } from 'react';
import { Bug, Send, AlertTriangle, CheckCircle, Smartphone, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BugReportPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Capture basic device info
            const deviceInfo = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                screenSize: `${window.screen.width}x${window.screen.height}`
            };

            const res = await fetch('/api/bug-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, deviceInfo })
            });

            if (!res.ok) throw new Error('Failed to submit report');

            setSuccess(true);
            setFormData({ title: '', description: '', priority: 'medium' });
        } catch (error) {
            console.error(error);
            alert('Failed to submit bug report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Report Submitted!</h1>
                <p className="text-gray-400 mb-8 max-w-md">
                    Thank you for helping us improve Telephoto. Our team will review your report shortly.
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2 bg-[#0110FC] text-white rounded-lg hover:bg-[#010FCC] transition-colors"
                >
                    Submit Another Report
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                        <Bug className="h-6 w-6 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Report a Bug</h1>
                </div>
                <p className="text-[#8B9EFF]">
                    Found an issue? Let us know so we can fix it. Your feedback helps make Telephoto better for everyone.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-[#16181c] border border-white/10 rounded-2xl p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Issue Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Image upload failing on Safari"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0110FC] transition-colors placeholder:text-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea
                            required
                            rows={5}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Please describe the steps to reproduce the issue..."
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#0110FC] transition-colors placeholder:text-gray-600 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Priority Level</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['low', 'medium', 'high', 'critical'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p })}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize border transition-all ${formData.priority === p
                                            ? p === 'critical' ? 'bg-red-500/20 border-red-500 text-red-400'
                                                : p === 'high' ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                                    : 'bg-[#0110FC]/20 border-[#0110FC] text-[#0110FC]'
                                            : 'bg-black/30 border-white/10 text-gray-500 hover:bg-white/5'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 flex gap-3 text-sm text-blue-200/60">
                        <Monitor className="h-5 w-5 shrink-0 text-blue-400/50" />
                        <p>We'll automatically collect basic device information (browser & OS) to help debug the issue.</p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-[#0110FC] hover:bg-[#010FCC] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Submit Report
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
