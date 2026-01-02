'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, X, Copy, Check, File as FileIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FileWithPreview extends File {
    preview?: string;
}

interface UploadProgress {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    url?: string;
    error?: string;
    preview?: string;
}

const MAX_FILES = 10;

export const UploadZone = () => {
    const [files, setFiles] = useState<UploadProgress[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedResults, setUploadedResults] = useState<{ url: string; name: string }[]>([]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/')
        );

        if (droppedFiles.length > MAX_FILES) {
            alert(`You can only upload up to ${MAX_FILES} images at once`);
            return;
        }

        addFiles(droppedFiles);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).filter(
                file => file.type.startsWith('image/')
            );

            if (selectedFiles.length > MAX_FILES) {
                alert(`You can only upload up to ${MAX_FILES} images at once`);
                e.target.value = '';
                return;
            }

            addFiles(selectedFiles);
            e.target.value = '';
        }
    };

    const addFiles = (newFiles: File[]) => {
        const fileProgress: UploadProgress[] = newFiles.map(file => ({
            file,
            progress: 0,
            status: 'pending' as const,
            preview: URL.createObjectURL(file)
        }));

        setFiles(fileProgress);
        setUploadedResults([]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => {
            const updated = prev.filter((_, i) => i !== index);
            // Cleanup preview URL
            if (prev[index].preview) {
                URL.revokeObjectURL(prev[index].preview!);
            }
            return updated;
        });
    };

    const uploadAll = async () => {
        if (files.length === 0) return;

        setUploading(true);
        const results: { url: string; name: string }[] = [];

        // Upload files one by one for better tracking
        for (let i = 0; i < files.length; i++) {
            const fileProgress = files[i];

            // Update status to uploading
            setFiles(prev => {
                const updated = [...prev];
                updated[i] = { ...updated[i], status: 'uploading', progress: 0 };
                return updated;
            });

            const formData = new FormData();
            formData.append('file', fileProgress.file);
            formData.append('privacy', 'public');

            try {
                const res = await axios.post('/api/upload', formData, {
                    onUploadProgress: (p) => {
                        const progress = p.total ? Math.round((p.loaded * 100) / p.total) : 0;
                        setFiles(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], progress };
                            return updated;
                        });
                    }
                });

                if (res.data.success) {
                    const url = window.location.origin + res.data.image.url;
                    results.push({
                        url,
                        name: res.data.image.name
                    });

                    setFiles(prev => {
                        const updated = [...prev];
                        updated[i] = {
                            ...updated[i],
                            status: 'completed',
                            progress: 100,
                            url
                        };
                        return updated;
                    });
                }
            } catch (err: any) {
                console.error('Upload error:', err.response?.data);
                setFiles(prev => {
                    const updated = [...prev];
                    updated[i] = {
                        ...updated[i],
                        status: 'error',
                        error: err.response?.data?.error || 'Upload failed'
                    };
                    return updated;
                });
            }
        }

        setUploading(false);
        setUploadedResults(results);
    };

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const copyToClipboard = (url: string, index: number) => {
        navigator.clipboard.writeText(url);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const reset = () => {
        files.forEach(f => {
            if (f.preview) URL.revokeObjectURL(f.preview);
        });
        setFiles([]);
        setUploadedResults([]);
    };

    const allCompleted = files.length > 0 && files.every(f => f.status === 'completed');

    return (
        <div className="w-full max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                {files.length === 0 ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                            "relative rounded-xl border-2 border-dashed p-12 transition-all text-center",
                            isDragging ? "border-[#1da1f2] bg-[#1da1f2]/10" : "border-[#2f3336] bg-black hover:bg-[#0a0a0a] backdrop-blur-xl"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            className="hidden"
                            id="file-upload"
                            onChange={handleFileSelect}
                            accept="image/*"
                            multiple
                        />

                        <div className="flex flex-col items-center">
                            <div className="h-20 w-20 rounded-full bg-[#1da1f2]/15 flex items-center justify-center mb-4 border border-[#1da1f2]/30">
                                <Upload className="h-10 w-10 text-[#1da1f2]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Upload Images</h3>
                            <p className="text-[#72767a] mb-2">Drag & Drop or Click to Select</p>
                            <p className="text-[#72767a]/60 text-sm mb-6">Upload up to {MAX_FILES} images at once</p>
                            <Button
                                variant="secondary"
                                className="cursor-pointer bg-[#1da1f2] hover:bg-[#1a91da] text-white border-0"
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                Browse Device
                            </Button>
                        </div>
                    </motion.div>
                ) : !allCompleted ? (
                    <motion.div
                        key="uploading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">
                                Selected Files ({files.length}/{MAX_FILES})
                            </h3>
                            {!uploading && (
                                <Button variant="ghost" size="sm" onClick={reset}>
                                    Clear All
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {files.map((fileProgress, index) => (
                                <div
                                    key={index}
                                    className="bg-black backdrop-blur-xl border border-[#2f3336] rounded-xl p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Preview */}
                                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-black border border-[#242628] flex-shrink-0">
                                            {fileProgress.preview ? (
                                                <Image
                                                    src={fileProgress.preview}
                                                    alt={fileProgress.file.name}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="w-full h-full p-4 text-[#72767a]" />
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{fileProgress.file.name}</p>
                                            <p className="text-[#72767a] text-sm">
                                                {(fileProgress.file.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>

                                            {/* Progress Bar */}
                                            {fileProgress.status === 'uploading' && (
                                                <div className="mt-2">
                                                    <div className="h-1.5 bg-[#242628] rounded-full overflow-hidden border border-[#242628]">
                                                        <motion.div
                                                            className="h-full bg-gradient-to-r from-[#1da1f2] to-[#1c9cf0]"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${fileProgress.progress}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-[#72767a] mt-1">{fileProgress.progress}%</p>
                                                </div>
                                            )}

                                            {fileProgress.status === 'error' && (
                                                <p className="text-red-400 text-sm mt-1">{fileProgress.error}</p>
                                            )}
                                        </div>

                                        {/* Status Icon */}
                                        <div className="flex-shrink-0">
                                            {fileProgress.status === 'completed' && (
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <Check className="h-5 w-5 text-emerald-400" />
                                                </div>
                                            )}
                                            {fileProgress.status === 'error' && (
                                                <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                                    <X className="h-5 w-5 text-red-400" />
                                                </div>
                                            )}
                                            {fileProgress.status === 'pending' && !uploading && (
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="h-8 w-8 rounded-full hover:bg-red-500/20 flex items-center justify-center transition-colors"
                                                >
                                                    <X className="h-5 w-5 text-[#72767a] hover:text-red-400" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!uploading && (
                            <div className="flex justify-end gap-4 mt-6">
                                <Button variant="ghost" onClick={reset}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={uploadAll}
                                    className="bg-[#1da1f2] hover:bg-[#1a91da] text-white border-0"
                                    disabled={files.length === 0}
                                >
                                    Upload {files.length} {files.length === 1 ? 'Image' : 'Images'}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="bg-black backdrop-blur-xl border border-[#2f3336] rounded-xl p-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                <Check className="h-8 w-8 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Upload Successful!</h3>
                            <p className="text-[#72767a] mb-6">
                                {uploadedResults.length} {uploadedResults.length === 1 ? 'image has' : 'images have'} been secured and cached.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {files.map((fileProgress, index) => (
                                fileProgress.url && (
                                    <div
                                        key={index}
                                        className="bg-black backdrop-blur-xl border border-[#2f3336] rounded-xl p-4"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <ImageIcon className="h-4 w-4 text-[#1da1f2]" />
                                            <span className="text-white text-sm font-medium">{fileProgress.file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-black p-3 rounded-lg border border-[#242628]">
                                            <code className="text-xs text-[#72767a] flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
                                                {fileProgress.url}
                                            </code>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(fileProgress.url!, index)}
                                                className="flex-shrink-0"
                                            >
                                                {copiedIndex === index ? (
                                                    <Check className="h-4 w-4 text-emerald-400" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        <div className="flex justify-center gap-4 mt-6">
                            <Button variant="outline" onClick={reset}>
                                Upload More
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
