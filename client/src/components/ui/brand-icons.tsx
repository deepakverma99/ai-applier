import React from 'react';
import { LucideProps } from 'lucide-react';

/**
 * LinkedIn icon component that matches the Lucide design system.
 * Brand icons were removed in Lucide v1.0.
 */
export const Linkedin = ({ 
  size = 24, 
  strokeWidth = 2, 
  color = 'currentColor', 
  className = '',
  ...props 
}: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-linkedin ${className}`}
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
