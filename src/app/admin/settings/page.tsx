
'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Lock, UploadCloud, UserPlus, Power } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface SystemSettings {
    uploadsEnabled: boolean;
    signupsEnabled: boolean;
    maintenanceMode: boolean;
    maxFileSize: number;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.settings) {
                setSettings(data.settings);
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key: keyof SystemSettings, value: boolean) => {
        if (!settings) return;

        // Optimistic update
        const oldSettings = { ...settings };
        setSettings({ ...settings, [key]: value });

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setting: key, value })
            });

            const data = await res.json();

            if (res.ok) {
                showToast(`Setting ${key} updated`, 'success');
            } else {
                setSettings(oldSettings); // Revert
                showToast(data.error || 'Failed to update setting', 'error');
            }
        } catch (error) {
            setSettings(oldSettings); // Revert
            showToast('Failed to update setting', 'error');
        }
    };

    if (loading) return <div className="text-white">Loading settings...</div>;
    if (!settings) return <div className="text-red-500">Failed to load settings</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="h-6 w-6 text-gray-400" /> System Settings
            </h1>

            <div className="bg-[#0A0E1A] border border-white/5 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-lg font-medium text-white mb-1">Global Controls</h2>
                    <p className="text-sm text-gray-500">Manage global system availability and features.</p>
                </div>

                <div className="divide-y divide-white/5">
                    <SettingToggle
                        title="Uploads Enabled"
                        description="Allow users to upload new images. Disable to pause all new uploads."
                        enabled={settings.uploadsEnabled}
                        icon={UploadCloud}
                        onChange={(val: boolean) => handleToggle('uploadsEnabled', val)}
                    />

                    <SettingToggle
                        title="Signups Enabled"
                        description="Allow new users to register. Disable to make the site invite-only."
                        enabled={settings.signupsEnabled}
                        icon={UserPlus}
                        onChange={(val: boolean) => handleToggle('signupsEnabled', val)}
                    />

                    <SettingToggle
                        title="Maintenance Mode"
                        description="Put the entire site into maintenance mode. Only admins will be able to access."
                        enabled={settings.maintenanceMode}
                        icon={Power}
                        critical
                        onChange={(val: boolean) => handleToggle('maintenanceMode', val)}
                    />
                </div>
            </div>

            <div className="p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm flex items-start gap-3">
                <Lock className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold">Super Admin Access Only:</span> Settings changes are restricted to super administrators.
                    If you are a regular admin, these toggles will revert.
                </div>
            </div>
        </div>
    );
}

function SettingToggle({ title, description, enabled, icon: Icon, critical, onChange }: any) {
    return (
        <div className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-white font-medium">{title}</h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-lg">{description}</p>
                </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={enabled}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className={`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-800 
                    ${critical
                        ? 'peer-checked:bg-red-600'
                        : 'peer-checked:bg-blue-600'
                    } bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
            </label>
        </div>
    );
}
