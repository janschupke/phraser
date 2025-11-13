import { ReactNode } from 'react';

interface PageTitleProps {
  children: ReactNode;
  className?: string;
}

export function PageTitle({ children, className = '' }: PageTitleProps) {
  return (
    <h1 className={`text-3xl sm:text-4xl font-bold text-neutral-800 mb-6 sm:mb-8 ${className}`}>
      {children}
    </h1>
  );
}
