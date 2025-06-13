import { format, formatDistance, formatRelative, parseISO, isValid } from 'date-fns';

/**
 * Enterprise-grade formatting utilities
 */

// Currency formatting
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '-';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

// Number formatting
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '-';
  }

  const defaultOptions = {
    locale: 'en-US',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  try {
    return new Intl.NumberFormat(defaultOptions.locale, {
      minimumFractionDigits: defaultOptions.minimumFractionDigits,
      maximumFractionDigits: defaultOptions.maximumFractionDigits,
    }).format(number);
  } catch (error) {
    console.error('Number formatting error:', error);
    return number.toString();
  }
};

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  return `${(value * 100).toFixed(decimals)}%`;
};

// File size formatting
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return '-';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Volume formatting
export const formatVolume = (volume, decimals = 3) => {
  if (volume === null || volume === undefined || isNaN(volume)) return '0';

  const number = parseFloat(volume);
  return number.toFixed(decimals);
};

// Date formatting
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

// Relative date formatting
export const formatRelativeDate = (date) => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Relative date formatting error:', error);
    return '-';
  }
};

// Time formatting
export const formatTime = (date, formatString = 'HH:mm') => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Time formatting error:', error);
    return '-';
  }
};

// DateTime formatting
export const formatDateTime = (date, formatString = 'MMM dd, yyyy HH:mm') => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    
    return format(dateObj, formatString);
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return '-';
  }
};

// Text formatting
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Capitalize first letter
export const capitalize = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Title case
export const toTitleCase = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Camel case to title case
export const camelToTitle = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Snake case to title case
export const snakeToTitle = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
};

// Kebab case to title case
export const kebabToTitle = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .split('-')
    .map(word => capitalize(word))
    .join(' ');
};

// Phone number formatting
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phoneNumber;
};

// URL formatting
export const formatUrl = (url) => {
  if (!url) return '';
  
  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  
  return url;
};

// Status formatting
export const formatStatus = (status) => {
  if (!status) return '';
  
  const statusMap = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
    deleted: 'Deleted',
  };
  
  return statusMap[status.toLowerCase()] || toTitleCase(status);
};

// Priority formatting
export const formatPriority = (priority) => {
  if (!priority) return '';
  
  const priorityMap = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
    critical: 'Critical',
  };
  
  return priorityMap[priority.toLowerCase()] || toTitleCase(priority);
};

// Array formatting
export const formatArray = (array, separator = ', ', lastSeparator = ' and ') => {
  if (!Array.isArray(array) || array.length === 0) return '';
  
  if (array.length === 1) return array[0];
  if (array.length === 2) return array.join(lastSeparator);
  
  return array.slice(0, -1).join(separator) + lastSeparator + array[array.length - 1];
};

// JSON formatting for display
export const formatJSON = (obj, indent = 2) => {
  try {
    return JSON.stringify(obj, null, indent);
  } catch (error) {
    console.error('JSON formatting error:', error);
    return 'Invalid JSON';
  }
};

// Error message formatting
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  if (error?.message) return error.message;
  
  if (error?.response?.data?.message) return error.response.data.message;
  
  if (error?.response?.data?.error) return error.response.data.error;
  
  return 'An unexpected error occurred';
};

// Validation error formatting
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return [];
  
  return Object.entries(errors).map(([field, messages]) => ({
    field: camelToTitle(field),
    messages: Array.isArray(messages) ? messages : [messages],
  }));
};
