'use client';

import { useEffect, useRef } from 'react';

interface TelegramLoginButtonProps {
    botName: string;
    onAuth: (user: any) => void;
}

export const TelegramLoginButton = ({ botName, onAuth }: TelegramLoginButtonProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Define the callback function on window
        const onTelegramAuth = (user: any) => {
            onAuth(user);
        };

        // @ts-ignore
        window.onTelegramAuth = onTelegramAuth;

        if (containerRef.current) {
            if (containerRef.current.innerHTML) return; // Prevent duplicate script injection

            const script = document.createElement('script');
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
            script.async = true;
            script.setAttribute('data-telegram-login', botName);
            script.setAttribute('data-size', 'large'); // small, medium, large
            script.setAttribute('data-radius', '10');
            script.setAttribute('data-userpic', 'false'); // Show userpic?
            script.setAttribute('data-request-access', 'write');
            script.setAttribute('data-onauth', 'onTelegramAuth(user)');

            containerRef.current.appendChild(script);
        }

        return () => {
            // Cleanup if needed, though script usually stays
            // @ts-ignore
            delete window.onTelegramAuth;
        }
    }, [botName, onAuth]);

    return <div ref={containerRef} className="flex justify-center" />;
};
