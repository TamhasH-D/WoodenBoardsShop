import React, { forwardRef } from 'react';

const CheckboxField = forwardRef(({
  label,
  description,
  error,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const checkboxClasses = `
    h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${error ? 'border-red-300' : ''}
    ${className}
  `.trim();

  return (
    <div className={`relative flex items-start ${containerClassName}`}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={checkboxClasses}
          {...props}
        />
      </div>
      
      {label && (
        <div className="ml-3 text-sm">
          <label className={`font-medium text-gray-700 ${disabled ? 'opacity-50' : ''}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {description && (
            <p className={`text-gray-500 ${disabled ? 'opacity-50' : ''}`}>
              {description}
            </p>
          )}
          
          {error && (
            <p className="text-red-600 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

CheckboxField.displayName = 'CheckboxField';

export default CheckboxField;
