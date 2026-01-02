'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { User, Mail, Shield, Trash2, Bell, Key } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: ''
    });

    // Load user data
    useEffect(() => {
        async function loadProfile() {
            try {
                setIsLoading(true);
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        username: data.username || '',
                        email: data.email || ''
                    });
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (session) {
            loadProfile();
        }
    }, [session]);

    const handleSave = async () => {
        if (!formData.username.trim()) {
            setMessage({ type: 'error', text: 'Username is required' });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                // Update session
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: data.user.username
                    }
                });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/account', {
                method: 'DELETE'
            });

            if (res.ok) {
                // Sign out and redirect to home
                window.location.href = '/api/auth/signout';
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Failed to delete account' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white font-display">Settings</h1>
                <p className="text-[#72767a] mt-1">Manage your account preferences and security configuration.</p>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`p-4 rounded-xl border ${message.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-card backdrop-blur-xl p-8 rounded-3xl border border-border space-y-6 shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500"
            >
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <h2 className="text-xl font-semibold text-white font-display">Profile Information</h2>
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        disabled={isLoading}
                        className="text-xs h-8 bg-[#1da1f2] hover:bg-[#1a91da] text-white border-0"
                    >
                        Save Changes
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-white/10 ring-4 ring-white/5 transition-transform group-hover:scale-105 duration-300">
                            {session?.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt="Profile"
                                    width={96}
                                    height={96}
                                    className="object-cover h-full w-full"
                                />
                            ) : (
                                <div className="h-full w-full bg-[#1da1f2]/10 flex items-center justify-center">
                                    <User className="h-10 w-10 text-[#1da1f2]" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 w-full">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</label>
                                <div className="flex items-center gap-3 bg-black/50 border border-border rounded-xl px-4 py-3 text-gray-300 focus-within:border-[#1da1f2]/50 focus-within:ring-1 focus-within:ring-[#1da1f2]/50 transition-all">
                                    <User size={16} className="text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="flex-1 bg-transparent outline-none text-white placeholder:text-muted-foreground"
                                        placeholder="Enter username"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                                <div className="flex items-center gap-3 bg-black/50 border border-border rounded-xl px-4 py-3 text-gray-300 focus-within:border-[#1da1f2]/50 focus-within:ring-1 focus-within:ring-[#1da1f2]/50 transition-all">
                                    <Mail size={16} className="text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="flex-1 bg-transparent outline-none text-white placeholder:text-muted-foreground"
                                        placeholder="Enter email"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Notifications & Security */}
            <div className="grid gap-8 md:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-card backdrop-blur-xl p-8 rounded-3xl border border-border space-y-6 shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500"
                >
                    <h2 className="text-xl font-semibold text-white font-display flex items-center gap-2">
                        <Bell className="h-5 w-5 text-[#1da1f2]" />
                        Notifications
                    </h2>

                    <div className="space-y-4">
                        {[
                            { label: 'Email Alerts', desc: 'Receive updates about your account usage', active: true },
                            { label: 'Security Alerts', desc: 'Notify on suspicious login attempts', active: true },
                            { label: 'Marketing', desc: 'Product updates and offers', active: false },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                <div>
                                    <p className="text-sm font-medium text-white">{item.label}</p>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${item.active ? 'bg-[#1da1f2]/20' : 'bg-black/40'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-current transition-transform ${item.active ? 'translate-x-4 text-[#1da1f2]' : 'text-muted-foreground'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-card backdrop-blur-xl p-8 rounded-3xl border border-border space-y-6 shadow-sm hover:shadow-[0_0_25px_rgba(29,161,242,0.1)] transition-all duration-500"
                >
                    <h2 className="text-xl font-semibold text-white font-display flex items-center gap-2">
                        <Shield className="h-5 w-5 text-[#1da1f2]" />
                        Security
                    </h2>

                    <div className="space-y-4">
                        <div className="p-4 bg-black/50 border border-border rounded-xl flex items-center gap-4 hover:border-[#1da1f2]/30 transition-colors">
                            <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">2FA Authentication</p>
                                <p className="text-xs text-green-400">Enabled via Google/Telegram</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">Configure</Button>
                        </div>

                        <div className="p-4 bg-black/50 border border-border rounded-xl flex items-center gap-4 hover:border-[#1da1f2]/30 transition-colors">
                            <div className="h-10 w-10 bg-[#1da1f2]/10 rounded-lg flex items-center justify-center text-[#1da1f2]">
                                <Key className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">API Keys</p>
                                <p className="text-xs text-muted-foreground">Manage access tokens</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">Manage</Button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-card backdrop-blur-xl p-8 rounded-3xl border border-red-500/10 space-y-6 relative overflow-hidden shadow-sm hover:shadow-[0_0_25px_rgba(244,33,46,0.1)] transition-all duration-500"
            >
                <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
                <h2 className="text-xl font-semibold text-red-400 font-display flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                </h2>

                <div className="flex items-center justify-between border-t border-red-500/10 pt-6">
                    <div>
                        <p className="text-sm font-medium text-white">Delete Account</p>
                        <p className="text-xs text-muted-foreground mt-1">Permanently remove your account and all of its contents.</p>
                    </div>
                    <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="outline"
                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20 hover:text-red-300"
                    >
                        Delete Account
                    </Button>
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel p-8 rounded-3xl border border-red-500/20 max-w-md w-full space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                <Trash2 className="h-6 w-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Delete Account?</h3>
                                <p className="text-sm text-gray-400">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                            <p className="text-sm text-gray-300">
                                This will permanently delete:
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-gray-400">
                                <li>• All your uploaded images</li>
                                <li>• Your API keys</li>
                                <li>• All account data</li>
                                <li>• Your usage statistics</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowDeleteConfirm(false)}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteAccount}
                                isLoading={isDeleting}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
                            >
                                Delete Everything
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
