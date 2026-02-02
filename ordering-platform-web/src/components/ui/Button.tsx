import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles = {
  primary:
    'bg-brand text-white hover:bg-brand-hover active:opacity-80 shadow-sm shadow-brand/10 active:scale-[0.97]',
  secondary:
    'bg-surface-elevated text-text-primary border border-border-default hover:bg-brand-secondary active:bg-brand-secondary/80 active:scale-[0.97]',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-surface-elevated active:scale-[0.97]',
  danger:
    'bg-error/10 text-error hover:bg-error/20 active:bg-error/30 active:scale-[0.97]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-sm)] gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-[var(--radius-md)] touch-target gap-2',
  lg: 'px-6 py-3.5 text-base rounded-[var(--radius-lg)] touch-target gap-2 font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, disabled, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium
          transition-all duration-[var(--duration-fast)]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
