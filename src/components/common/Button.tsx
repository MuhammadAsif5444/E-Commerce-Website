import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] select-none';

  const variantStyles = {
    // Primary deep blue
    primary:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow focus:ring-slate-900 dark:bg-blue-600 dark:hover:bg-blue-500',
    // Accent vibrant orange
    accent:
      'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow focus:ring-orange-500',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-900 focus:ring-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100',
    outline:
      'border border-slate-300 hover:bg-slate-50 text-slate-800 focus:ring-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
    ghost:
      'text-slate-700 hover:bg-slate-100 focus:ring-slate-300 dark:text-slate-300 dark:hover:bg-slate-800',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-600',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
