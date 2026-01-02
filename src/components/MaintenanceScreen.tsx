import { Wrench } from "lucide-react";

export default function MaintenanceScreen() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-md w-full backdrop-blur-sm">
                <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
                    <Wrench className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">Under Maintenance</h1>
                <p className="text-gray-400 mb-6">
                    We are currently performing scheduled maintenance to improve our services.
                    Access is restricted to administrators only.
                </p>
            </div>
        </div>
    );
}
