'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const CTA = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="relative isolate overflow-hidden bg-[#17181c] px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16 border border-[#242628]">

                    {/* Background Effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1da1f2]/10 blur-[100px] rounded-full pointing-events-none" />

                    <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl font-display relative z-10">
                        Ready to speed up your user experience?
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#72767a] relative z-10">
                        Join 10,000+ developers using Imagnest to host and serve millions of images every day.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6 relative z-10">
                        <Link href="/login">
                            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold px-8">
                                Get started for free
                            </Button>
                        </Link>
                        <Link href="/features" className="text-sm font-semibold leading-6 text-white hover:text-[#1da1f2] transition-colors">
                            Learn more <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
