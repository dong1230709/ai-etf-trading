import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps {
  children: ReactNode;
  className?: ClassValue;
  onClick?: () => void;
  hover?: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ children, className, onClick, hover = false }: CardProps) {
  const baseClasses = 'bg-finance-card border border-finance-border rounded-2xl p-4 transition-all duration-300';
  const interactiveClasses = hover || onClick ? 'cursor-pointer hover:bg-finance-card-hover hover:border-finance-border/80 active:scale-[0.99]' : '';

  const Component = onClick ? motion.button : motion.div;
  const componentProps = onClick ? {
    onClick,
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.99 },
  } : {};

  return (
    <Component
      className={cn(baseClasses, interactiveClasses, className)}
      {...componentProps}
    >
      {children}
    </Component>
  );
}
