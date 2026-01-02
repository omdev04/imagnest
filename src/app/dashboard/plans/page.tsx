'use client';

import { useSession } from 'next-auth/react';
import { Check, CreditCard, Zap, Shield, Star, Rocket } from 'lucide-react';
import { PLANS, PlanType } from '@/config/plans';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // @ts-ignore
    const currentPlan = session?.user?.plan || 'free';

    const handlePlanChange = (plan: string) => {
        if (plan === currentPlan) return;
        setLoading(true);
        router.push(`/dashboard/payment?plan=${plan}`);
    };

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'free': return <Star className="h-6 w-6 text-gray-400" />;
            case 'pro': return <Zap className="h-6 w-6 text-yellow-400" />;
            case 'enterprise': return <Rocket className="h-6 w-6 text-purple-400" />;
            default: return <Star />;
        }
    };

    // New color scheme matching dashboard
    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'free': return 'from-gray-700 to-gray-900 border-gray-600';
            case 'pro': return 'from-yellow-900/40 to-yellow-900/10 border-yellow-500/50';
            case 'enterprise': return 'from-purple-900/40 to-purple-900/10 border-purple-500/50';
            default: return 'from-gray-800 to-gray-900';
        }
    };

    return (
        <div className="p-6 md:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h1>
                <p className="text-[#8B9EFF]">
                    Unlock higher limits and premium features. Upgrade or downgrade at any time.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {(Object.entries(PLANS) as [string, typeof PLANS.free][]).map(([key, plan]) => {
                    const isCurrent = currentPlan === key;
                    const isEnterprise = key === 'enterprise';

                    return (
                        <div
                            key={key}
                            className={`relative bg-gradient-to-b ${getPlanColor(key)} backdrop-blur-xl border rounded-2xl p-8 flex flex-col transition-all duration-300 ${isCurrent ? 'ring-2 ring-white/20 scale-105 shadow-2xl' : 'hover:shadow-xl hover:-translate-y-1'}`}
                        >
                            {isCurrent && (
                                <div className="absolute -top-4 inset-x-0 flex justify-center">
                                    <span className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Current Plan
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-white/5 rounded-xl">
                                    {getPlanIcon(key)}
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                                    <span className="text-gray-400 text-sm">/mo</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-gray-400 text-sm mb-6 h-10">
                                {key === 'free' && 'Perfect for starters'}
                                {key === 'pro' && 'For power users needing privacy'}
                                {key === 'enterprise' && 'For large scale applications'}
                            </p>

                            <button
                                onClick={() => handlePlanChange(key)}
                                disabled={isCurrent}
                                className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${isCurrent
                                    ? 'bg-white/10 text-gray-400 cursor-default'
                                    : 'bg-[#0110FC] hover:bg-[#010FCC] text-white shadow-lg hover:shadow-[#0110FC]/25'
                                    }`}
                            >
                                {isCurrent ? 'Active Plan' : `Upgrade to ${plan.name}`}
                            </button>

                            <div className="mt-8 space-y-4 flex-1">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Features</p>
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-400 shrink-0" />
                                        <span className="text-sm text-gray-300">{feature}</span>
                                    </div>
                                ))}

                                <div className="border-t border-white/5 my-4 pt-4 space-y-2">
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <Shield className="h-4 w-4" />
                                        {key === 'free' ? 'Public Access Only' : 'Private Access'}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <CreditCard className="h-4 w-4" />
                                        {plan.limits.dailyUploads} Uploads/Day
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
