import { HeroPremium } from '@/components/landing/HeroPremium';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CodePreviewSection } from '@/components/landing/CodePreviewSection';
import { ComplianceSection } from '@/components/landing/ComplianceSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTA } from '@/components/landing/CTA';

export default function Home() {
    return (
        <main className="min-h-screen bg-black flex flex-col">
            <Navbar />
            <HeroPremium />
            <CodePreviewSection />
            <ComplianceSection />
            <FeaturesSection />
            <PricingSection />
            <CTA />
            <Footer />
        </main>
    );
}
