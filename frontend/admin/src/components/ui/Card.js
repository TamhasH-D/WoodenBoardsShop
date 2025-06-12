import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/helpers';

/**
 * Corporate Card Component
 * Professional, minimal design suitable for enterprise admin panels
 */
const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  ...props
}) => {
  const cardClasses = cn(
    // Base styles
    'bg-white rounded-md transition-colors duration-150',
    
    // Padding variants
    {
      'p-3': padding === 'sm',
      'p-6': padding === 'md',
      'p-8': padding === 'lg',
      'p-0': padding === 'none',
    },
    
    // Shadow variants
    {
      'shadow-none': shadow === 'none',
      'shadow-sm': shadow === 'sm',
      'shadow-md': shadow === 'md',
      'shadow-lg': shadow === 'lg',
    },
    
    // Border
    border && 'border border-gray-200',
    
    // Hover effect
    hover && 'hover:shadow-md hover:border-gray-300',
    
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  border: PropTypes.bool,
  hover: PropTypes.bool,
};

export default Card;
