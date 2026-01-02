'use client';

import { Check } from 'lucide-react';

export const CodePreviewSection = () => {
    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Explanation */}
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6 font-display">
                            Developer Experience <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1da1f2] to-[#00b8d4]">First.</span>
                        </h2>
                        <p className="text-[#72767a] text-lg mb-8 leading-relaxed">
                            Integrate in minutes directly from your frontend or backend. We provide a simple REST API and typed SDKs for full control.
                        </p>

                        <div className="space-y-4">
                            {[
                                'Type-safe SDKs',
                                'Automatic Optimization',
                                'Signed URLs for Privacy',
                                'Zero-config CDN'
                            ].map(item => (
                                <div key={item} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-green-400" />
                                    </div>
                                    <span className="text-[#e7e9ea]">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Code Block */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1da1f2]/10 to-[#1c9cf0]/10 blur-3xl -z-10 rounded-full" />
                        <div className="glass-panel rounded-xl overflow-hidden border border-[#242628] shadow-2xl bg-[#17181c]">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#242628] bg-black/40">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                <div className="ml-2 text-xs text-[#72767a] font-mono">upload-image.ts</div>
                            </div>
                            <div className="p-6 bg-[#000000] overflow-x-auto">
                                <pre className="font-mono text-sm leading-relaxed">
                                    <code className="text-[#e7e9ea]">
                                        <span className="text-[#1da1f2]">import</span> {'{ Imagnest }'} <span className="text-[#1da1f2]">from</span> <span className="text-green-400">'@imagnest/sdk'</span>;<br /><br />
                                        <span className="text-[#1da1f2]">const</span> client = <span className="text-[#1da1f2]">new</span> Imagnest(process.env.API_KEY);<br /><br />
                                        <span className="text-[#72767a]">// Upload an image to Telegram storage</span><br />
                                        <span className="text-[#1da1f2]">const</span> {'{ url }'} = <span className="text-[#1da1f2]">await</span> client.upload(<span className="text-yellow-300">file</span>, {'{'}<br />
                                        {'  '}privacy: <span className="text-green-400">'private'</span>,<br />
                                        {'  '}tags: [<span className="text-green-400">'user-avatar'</span>]<br />
                                        {'}'});<br /><br />
                                        <span className="text-blue-400">console</span>.log(url);<br />
                                        <span className="text-[#72767a] opacity-50">// Output: https://cdn.imagnest.com/img_123...</span>
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
