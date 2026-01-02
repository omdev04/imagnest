'use client';

import { UploadZone } from '@/components/dashboard/UploadZone';

export default function UploadPage() {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-white font-display mb-2">Upload Images</h1>
            </div>
            <UploadZone />
        </div>
    );
}
