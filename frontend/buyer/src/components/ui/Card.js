import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = true,
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-lg shadow-card overflow-hidden';
  const hoverStyles = hover ? 'transition-shadow duration-300 hover:shadow-card-hover' : '';
  const paddingStyles = padding ? 'p-4 md:p-6' : '';
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
