import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';
import './EmptyState.css';

/**
 * Empty state component for displaying when no data is available
 */
const EmptyState = ({
  icon = '📊',
  title = 'No Data Available',
  description = 'There is no data to display at the moment.',
  action = null,
  size = 'medium',
  className = '',
  style = {}
}) => {
  const emptyStateClasses = [
    'empty-state',
    `empty-state--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={emptyStateClasses} style={style}>
      <div className="empty-state__icon" aria-hidden="true">
        {typeof icon === 'string' ? (
          <span className="empty-state__emoji">{icon}</span>
        ) : (
          icon
        )}
      </div>
      
      <div className="empty-state__content">
        <h3 className="empty-state__title">
          {title}
        </h3>
        
        {description && (
          <p className="empty-state__description">
            {description}
          </p>
        )}
        
        {action && (
          <div className="empty-state__action">
            {React.isValidElement(action) ? action : (
              <Button variant="primary">
                {action}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object
};

export default EmptyState;
