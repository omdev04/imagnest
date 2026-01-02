'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Copy, Trash2, Plus, Key, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { motion } from 'framer-motion';

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
    const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/keys');
            const data = await res.json();
            if (data.keys) {
                setKeys(data.keys);
            }
        } catch (error) {
            console.error('Failed to fetch keys', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateKey = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/keys', { method: 'POST' });
            const data = await res.json();
            if (data.key) {
                setKeys([...keys, data.key]);
                setNewlyGeneratedKey(data.key);
                setShowGenerateConfirm(false);
            }
        } catch (error) {
            showToast('Failed to generate key', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const deleteKey = async (keyToDelete: string) => {
        if (!confirm('Are you sure you want to revoke this key? Any applications using it will stop working.')) return;

        try {
            const res = await fetch('/api/keys', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: keyToDelete })
            });

            if (res.ok) {
                setKeys(keys.filter(k => k !== keyToDelete));
                showToast('API Key revoked successfully', 'success');
            }
        } catch (error) {
            showToast('Failed to revoke key', 'error');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    };

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white font-display">API Keys</h1>
                    <p className="text-[#72767a] mt-1">Manage secret tokens used to access the API. Keep them secure.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setShowGenerateConfirm(true)}
                        className="flex items-center gap-2 bg-[#1da1f2] hover:bg-[#1a91da] text-white border-0 shadow-sm"
                    >
                        <Key className="h-4 w-4" />
                        Generate Key
                    </Button>

                    <Button
                        onClick={() => { navigator.clipboard.writeText(keys.join('\n')); showToast('All keys copied', 'success'); }}
                        variant="outline"
                        className="hidden md:inline-flex"
                    >
                        <Copy className="h-4 w-4" /> Copy All
                    </Button>
                </div>
            </div>


            {/* Keys List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-card backdrop-blur-xl rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500"
            >
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-semibold text-white font-display">Active Keys</h2>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading keys...</div>
                ) : keys.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="inline-flex h-12 w-12 bg-[#1da1f2]/10 rounded-xl items-center justify-center mb-4 border border-[#1da1f2]/20">
                            <Key className="h-6 w-6 text-[#1da1f2]" />
                        </div>
                        <h3 className="text-white font-medium text-lg">No active keys</h3>
                        <p className="text-muted-foreground text-sm mt-1 mb-6 max-w-sm mx-auto">Create a key now to start integrating with our API. It takes less than a minute.</p>
                        <Button onClick={() => setShowGenerateConfirm(true)} className="bg-[#1da1f2] hover:bg-[#1a91da] text-white border-0 shadow-lg shadow-[#1da1f2]/20">Create Key</Button>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {keys.map((key, i) => {
                            const preview = `${key.slice(0, 8)}…${key.slice(-4)}`;
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-4 md:p-5 flex items-center justify-between group hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="h-10 w-10 bg-card rounded-lg flex items-center justify-center border border-border group-hover:border-[#1da1f2]/50 transition-colors shadow-sm">
                                            <Key className="h-5 w-5 text-[#1da1f2]" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-mono text-muted-foreground bg-black/50 px-2 py-1 rounded border border-border truncate max-w-xs md:max-w-md">
                                                    {preview}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(key)}
                                                    className="p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
                                                    title="Copy full key"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Full Access</span>
                                                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <a href="#" onClick={(e) => { e.preventDefault(); copyToClipboard(key); showToast('Full key copied', 'success'); }} className="text-xs text-muted-foreground hover:text-white transition-colors">Copy</a>
                                        <Button
                                            onClick={() => deleteKey(key)}
                                            variant="ghost"
                                            className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Developer API Documentation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-6"
            >
                {/* API Endpoints */}
                <div className="bg-card backdrop-blur-xl rounded-3xl border border-border p-8 space-y-6 shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-display">Developer API Documentation</h2>
                        <p className="text-muted-foreground mt-1">Complete API reference for integrating Imgnest into your applications</p>
                    </div>

                    {/* Authentication */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Authentication</h3>
                        <p className="text-sm text-muted-foreground">All API requests require authentication using an API key in the header:</p>
                        <div className="bg-black/50 rounded-xl border border-border p-4">
                            <code className="text-sm text-cyan-400 font-mono">x-api-key: YOUR_API_KEY</code>
                        </div>
                    </div>

                    {/* Base URL */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Base URL</h3>
                        <div className="bg-black/50 rounded-xl border border-border p-4">
                            <code className="text-sm text-white font-mono">{typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api</code>
                        </div>
                    </div>
                </div>

                {/* Endpoints */}
                <div className="bg-card backdrop-blur-xl rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-xl font-bold text-white font-display">API Endpoints</h3>
                    </div>

                    <div className="divide-y divide-border">
                        {/* Upload Image */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded border border-green-500/20">POST</span>
                                        <code className="text-white font-mono">/upload</code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Upload an image to your library</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-white mb-2">Request Body (multipart/form-data):</p>
                                    <div className="bg-black/50 rounded-lg border border-border p-3 text-xs font-mono text-gray-300">
                                        <div><span className="text-cyan-400">file</span>: File (required)</div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-white mb-2">Response (200 OK):</p>
                                    <div className="bg-black/50 rounded-lg border border-border p-3">
                                        <pre className="text-xs font-mono text-gray-300 overflow-x-auto">{`{
  "success": true,
  "url": "https://your-domain.com/cdn/abc123",
  "imageId": "abc123",
  "filename": "image.jpg",
  "size": 1024000
}`}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Get Image Details */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded border border-blue-500/20">GET</span>
                                        <code className="text-white font-mono">/images/:id</code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Retrieve image details and metadata</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-white mb-2">Response (200 OK):</p>
                                    <div className="bg-black/50 rounded-lg border border-border p-3">
                                        <pre className="text-xs font-mono text-gray-300 overflow-x-auto">{`{
  "success": true,
  "image": {
    "_id": "abc123",
    "filename": "image.jpg",
    "size": 1024000,
    "url": "https://your-domain.com/cdn/abc123",
    "views": 42,
    "createdAt": "2026-01-01T14:30:00Z"
  }
}`}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List Images */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded border border-blue-500/20">GET</span>
                                        <code className="text-white font-mono">/images</code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">List all your images with pagination</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-white mb-2">Query Parameters:</p>
                                    <div className="bg-black/50 rounded-lg border border-border p-3 text-xs font-mono text-gray-300">
                                        <div><span className="text-cyan-400">page</span>: number (default: 1)</div>
                                        <div><span className="text-cyan-400">limit</span>: number (default: 20, max: 100)</div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-white mb-2">Response (200 OK):</p>
                                    <div className="bg-black/50 rounded-lg border border-border p-3">
                                        <pre className="text-xs font-mono text-gray-300 overflow-x-auto">{`{
  "success": true,
  "images": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}`}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delete Image */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded border border-red-500/20">DELETE</span>
                                        <code className="text-white font-mono">/images/:id</code>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Delete an image from your library</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-white mb-2">Response (200 OK):</p>
                                    <div className="bg-black/50 rounded-lg border border-border p-3">
                                        <pre className="text-xs font-mono text-gray-300 overflow-x-auto">{`{
  "success": true,
  "message": "Image deleted successfully"
}`}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Code Examples */}
                <div className="bg-card backdrop-blur-xl rounded-3xl border border-border p-8 space-y-6 shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500">
                    <div>
                        <h3 className="text-xl font-bold text-white font-display">Code Examples</h3>
                        <p className="text-muted-foreground mt-1">Ready-to-use code snippets for common operations</p>
                    </div>

                    <div className="space-y-4">
                        {/* cURL Example */}
                        <div className="bg-black/50 rounded-xl border border-border overflow-hidden">
                            <div className="flex items-center px-4 py-2 border-b border-border bg-white/5">
                                <span className="text-xs font-medium text-muted-foreground pr-4 border-r border-border mr-4">cURL</span>
                                <span className="text-xs font-medium text-muted-foreground">Upload Image</span>
                            </div>
                            <pre className="p-4 text-sm text-gray-300 overflow-x-auto font-mono">
                                {`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/upload \\
  -H "x-api-key: YOUR_API_KEY" \\
  -F "file=@/path/to/image.jpg"`}
                            </pre>
                        </div>

                        {/* JavaScript/Node.js Example */}
                        <div className="bg-black/50 rounded-xl border border-border overflow-hidden">
                            <div className="flex items-center px-4 py-2 border-b border-border bg-white/5">
                                <span className="text-xs font-medium text-muted-foreground pr-4 border-r border-border mr-4">JavaScript</span>
                                <span className="text-xs font-medium text-muted-foreground">Upload Image</span>
                            </div>
                            <pre className="p-4 text-sm text-gray-300 overflow-x-auto font-mono">
                                {`const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/upload', {
  method: 'POST',
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  },
  body: formData
});

const data = await response.json();
console.log('Uploaded:', data.url);`}
                            </pre>
                        </div>

                        {/* Python Example */}
                        <div className="bg-black/50 rounded-xl border border-border overflow-hidden">
                            <div className="flex items-center px-4 py-2 border-b border-border bg-white/5">
                                <span className="text-xs font-medium text-muted-foreground pr-4 border-r border-border mr-4">Python</span>
                                <span className="text-xs font-medium text-muted-foreground">Upload Image</span>
                            </div>
                            <pre className="p-4 text-sm text-gray-300 overflow-x-auto font-mono">
                                {`import requests

url = '${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/upload'
headers = {'x-api-key': 'YOUR_API_KEY'}
files = {'file': open('image.jpg', 'rb')}

response = requests.post(url, headers=headers, files=files)
data = response.json()
print(f"Uploaded: {data['url']}")`}
                            </pre>
                        </div>

                        {/* Node.js with Axios */}
                        <div className="bg-black/50 rounded-xl border border-border overflow-hidden">
                            <div className="flex items-center px-4 py-2 border-b border-border bg-white/5">
                                <span className="text-xs font-medium text-muted-foreground pr-4 border-r border-border mr-4">Node.js</span>
                                <span className="text-xs font-medium text-muted-foreground">List Images with Axios</span>
                            </div>
                            <pre className="p-4 text-sm text-gray-300 overflow-x-auto font-mono">
                                {`const axios = require('axios');

const getImages = async () => {
  const response = await axios.get(
    '${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/images?page=1&limit=20',
    {
      headers: {
        'x-api-key': 'YOUR_API_KEY'
      }
    }
  );
  
  console.log(\`Total images: \${response.data.pagination.total}\`);
  return response.data.images;
};

getImages();`}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Error Codes */}
                <div className="bg-card backdrop-blur-xl rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-xl font-bold text-white font-display">Error Codes</h3>
                        <p className="text-muted-foreground mt-1">Common HTTP status codes and error responses</p>
                    </div>

                    <div className="divide-y divide-border">
                        <div className="p-4 flex items-start gap-4">
                            <code className="text-red-400 font-mono text-sm font-bold">401</code>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium">Unauthorized</p>
                                <p className="text-muted-foreground text-xs mt-1">Invalid or missing API key</p>
                            </div>
                        </div>
                        <div className="p-4 flex items-start gap-4">
                            <code className="text-orange-400 font-mono text-sm font-bold">403</code>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium">Forbidden</p>
                                <p className="text-muted-foreground text-xs mt-1">Insufficient permissions or plan limits exceeded</p>
                            </div>
                        </div>
                        <div className="p-4 flex items-start gap-4">
                            <code className="text-yellow-400 font-mono text-sm font-bold">404</code>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium">Not Found</p>
                                <p className="text-muted-foreground text-xs mt-1">Resource doesn't exist</p>
                            </div>
                        </div>
                        <div className="p-4 flex items-start gap-4">
                            <code className="text-orange-400 font-mono text-sm font-bold">413</code>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium">Payload Too Large</p>
                                <p className="text-muted-foreground text-xs mt-1">File size exceeds plan limits</p>
                            </div>
                        </div>
                        <div className="p-4 flex items-start gap-4">
                            <code className="text-red-400 font-mono text-sm font-bold">500</code>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium">Internal Server Error</p>
                                <p className="text-muted-foreground text-xs mt-1">Something went wrong on our end</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rate Limits */}
                <div className="bg-card backdrop-blur-xl rounded-3xl border border-border p-8 space-y-4 shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500">
                    <div className="flex items-start gap-4">
                        <Shield className="h-6 w-6 text-cyan-400 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white">Rate Limits</h3>
                            <p className="text-sm text-muted-foreground mt-1">API rate limits vary by plan:</p>
                            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <span className="text-cyan-400">•</span>
                                    <span><strong className="text-white">Free:</strong> 100 requests/hour</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-cyan-400">•</span>
                                    <span><strong className="text-white">Pro:</strong> 1,000 requests/hour</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-cyan-400">•</span>
                                    <span><strong className="text-white">Enterprise:</strong> Unlimited</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Generate Confirmation Modal */}
            {showGenerateConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#17181c] p-8 rounded-3xl border border-[#1da1f2]/20 max-w-md w-full space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-[#1da1f2]/10 flex items-center justify-center">
                                <Key className="h-6 w-6 text-[#1da1f2]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Generate API Key?</h3>
                                <p className="text-sm text-[#72767a]">Create a new access token</p>
                            </div>
                        </div>

                        <div className="bg-[#1da1f2]/5 border border-[#1da1f2]/10 rounded-xl p-4">
                            <p className="text-sm text-[#72767a] mb-2">
                                <strong className="text-white">Important:</strong>
                            </p>
                            <ul className="space-y-1 text-sm text-[#72767a]">
                                <li>• Copy the key immediately after generation</li>
                                <li>• You won't be able to see it again</li>
                                <li>• Store it securely (password manager recommended)</li>
                                <li>• Never share it or commit to version control</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowGenerateConfirm(false)}
                                variant="outline"
                                className="flex-1 border-[#242628] hover:bg-[#242628]"
                                disabled={isGenerating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={generateKey}
                                isLoading={isGenerating}
                                className="flex-1 bg-[#1da1f2] hover:bg-[#1a91da] text-white border-0"
                            >
                                Generate Key
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Key Display Modal */}
            {newlyGeneratedKey && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#17181c] p-8 rounded-3xl border border-green-500/20 max-w-lg w-full space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                <Key className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">API Key Generated!</h3>
                                <p className="text-sm text-gray-400">Save this key now</p>
                            </div>
                        </div>

                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-yellow-200">Copy this key now!</p>
                                    <p className="text-xs text-yellow-300/80 mt-1">
                                        For security reasons, you won't be able to see it again.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#72767a] uppercase tracking-wider">Your API Key</label>
                            <div className="flex items-center gap-2 bg-black border border-[#242628] rounded-xl px-4 py-3">
                                <code className="flex-1 text-sm text-white font-mono break-all">
                                    {newlyGeneratedKey}
                                </code>
                                <Button
                                    onClick={() => copyToClipboard(newlyGeneratedKey)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#1da1f2] hover:text-[#1a91da]"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={() => setNewlyGeneratedKey(null)}
                            className="w-full bg-green-500 hover:bg-green-400 text-black border-0"
                        >
                            I've Saved My Key
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
