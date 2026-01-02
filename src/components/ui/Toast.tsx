'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/50',
        textColor: 'text-green-500',
        iconColor: 'text-green-500',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/50',
        textColor: 'text-red-400',
        iconColor: 'text-red-500',
    },
    warning: {
        icon: AlertCircle,
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/50',
        textColor: 'text-yellow-400',
        iconColor: 'text-yellow-500',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/50',
        textColor: 'text-blue-400',
        iconColor: 'text-blue-500',
    },
};

export function ToastItem({ toast, onClose }: ToastProps) {
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg min-w-[300px] max-w-[500px] ${config.bgColor} ${config.borderColor}`}
        >
            <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
            <p className={`flex-1 text-sm font-medium ${config.textColor}`}>{toast.message}</p>
            <button
                onClick={() => onClose(toast.id)}
                className={`flex-shrink-0 hover:opacity-70 transition-opacity ${config.textColor}`}
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}

interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={onClose} />
                ))}
            </AnimatePresence>
        </div>
    );
}
