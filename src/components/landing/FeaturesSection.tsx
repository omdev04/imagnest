'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, Globe, HardDrive, Smartphone, Code } from 'lucide-react';

const features = [
    {
        name: 'Instant Global Delivery',
        description: 'Your images are cached in 200+ edge locations worldwide, ensuring <50ms latency for 99% of your users.',
        icon: Globe,
        color: 'text-[#1da1f2]',
        bg: 'bg-[#1da1f2]/10'
    },
    {
        name: 'Unlimited Storage',
        description: 'Powered by the Telegram Cloud API, you get practically infinite storage without the enterprise price tag.',
        icon: HardDrive,
        color: 'text-[#1c9cf0]',
        bg: 'bg-[#1c9cf0]/10'
    },
    {
        name: 'On-the-fly Optimization',
        description: 'Automatic compression, resizing, and format conversion (WebP/AVIF) to reduce bandwidth by up to 80%.',
        icon: Zap,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10'
    },
    {
        name: 'Enterprise Security',
        description: 'End-to-end encryption, signed URLs, and strict access controls keep your private assets secure.',
        icon: Shield,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10'
    },
    {
        name: 'Developer First API',
        description: 'Simple REST API and SDKs for Node.js, Python, and Go. Integrate in minutes, not days.',
        icon: Code,
        color: 'text-[#72767a]',
        bg: 'bg-[#72767a]/10'
    },
    {
        name: 'Mobile Optimized',
        description: 'Adaptive delivery ensures the perfect image size for every device, improving Core Web Vitals.',
        icon: Smartphone,
        color: 'text-[#00b8d4]',
        bg: 'bg-[#00b8d4]/10'
    },
];

export const FeaturesSection = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#0110FC]/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-display">
                        Everything you need in an <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0110FC] via-[#4D6AFF] to-[#8B9EFF]">Image CDN</span>
                    </h2>
                    <p className="text-[#8B9EFF] text-lg">
                        Stop paying for bandwidth. Start building with the most modern, developer-friendly image infrastructure.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel p-8 rounded-2xl hover:bg-[#0110FC]/5 transition-all group hover:border-[#0110FC]/30 hover:shadow-[0_0_30px_rgba(1,16,252,0.15)]"
                        >
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg} border border-[#0110FC]/20 group-hover:border-[#0110FC]/40 transition-colors`}>
                                <feature.icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#0110FC] transition-colors">{feature.name}</h3>
                            <p className="text-[#8B9EFF] leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
