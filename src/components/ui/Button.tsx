import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'neutral' | 'icon';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'rounded-lg font-medium transition-colors duration-200 focus:outline-none';
  const variantClasses = {
    primary:
      'px-5 py-2.5 bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    success:
      'px-5 py-2.5 bg-success-600 text-white hover:bg-success-700 focus:ring-2 focus:ring-success-500 focus:ring-offset-2',
    neutral:
      'px-5 py-2.5 bg-neutral-300 text-neutral-700 hover:bg-neutral-400 focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2',
    icon: 'p-1',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
