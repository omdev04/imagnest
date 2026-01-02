'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Database } from 'lucide-react';
import InfiniteGallery from '@/components/ui/InfiniteGallery';

export const HeroPremium = () => {
    // Unsplash stock images for the 3D gallery
    const galleryImages = [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
        'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1200&q=80',
        'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=1200&q=80',
        'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&q=80',
        'https://images.unsplash.com/photo-1618556450783-3c2a58c0f1d6?w=1200&q=80',
        'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=1200&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
        'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=1200&q=80',
    ];

    return (
        <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20 bg-black">
            {/* 3D Gallery Background */}
            <div className="absolute inset-0 z-0">
                <InfiniteGallery
                    images={galleryImages}
                    speed={1}
                    visibleCount={12}
                    disableScroll={true}
                    className="h-full w-full"
                    fadeSettings={{
                        fadeIn: { start: 0.05, end: 0.25 },
                        fadeOut: { start: 0.4, end: 0.43 },
                    }}
                    blurSettings={{
                        blurIn: { start: 0.0, end: 0.1 },
                        blurOut: { start: 0.4, end: 0.43 },
                        maxBlur: 8.0,
                    }}
                />
            </div>

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80 z-[1]" />

            {/* Ambient Background Effects - keeping same background color */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#1da1f2]/20 blur-[120px] rounded-full opacity-40 pointer-events-none z-[1]" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#1c9cf0]/10 blur-[100px] rounded-full opacity-30 pointer-events-none z-[1]" />



            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center [mix-blend-mode:difference]">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-[#1da1f2] mb-8 backdrop-blur-md shadow-lg"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1da1f2] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1da1f2]"></span>
                    </span>
                    Production Ready Image Infrastructure
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 font-display leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                >
                    The modern, secure way to <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#72767a]">
                        host & deliver images
                    </span>
                </motion.h1>

                {/* Subline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-[#72767a] mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                >
                    Store and serve your images through a privacy-first, Telegram-powered infrastructure with enterprise-grade control, caching and reliability.
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <Link href="/login">
                        <Button size="lg" className="h-12 px-8 rounded-full bg-white text-black hover:bg-gray-200 text-base font-semibold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                            Get Started Free
                        </Button>
                    </Link>
                </motion.div>

                {/* Badges Row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-500"
                >
                    <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Secure</div>
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Private</div>
                    <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Fast</div>
                    <div className="flex items-center gap-2"><Database className="w-4 h-4" /> Telegram Compliant</div>
                </motion.div>
            </div>
        </section>
    );
};
