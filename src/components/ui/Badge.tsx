import { ReactNode } from 'react';
import { cn } from './Card';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'green' | 'red' | 'blue' | 'gold' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantClasses = {
    green: 'bg-finance-green-muted text-finance-green border border-finance-green/30',
    red: 'bg-finance-red-muted text-finance-red border border-finance-red/30',
    blue: 'bg-finance-blue-muted text-finance-blue border border-finance-blue/30',
    gold: 'bg-finance-gold-muted text-finance-gold border border-finance-gold/30',
    default: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
