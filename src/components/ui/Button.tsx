import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    disabled,
    ...props
}, ref) => {
    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={cn(
                'inline-flex items-center justify-center rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1da1f2] disabled:pointer-events-none disabled:opacity-50',
                {
                    'bg-white text-black hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]': variant === 'primary',
                    'bg-[#17181c] text-white hover:bg-[#1da1f2]/10 border border-[#242628]': variant === 'secondary',
                    'border border-[#1da1f2]/30 bg-transparent hover:bg-[#1da1f2]/10 hover:border-[#1da1f2]/50 text-white': variant === 'outline',
                    'hover:bg-[#1da1f2]/10 text-[#72767a] hover:text-white': variant === 'ghost',
                    'h-8 px-3 text-sm': size === 'sm',
                    'h-10 px-4 py-2': size === 'md',
                    'h-12 px-6 text-lg': size === 'lg',
                },
                className
            )}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };
