'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Settings, X } from 'lucide-react';

export default function TestingPlanToggle() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState('free');
    const [loading, setLoading] = useState(false);

    // Fetch current plan on mount
    useEffect(() => {
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => {
                if (data.plan) {
                    setCurrentPlan(data.plan);
                }
            })
            .catch(err => console.error('Failed to load plan:', err));
    }, []);

    const plans = [
        { id: 'free', name: 'Free', color: 'bg-gray-500' },
        { id: 'pro', name: 'Pro', color: 'bg-purple-500' },
        { id: 'enterprise', name: 'Enterprise', color: 'bg-cyan-500' }
    ];

    const handlePlanChange = async (planId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/testing/change-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planId })
            });

            if (res.ok) {
                setCurrentPlan(planId);
                // Refresh the page to update stats
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to change plan:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
                title="Testing Panel"
            >
                <Settings className="h-5 w-5 animate-spin-slow" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Testing Panel</h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-400 mb-3">Switch Plan (Testing Only)</p>
                <div className="space-y-2">
                    {plans.map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => handlePlanChange(plan.id)}
                            disabled={loading}
                            className={`w-full p-3 rounded-xl border transition-all ${currentPlan === plan.id
                                ? 'border-cyan-500 bg-cyan-500/10 text-white'
                                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{plan.name}</span>
                                {currentPlan === plan.id && (
                                    <span className="text-xs bg-cyan-500 text-white px-2 py-1 rounded-full">
                                        Active
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-xs text-gray-500 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                ⚠️ This is for testing only. Remove before production.
            </div>
        </div>
    );
}
