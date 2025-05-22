import React from 'react';

const FormField = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  required = false,
  options = [],
  disabled = false,
  className = '',
}) => {
  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            } ${className}`}
            rows={4}
          />
        );
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            } ${className}`}
          >
            <option value="">{placeholder || 'Выберите...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={value || false}
            onChange={onChange}
            disabled={disabled}
            className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${
              error ? 'border-red-300' : ''
            } ${className}`}
          />
        );
      case 'date':
        return (
          <input
            id={name}
            name={name}
            type="date"
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            } ${className}`}
          />
        );
      case 'number':
        return (
          <input
            id={name}
            name={name}
            type="number"
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            } ${className}`}
            step="any"
          />
        );
      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            } ${className}`}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;
