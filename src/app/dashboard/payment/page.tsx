'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PLANS, PlanType } from '@/config/plans';
import { CheckCircle, CreditCard, Shield, Lock } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

function PaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, update } = useSession();
    const planKey = searchParams.get('plan') as PlanType;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Validate plan
    const plan = PLANS[planKey];

    if (!planKey || !plan) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-red-400 mb-4">Invalid plan selected</p>
                <button
                    onClick={() => router.push('/dashboard/plans')}
                    className="text-white bg-[#0110FC] px-4 py-2 rounded-lg"
                >
                    Back to Plans
                </button>
            </div>
        );
    }

    const handlePayment = async () => {
        setLoading(true);

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const res = await fetch('/api/user/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planKey })
            });

            if (!res.ok) throw new Error('Payment failed');

            // Force session update
            await update({
                ...session,
                user: {
                    ...session?.user,
                    plan: planKey
                }
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard/plans');
                router.refresh();
            }, 3000);

        } catch (error) {
            console.error(error);
            alert('Payment processing failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                <p className="text-gray-400 mb-8">Your plan has been upgraded to {plan.name}.Redirecting...</p>
                <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 animate-[loading_3s_ease-in-out_forwards]" style={{ width: '100%' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold text-white mb-8">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="space-y-6">
                    <div className="bg-[#16181c] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                            <div>
                                <h3 className="text-white font-medium">{plan.name} Plan</h3>
                                <p className="text-sm text-gray-500">Monthly subscription</p>
                            </div>
                            <span className="text-xl font-bold text-white">${plan.price}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 text-white font-bold">
                            <span>Total</span>
                            <span>${plan.price}</span>
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-sm text-blue-200">
                        <Shield className="h-5 w-5 shrink-0" />
                        <p>Secure SSL encrypted payment. Your card details are never stored on our servers.</p>
                    </div>
                </div>

                {/* Simulated Payment Form */}
                <div className="bg-[#16181c] border border-white/10 rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Details
                    </h2>

                    <div className="space-y-4 opacity-50 pointer-events-none select-none">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Card Number</label>
                            <input type="text" value="•••• •••• •••• 4242" readOnly className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Expiry</label>
                                <input type="text" value="12/28" readOnly className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">CVC</label>
                                <input type="text" value="•••" readOnly className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-200 mb-4">
                        <p className="flex items-center gap-2">
                            <Lock className="h-3 w-3" />
                            This is a secure mock payment page. No real money will be deducted.
                        </p>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-[#0110FC] hover:bg-[#010FCC] text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Pay $${plan.price}`
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        By clicking pay, you agree to our Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="text-white text-center py-20">Loading checkout...</div>}>
            <PaymentContent />
        </Suspense>
    );
}
