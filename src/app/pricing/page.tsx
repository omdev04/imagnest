import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTA } from '@/components/landing/CTA';

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-24">
                <PricingSection />
            </div>
            <div className="py-12 bg-gray-900/30">
                <div className="max-w-3xl mx-auto px-6">
                    <h3 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                        <div className="border-b border-gray-800 pb-6">
                            <h4 className="text-lg font-medium text-white mb-2">Is it really free?</h4>
                            <p className="text-gray-400">Yes! The Hobby plan is completely free forever. We utilize Telegram&#39;s unlimited cloud storage API to host your images at zero cost to us, passing the savings to you.</p>
                        </div>
                        <div className="border-b border-gray-800 pb-6">
                            <h4 className="text-lg font-medium text-white mb-2">What happens if I exceed my limits?</h4>
                            <p className="text-gray-400">We will notify you via email when you reach 80% and 100% of your usage limits. You&#39;ll have a grace period to upgrade before any rate limiting occurs.</p>
                        </div>
                        <div className="pb-6">
                            <h4 className="text-lg font-medium text-white mb-2">Can I use this for production apps?</h4>
                            <p className="text-gray-400">Absolutely. Our Pro and Enterprise tiers are built for high-scale production workloads with guaranteed SLAs and priority support.</p>
                        </div>
                    </div>
                </div>
            </div>
            <CTA />
            <Footer />
        </main>
    );
}
