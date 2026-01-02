import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CTA } from '@/components/landing/CTA';

export default function FeaturesPage() {
    return (
        <main className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-24 pb-12 px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-display">
                    Powering the <span className="text-purple-400">Next Gen</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    Discover how Imagnest leverages robust Telegram infrastructure to provide unparalleled speed and storage free of charge.
                </p>
            </div>
            <FeaturesSection />
            <CTA />
            <Footer />
        </main>
    );
}
