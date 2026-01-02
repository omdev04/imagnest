'use client';

import { Bug, Send } from 'lucide-react';

export default function AdminBugsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="h-24 w-24 bg-[#0110FC]/10 rounded-full flex items-center justify-center">
                <Bug className="h-12 w-12 text-[#0110FC]" />
            </div>

            <div className="max-w-md">
                <h1 className="text-2xl font-bold text-white mb-2">Bug Reports Configuration</h1>
                <p className="text-[#8B9EFF] mb-8">
                    User submitted bug reports are configured to be sent directly to the Admin Telegram Channel for immediate attention.
                    They are not stored in the application database.
                </p>

                <div className="bg-[#16181c] border border-white/10 rounded-xl p-6 text-left">
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Send className="h-4 w-4 text-blue-400" />
                        Delivery Channel
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Reports are delivered to the configured Telegram channel via the active bot.
                    </p>
                    <div className="text-xs font-mono bg-black/50 p-3 rounded text-gray-400">
                        Check your Telegram Admin Group/Channel for incoming reports.
                    </div>
                </div>
            </div>
        </div>
    );
}
