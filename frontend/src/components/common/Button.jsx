import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-8 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-tan hover:bg-coffee text-space-cadet hover:text-white shadow-[0_0_12px_rgba(213,184,147,0.3)] hover:shadow-[0_0_16px_rgba(213,184,147,0.5)] border border-transparent',
    secondary: 'bg-transparent hover:bg-slate-gray border border-slate-gray text-tan hover:text-white',
    outline: 'bg-transparent hover:bg-slate-gray/20 border border-slate-gray/50 text-slate-gray hover:text-white',
    ghost: 'bg-transparent hover:bg-slate-gray/10 text-slate-gray hover:text-tan',
    danger: 'bg-caput-mortuum/10 hover:bg-caput-mortuum border border-caput-mortuum/50 text-white shadow-sm',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
