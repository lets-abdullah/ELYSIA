import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'dark' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'gold',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium tracking-[0.12em] uppercase transition-all duration-300 focus:outline-none rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-6 py-3 text-xs gap-2',
    lg: 'px-8 py-4 text-sm gap-2.5'
  };

  const variantStyles = {
    gold: 'bg-[#1A1A1A] text-white hover:bg-[#C5B358] hover:text-white border border-[#1A1A1A]',
    outline: 'bg-transparent text-[#1A1A1A] border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white',
    dark: 'bg-[#1A1A1A] text-white hover:bg-[#000000] border border-[#1A1A1A]',
    ghost: 'bg-transparent text-[#1A1A1A] hover:text-[#C5B358] hover:bg-[#F5F5F0]'
  };

  return (
    <button
      // eslint-disable-next-line security/detect-object-injection -- reviewed, typed variant & size props
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.gold} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
