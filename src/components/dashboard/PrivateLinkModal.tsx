'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Copy, RefreshCw, Lock, Check, ExternalLink } from 'lucide-react';

interface PrivateLinkModalProps {
    imageId: string;
    imageName: string;
    accessToken: string;
    onClose: () => void;
    onRegenerateToken: (imageId: string) => Promise<string>;
}

export default function PrivateLinkModal({
    imageId,
    imageName,
    accessToken,
    onClose,
    onRegenerateToken
}: PrivateLinkModalProps) {
    const [copied, setCopied] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [currentToken, setCurrentToken] = useState(accessToken);

    const privateUrl = `${window.location.origin}/api/cdn/${imageId}?token=${currentToken}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(privateUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const newToken = await onRegenerateToken(imageId);
            setCurrentToken(newToken);
        } catch (error) {
            console.error('Failed to regenerate token:', error);
        } finally {
            setRegenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl p-6 mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <Lock className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Private Link</h3>
                            <p className="text-sm text-gray-400">{imageName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Warning */}
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex gap-3">
                        <div className="text-amber-400 mt-0.5">⚠️</div>
                        <div>
                            <p className="text-sm text-amber-200 font-medium mb-1">Keep this link secure</p>
                            <p className="text-xs text-amber-300/80">
                                Anyone with this URL can access your private image. Don't share it publicly.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Private URL */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Private URL
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 font-mono text-sm text-gray-300 overflow-x-auto">
                            {privateUrl}
                        </div>
                        <Button
                            onClick={handleCopy}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white px-4"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Token Info */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white mb-1">Access Token</p>
                            <p className="text-xs text-gray-400">
                                Regenerate if you think the link has been compromised
                            </p>
                        </div>
                        <Button
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            variant="outline"
                            className="border-white/10 hover:bg-white/5"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                            Regenerate
                        </Button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        onClick={() => window.open(privateUrl, '_blank')}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white"
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Test Link
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="border-white/10 hover:bg-white/5"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
