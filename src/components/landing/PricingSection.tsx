'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { PLANS, PlanType } from '@/config/plans';

export const PricingSection = () => {
    return (
        <section className="py-24 bg-black relative" id="pricing">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-bold tracking-tight text-white font-display mb-4">
                        Upgrade your stack
                    </h2>
                    <p className="text-gray-400">
                        Scale your image infrastructure with our enterprise-grade plans.
                        Zero bandwidth fees, forever using Telegram's backbone.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {(Object.keys(PLANS) as PlanType[]).map((key) => {
                        const plan = PLANS[key];
                        const isMostPopular = key === 'pro';

                        return (
                            <div
                                key={key}
                                className={`relative flex flex-col p-8 rounded-2xl border ${isMostPopular
                                    ? 'border-[#1da1f2] bg-[#1da1f2]/10 shadow-[0_0_50px_-10px_rgba(29,161,242,0.3)] transform md:-translate-y-4'
                                    : 'border-[#242628] bg-[#17181c]'
                                    } backdrop-blur-sm transition-all hover:bg-[#17181c]`}
                            >
                                {isMostPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1da1f2] text-white text-xs px-3 py-1 rounded-full font-medium">
                                        Most popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-white">${plan.price}</span>
                                        <span className="text-[#72767a] text-sm">/month</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-[#e7e9ea]">
                                            <Check className="h-5 w-5 text-[#1da1f2] shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/login">
                                    <Button
                                        variant={isMostPopular ? 'primary' : 'outline'}
                                        className={`w-full ${isMostPopular ? 'bg-white text-black hover:bg-gray-200' : 'text-[#72767a] hover:text-white'}`}
                                    >
                                        {key === 'enterprise' ? 'Contact Sales' : 'Get started'}
                                    </Button>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
