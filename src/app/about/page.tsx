import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTA } from '@/components/landing/CTA';
import { Camera } from 'lucide-react';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
                        We are democratizing <br />
                        <span className="text-purple-400">Cloud Storage</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed">
                        Imagnest was born from a simple idea: Storage should be a utility, not a luxury. By creatively leveraging existing infrastructure, we&#39;re building the most efficient image delivery network on the planet.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="bg-gray-900/50 p-8 rounded-2xl border border-white/5">
                        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-gray-300 mb-4">
                            We believe that developers shouldn&#39;t have to worry about exorbitant AWS S3 bills just because their app goes viral.
                        </p>
                        <p className="text-gray-300">
                            Our mission is to provide an enterprise-grade image CDN that scales effortlessly from 0 to 1 billion requests, at a fraction of the cost of traditional providers.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 blur-3xl opacity-20 -z-10" />
                        <img
                            src="/placeholder.png"
                            alt="Team working"
                            className="rounded-2xl border border-white/10 w-full object-cover h-[300px] bg-gray-800"
                        />
                    </div>
                </div>
            </div>
            <CTA />
            <Footer />
        </main>
    );
}
