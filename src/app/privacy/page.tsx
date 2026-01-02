import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black">
            <Navbar />
            <div className="pt-32 pb-24 px-6 lg:px-8 max-w-4xl mx-auto text-gray-300">
                <h1 className="text-4xl font-bold text-white mb-8 font-display">Privacy Policy</h1>
                <div className="prose prose-invert max-w-none">
                    <p>Your privacy is our priority. This policy outlines how we handle your data.</p>

                    <h3>1. Data Collection</h3>
                    <p>We collect only the minimum data necessary to provide the service:
                        <ul>
                            <li>Your email address (for account management).</li>
                            <li>Telegram File IDs (to retrieve your images).</li>
                            <li>Usage logs (to prevent abuse).</li>
                        </ul>
                    </p>

                    <h3>2. Image Storage</h3>
                    <p>We DO NOT store your actual image files on our servers. They are stored on Telegram's cloud. We only store the metadata.</p>

                    <h3>3. Data Sharing</h3>
                    <p>We do not sell your data to third parties. We may share data with law enforcement if required by law.</p>

                    <h3>4. Security</h3>
                    <p>We use industry-standard encryption to protect your data.</p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
