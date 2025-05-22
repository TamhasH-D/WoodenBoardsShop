import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-wood-accent hover:bg-wood-accent-light text-white focus:ring-wood-accent',
    secondary: 'bg-wood-medium hover:bg-wood-dark text-white focus:ring-wood-medium',
    outline: 'border border-wood-accent text-wood-accent hover:bg-wood-accent hover:text-white focus:ring-wood-accent',
    ghost: 'text-wood-accent hover:bg-wood-light focus:ring-wood-accent',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${widthStyles} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
