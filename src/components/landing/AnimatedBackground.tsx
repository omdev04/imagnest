'use client';

import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden bg-[#000000]">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1da1f208_1px,transparent_1px),linear-gradient(to_bottom,#1da1f208_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Radial Gradient Glow - Twitter Blue Theme */}
            <div className="absolute left-0 top-0 -z-10 h-[1000px] w-[1000px] rounded-full bg-[#1da1f2]/10 blur-[150px] filter" />
            <div className="absolute right-0 bottom-0 -z-10 h-[1000px] w-[1000px] rounded-full bg-[#1c9cf0]/10 blur-[150px] filter" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-[#1da1f2]/5 blur-[100px] filter" />

            {/* Floating Elements (Mosaic) */}
            <motion.div
                animate={{
                    y: [-20, 20, -20],
                    rotate: [0, 10, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 h-32 w-32 rounded-lg bg-gradient-to-br from-[#1da1f2]/10 to-transparent backdrop-blur-3xl border border-[#1da1f2]/10"
            />
            <motion.div
                animate={{
                    y: [20, -20, 20],
                    rotate: [0, -10, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-lg bg-gradient-to-br from-[#1c9cf0]/10 to-transparent backdrop-blur-3xl border border-[#1c9cf0]/10"
            />
            <motion.div
                animate={{
                    y: [-15, 15, -15],
                    x: [-10, 10, -10],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 right-1/3 h-24 w-24 rounded-full bg-gradient-to-br from-[#1da1f2]/10 to-transparent backdrop-blur-xl border border-[#1da1f2]/5"
            />
        </div>
    );
};
