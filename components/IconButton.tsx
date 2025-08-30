
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  tooltip: string;
  variant?: 'primary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md';
}

const IconButton: React.FC<IconButtonProps> = ({ children, tooltip, className, variant = 'primary', size='md', ...props }) => {
  const baseClasses = "relative group flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background";
  
  const variantClasses = {
      primary: 'text-text-secondary hover:bg-secondary-light hover:text-text-main',
      ghost: 'text-text-secondary/80 hover:bg-secondary-light/60 hover:text-text-main',
      destructive: 'text-destructive-text hover:bg-destructive-bg-hover'
  };

  const sizeClasses = {
      sm: 'w-7 h-7',
      md: 'w-9 h-9'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
      <span className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs text-tooltip-text bg-tooltip-bg rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {tooltip}
      </span>
    </button>
  );
};

export default IconButton;