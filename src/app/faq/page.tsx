import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTA } from '@/components/landing/CTA';

export default function FAQPage() {
    return (
        <main className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-32 pb-24 px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-12 font-display text-center">Frequently Asked Questions</h1>

                <div className="space-y-8">
                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Is this service legal?</h3>
                        <p className="text-gray-400">Yes. Imagnest acts as a responsible technology layer. We do not host illegal content and strictly comply with Telegram's Terms of Service and Anti-Abuse policies.</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Do you have access to my private photos?</h3>
                        <p className="text-gray-400">No. Your images are stored securely on Telegram's cloud. We only store the metadata (file ID) required to retrieve them. Access is strictly controlled via your API keys.</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-2">What happens if Telegram changes their API?</h3>
                        <p className="text-gray-400">We constantly monitor the Telegram Bot API changes. Our infrastructure is built to adapt quickly. However, since we use the official public API, significant breaking changes are rare.</p>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Is there a limit on storage?</h3>
                        <p className="text-gray-400">Telegram provides effectively unlimited cloud storage. However, we enforce fair usage policies to prevent abuse of the platform.</p>
                    </div>
                </div>
            </div>
            <CTA />
            <Footer />
        </main>
    );
}
