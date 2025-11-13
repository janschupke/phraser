import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export function Card({ children, className = '', hover = false, style }: CardProps) {
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  return (
    <div className={`bg-surface rounded-lg shadow-md ${hoverClass} ${className}`} style={style}>
      {children}
    </div>
  );
}
