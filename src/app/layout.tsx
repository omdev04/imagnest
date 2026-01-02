import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '@/app/globals.css';
import { cn } from '@/lib/utils';
import { NextAuthProvider } from '@/components/providers';
import { ToastProvider } from '@/contexts/ToastContext';

import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';
import MaintenanceScreen from '@/components/MaintenanceScreen';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: 'Imagnest - Fastest Image CDN',
    description: 'Secure image hosting powered by Telegram, cached globally for lightning-fast delivery.',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
    },
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check Maintenance Mode
    let maintenanceMode = false;
    let isAdmin = false;

    try {
        await dbConnect();
        const setting = await Setting.findOne({ key: 'maintenanceMode' });
        maintenanceMode = setting?.value === true;
    } catch (error) {
        console.error("Failed to check maintenance mode:", error);
    }

    if (maintenanceMode) {
        const headersList = await headers();
        const pathname = headersList.get('x-pathname') || "";

        // Allow access to login page and API routes (except maybe some APIs should be blocked, but let's keep it simple)
        // We block the main UI. API routes might need their own check if critical.
        if (!pathname.startsWith('/login') && !pathname.startsWith('/api/auth')) {
            const session = await getServerSession(authOptions);
            // @ts-ignore
            const role = session?.user?.role;
            isAdmin = role === 'admin' || role === 'superadmin';

            if (!isAdmin) {
                return (
                    <html lang="en" className="dark">
                        <body className={cn(inter.variable, outfit.variable, "font-sans antialiased bg-black min-h-screen")}>
                            <MaintenanceScreen />
                        </body>
                    </html>
                );
            }
        }
    }

    return (
        <html lang="en" className="dark">
            <body className={cn(inter.variable, outfit.variable, "font-sans antialiased bg-black min-h-screen")}>
                <NextAuthProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </NextAuthProvider>
            </body>
        </html>
    );
}
