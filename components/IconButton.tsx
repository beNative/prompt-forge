
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  tooltip: string;
  variant?: 'primary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md';
}

const IconButton: React.FC<IconButtonProps> = ({ children, tooltip, className, variant = 'primary', size='md', ...props }) => {
  const baseClasses = "relative group flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors";
  
  const variantClasses = {
      primary: 'text-text-secondary hover:bg-border-color hover:text-text-main',
      ghost: 'text-text-secondary/80 hover:bg-border-color hover:text-text-main',
      destructive: 'text-destructive-text bg-transparent hover:bg-destructive-bg'
  };

  const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
      <span className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs font-semibold text-tooltip-text bg-tooltip-bg rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {tooltip}
      </span>
    </button>
  );
};

export default IconButton;
