import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-32 pb-24 px-6 lg:px-8 max-w-4xl mx-auto text-gray-300">
                <h1 className="text-4xl font-bold text-white mb-8 font-display">Terms of Service</h1>
                <div className="prose prose-invert max-w-none">
                    <p>By using Imagnest, you agree to these terms. Please read them carefully.</p>

                    <h3>1. Telegram Compliance</h3>
                    <p>You agree to comply with Telegram's Terms of Service at all times. Imagnest is a third-party tool and is not affiliated with Telegram.</p>

                    <h3>2. Prohibited Content</h3>
                    <p>You may not use Imagnest to store or distribute:
                        <ul>
                            <li>Illegal content of any kind.</li>
                            <li>Copyrighted material without permission.</li>
                            <li>Malware or viruses.</li>
                            <li>Adult content.</li>
                        </ul>
                    </p>

                    <h3>3. Service Availability</h3>
                    <p>We strive for 99.9% uptime but cannot guarantee it, as we rely on third-party infrastructure (Telegram).</p>

                    <h3>4. Account Termination</h3>
                    <p>We reserve the right to terminate accounts that violate these terms or abuse the service.</p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
