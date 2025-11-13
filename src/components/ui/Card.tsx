import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  return (
    <div className={`bg-surface rounded-lg shadow-md ${hoverClass} ${className}`}>{children}</div>
  );
}
