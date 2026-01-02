import Link from 'next/link';
import Image from 'next/image';
import { Camera, Twitter, Github, Linkedin, ShieldCheck } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-[#000000] border-t border-[#242628] pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-1 mb-3">
                            <Image
                                src="/logo/logo.png"
                                alt="Logo"
                                width={120}
                                height={120}
                            />
                        </Link>
                        <p className="text-[#72767a] text-sm leading-relaxed mb-6">
                            The fastest image CDN powered by Telegram's unlimited cloud storage. Secure, scalable, and policy-aligned.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/15 px-3 py-1.5 rounded-full w-fit border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            Telegram Compliant
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-3 text-sm text-[#72767a]">
                            <li><Link href="/features" className="hover:text-[#1da1f2] transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-[#1da1f2] transition-colors">Pricing</Link></li>
                            <li><Link href="/dashboard" className="hover:text-[#1da1f2] transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-[#72767a]">
                            <li><Link href="/about" className="hover:text-[#1da1f2] transition-colors">About Us</Link></li>
                            <li><Link href="/faq" className="hover:text-[#1da1f2] transition-colors">FAQ</Link></li>
                            <li><Link href="/contact" className="hover:text-[#1da1f2] transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm text-[#72767a]">
                            <li><Link href="/privacy" className="hover:text-[#1da1f2] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-[#1da1f2] transition-colors">Terms of Service</Link></li>
                            <li><Link href="/security" className="hover:text-[#1da1f2] transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#242628] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#72767a] text-sm">
                        © {new Date().getFullYear()} Imagnest Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-[#72767a] hover:text-[#1da1f2] transition-colors"><Twitter className="h-5 w-5" /></Link>
                        <Link href="#" className="text-[#72767a] hover:text-[#1da1f2] transition-colors"><Github className="h-5 w-5" /></Link>
                        <Link href="#" className="text-[#72767a] hover:text-[#1da1f2] transition-colors"><Linkedin className="h-5 w-5" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
