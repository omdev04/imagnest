'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AnimatedBackground } from './AnimatedBackground';
import { motion } from 'framer-motion';

export const Hero = () => {
    return (
        <div className="relative isolate min-h-screen flex flex-col justify-center items-center overflow-hidden">
            <AnimatedBackground />

            <div className="text-center px-6 lg:px-8 max-w-4xl mx-auto z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 font-display">
                        The Fastest Image CDN <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1da1f2] via-[#1c9cf0] to-[#00b8d4]">
                            Powered by Telegram
                        </span>
                    </h1>
                    <p className="tex-lg md:text-xl leading-8 text-[#72767a] mb-10 max-w-2xl mx-auto">
                        Host images with unlimited scalability, enterprise-grade security, and zero bandwidth costs.
                        The modern infrastructure for your next big project.
                    </p>
                    <div className="flex items-center justify-center gap-x-6">
                        <Link href="/login">
                            <Button size="lg" className="rounded-full px-8 text-base bg-gradient-to-r from-[#1da1f2] to-[#1c9cf0] hover:shadow-[0_0_30px_rgba(29,161,242,0.5)] border border-[#1da1f2]/50">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="#contact">
                            <Button variant="outline" size="lg" className="rounded-full px-8 text-base border-[#1da1f2]/30 text-white hover:bg-[#1da1f2]/10 hover:border-[#1da1f2]/50">
                                Contact Sales
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Abstract Dashboard Preview (The "Mosaic") */}
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-16 relative w-full max-w-5xl mx-auto px-4 perspective-[1000px]"
            >
                <div className="relative rounded-t-xl bg-[#17181c]/90 border border-[#242628] p-2 shadow-2xl backdrop-blur-xl -rotate-x-12 transform-gpu shadow-[0_0_60px_rgba(29,161,242,0.15)]">
                    <div className="rounded-lg bg-[#000000] aspect-[16/9] border border-[#242628] overflow-hidden flex items-center justify-center">
                        <div className="text-[#1da1f2] font-mono text-sm">Dashboard Preview UI</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
