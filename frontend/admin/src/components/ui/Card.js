import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const variantClasses = {
    default: '',
    elevated: 'border-0',
    outlined: 'border-2',
    filled: 'bg-gray-50'
  };
  
  const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1' : '';
  
  const cardClasses = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${className}
  `.trim();

  const CardComponent = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
    transition: { duration: 0.2 }
  } : {};

  return (
    <CardComponent
      className={cardClasses}
      {...motionProps}
      {...props}
    >
      {(title || subtitle) && (
        <div className={`mb-4 ${headerClassName}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={bodyClassName}>
        {children}
      </div>
    </CardComponent>
  );
};

export default Card;
