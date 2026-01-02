'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Menu, X, Camera, LogOut, LayoutDashboard, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    return (
        <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
            <div className="bg-[#17181c]/80 backdrop-blur-xl border border-[#242628] rounded-full px-6 py-3 flex items-center justify-between w-full max-w-5xl shadow-2xl shadow-black/50">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <Image
                        src="/logo/logo.png"
                        alt="Logo"
                        width={120}
                        height={120}
                        className="transition-opacity group-hover:opacity-80"
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</Link>
                    <Link href="/pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</Link>
                    <Link href="/faq" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">FAQ</Link>
                    <Link href="/about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">About</Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {session ? (
                        <>
                            <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                    {session.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt="Avatar"
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#1da1f2] to-[#1c9cf0] flex items-center justify-center shadow-[0_0_10px_rgba(29,161,242,0.5)]">
                                            <User className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                    <span className="text-sm text-white font-medium">{session.user?.name}</span>
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                                Log in
                            </Link>
                            <Link href="/login">
                                <Button size="sm" className="bg-white text-black hover:bg-gray-200 rounded-full px-6 font-medium">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-400 hover:text-white p-1"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-20 left-4 right-4 bg-[#17181c]/95 backdrop-blur-xl border border-[#242628] rounded-2xl p-4 md:hidden flex flex-col gap-2 shadow-2xl"
                    >
                        <Link href="/features" className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all" onClick={() => setIsOpen(false)}>Features</Link>
                        <Link href="/pricing" className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all" onClick={() => setIsOpen(false)}>Pricing</Link>
                        <Link href="/faq" className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all" onClick={() => setIsOpen(false)}>FAQ</Link>
                        <Link href="/about" className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl transition-all" onClick={() => setIsOpen(false)}>About</Link>
                        <div className="h-px bg-white/10 my-2" />

                        {session ? (
                            <>
                                <div className="flex items-center gap-2 px-4 py-3">
                                    {session.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt="Avatar"
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1da1f2] to-[#1c9cf0] flex items-center justify-center shadow-[0_0_10px_rgba(29,161,242,0.5)]">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                    <span className="text-white font-medium">{session.user?.name}</span>
                                </div>
                                <Link href="/dashboard" className="text-center text-white bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2" onClick={() => setIsOpen(false)}>
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        signOut({ callbackUrl: '/' });
                                    }}
                                    className="text-center text-white bg-red-500/10 hover:bg-red-500/20 px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-center gap-2 border border-red-500/20"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-center text-white bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition-all font-medium" onClick={() => setIsOpen(false)}>Log in</Link>
                                <Link href="/login" className="text-center" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-xl">Get Started</Button>
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
