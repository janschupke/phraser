import type { ComponentPropsWithRef, ReactNode } from 'react';

// WithRef so a wrapping Radix trigger (Tooltip's asChild) can attach its ref.
interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'success' | 'neutral' | 'danger' | 'icon';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  // The focus ring lives in the base, including for the icon variant, which
  // previously had none at all -- every edit, delete and cog button in the app
  // was invisible to a keyboard user. focus-visible rather than focus so a
  // mouse click does not leave a ring behind.
  const baseClasses =
    'rounded-lg font-medium transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2';
  const variantClasses = {
    primary:
      'px-5 py-2.5 bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
    success:
      'px-5 py-2.5 bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500',
    neutral:
      'px-5 py-2.5 bg-neutral-200 text-neutral-800 hover:bg-hover-strong focus-visible:ring-neutral-500',
    danger: 'px-5 py-2.5 bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500',
    icon: 'p-2 hover:bg-hover-strong focus-visible:ring-primary-500',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
