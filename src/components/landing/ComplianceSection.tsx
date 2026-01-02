'use client';

import { ShieldCheck, MessageSquare, Server, Lock } from 'lucide-react';

export const ComplianceSection = () => {
    return (
        <section className="py-24 bg-black relative border-t border-[#242628]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-sm text-green-400 mb-6">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Policy Aligned. Safe. Transparent.</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-6 font-display">
                        Built Responsibly using Telegram Infrastructure
                    </h2>
                    <p className="text-[#72767a] text-lg leading-relaxed">
                        Imagnest is a legitimate responsible technology layer. We do not bypass Telegram limitations, exploit their ecosystem, or allow abuse.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-panel p-6 rounded-xl hover:bg-[#1da1f2]/5 transition-colors border border-[#242628] bg-[#17181c]">
                        <MessageSquare className="w-8 h-8 text-[#1da1f2] mb-4" />
                        <h3 className="text-white font-semibold mb-2">Telegram Compliant</h3>
                        <p className="text-sm text-[#72767a]">
                            Fully aligned with Telegram Bot Platform Policies. We respect the ecosystem usage limits.
                        </p>
                    </div>

                    <div className="glass-panel p-6 rounded-xl hover:bg-[#1da1f2]/5 transition-colors border border-[#242628] bg-[#17181c]">
                        <Lock className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="text-white font-semibold mb-2">No Illegal Content</h3>
                        <p className="text-sm text-[#72767a]">
                            We strictly prohibit piracy, adult content, and malware. Automated moderation is in place.
                        </p>
                    </div>

                    <div className="glass-panel p-6 rounded-xl hover:bg-[#1da1f2]/5 transition-colors border border-[#242628] bg-[#17181c]">
                        <Server className="w-8 h-8 text-yellow-400 mb-4" />
                        <h3 className="text-white font-semibold mb-2">No Exploits</h3>
                        <p className="text-sm text-[#72767a]">
                            We do not hack or exploit the platform. We use public APIs as intended by Telegram.
                        </p>
                    </div>

                    <div className="glass-panel p-6 rounded-xl hover:bg-[#1da1f2]/5 transition-colors border border-[#242628] bg-[#17181c]">
                        <ShieldCheck className="w-8 h-8 text-green-400 mb-4" />
                        <h3 className="text-white font-semibold mb-2">DMCA Support</h3>
                        <p className="text-sm text-[#72767a]">
                            We respect intellectual property. DMCA takedown requests are processed immediately.
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-[#72767a]">
                        * Users must comply with Telegram Terms of Service at all times.
                    </p>
                </div>
            </div>
        </section>
    );
};
