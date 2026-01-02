'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { TelegramLoginButton } from './TelegramLoginButton';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export const LoginView = () => {
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    // You can set this in env NEXT_PUBLIC_TELEGRAM_BOT_NAME
    const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'samplebot';

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        await signIn('google', { callbackUrl: '/dashboard' });
    };

    const handleTelegramAuth = async (user: any) => {
        setIsLoading(true);
        await signIn('telegram-login', {
            ...user,
            callbackUrl: '/dashboard',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[420px] p-8 rounded-[32px] glass-panel shadow-2xl relative z-10 border border-white/5"
        >
            <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-2xl flex items-center justify-center p-3">
                        <Image src="/logo/only_logo_icon.png" alt="Imgnest Logo" width={64} height={64} className="object-contain" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-white font-display mb-3 tracking-tight">
                    Welcome Back
                </h2>
                <p className="text-gray-400 text-[15px] leading-relaxed">
                    Sign in to access your secure image library
                </p>
                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-left">
                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                        <span className="text-sm text-red-200">{decodeURIComponent(error)}</span>
                    </div>
                )}
            </div>

            <div className="space-y-5">
                {/* Google Login */}
                <Button
                    onClick={handleGoogleLogin}
                    isLoading={isLoading}
                    variant="secondary"
                    className="w-full h-12 bg-white text-black hover:bg-gray-100 font-semibold rounded-2xl text-[15px] transition-all hover:scale-[1.02] shadow-lg shadow-white/5"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-3" alt="Google" />
                    Continue with Google
                </Button>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase tracking-widest font-bold">
                        <span className="bg-[#050714] px-4 text-gray-600">Or</span>
                    </div>
                </div>

                {/* Telegram Widget */}
                <div className="flex flex-col items-center justify-center bg-[#29a9ea]/10 border border-[#29a9ea]/20 rounded-2xl p-4 transition-all hover:bg-[#29a9ea]/15">
                    <TelegramLoginButton botName={botName} onAuth={handleTelegramAuth} />
                </div>
            </div>

            <p className="mt-8 text-center text-xs text-gray-500">
                Protected by reCAPTCHA and subject to the Imagnest <Link href="/privacy" className="hover:text-cyan-400 transition-colors underline decoration-gray-700 hover:decoration-cyan-400">Privacy Policy</Link>.
            </p>
        </motion.div>
    );
};
