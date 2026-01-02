'use client';

import { LoginView } from '@/components/auth/LoginView';
import { Suspense } from 'react';

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#000212]">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <LoginView />
            </Suspense>
        </div>
    );
}
