import * as yup from 'yup';

/**
 * Enterprise-grade validation schemas using Yup
 */

// Common field validations
export const commonValidations = {
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .max(255, 'Email must be less than 255 characters'),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  confirmPassword: (passwordField = 'password') =>
    yup
      .string()
      .required('Please confirm your password')
      .oneOf([yup.ref(passwordField)], 'Passwords must match'),

  phone: yup
    .string()
    .matches(
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please enter a valid phone number'
    ),

  url: yup
    .string()
    .url('Please enter a valid URL')
    .max(2048, 'URL must be less than 2048 characters'),

  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),

  slug: yup
    .string()
    .required('Slug is required')
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be less than 100 characters')
    .matches(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),

  description: yup
    .string()
    .max(1000, 'Description must be less than 1000 characters'),

  price: yup
    .number()
    .positive('Price must be positive')
    .max(999999.99, 'Price must be less than 1,000,000'),

  quantity: yup
    .number()
    .integer('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),

  date: yup
    .date()
    .required('Date is required')
    .min(new Date(), 'Date cannot be in the past'),

  file: yup
    .mixed()
    .required('File is required')
    .test('fileSize', 'File size must be less than 10MB', (value) => {
      return !value || value.size <= 10 * 1024 * 1024;
    }),

  image: yup
    .mixed()
    .required('Image is required')
    .test('fileType', 'Only image files are allowed', (value) => {
      return !value || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(value.type);
    })
    .test('fileSize', 'Image size must be less than 5MB', (value) => {
      return !value || value.size <= 5 * 1024 * 1024;
    }),
};

// User schemas
export const userSchemas = {
  create: yup.object({
    first_name: commonValidations.name,
    last_name: commonValidations.name,
    email: commonValidations.email,
    username: commonValidations.username,
    password: commonValidations.password,
    confirm_password: commonValidations.confirmPassword(),
    phone: commonValidations.phone.optional(),
    role: yup
      .string()
      .required('Role is required')
      .oneOf(['admin', 'manager', 'user'], 'Invalid role'),
    is_active: yup.boolean().default(true),
  }),

  update: yup.object({
    first_name: commonValidations.name,
    last_name: commonValidations.name,
    email: commonValidations.email,
    username: commonValidations.username,
    phone: commonValidations.phone.optional(),
    role: yup
      .string()
      .required('Role is required')
      .oneOf(['admin', 'manager', 'user'], 'Invalid role'),
    is_active: yup.boolean(),
  }),

  changePassword: yup.object({
    current_password: yup.string().required('Current password is required'),
    new_password: commonValidations.password,
    confirm_password: commonValidations.confirmPassword('new_password'),
  }),

  login: yup.object({
    email: commonValidations.email,
    password: yup.string().required('Password is required'),
    remember_me: yup.boolean().default(false),
  }),

  forgotPassword: yup.object({
    email: commonValidations.email,
  }),

  resetPassword: yup.object({
    token: yup.string().required('Reset token is required'),
    password: commonValidations.password,
    confirm_password: commonValidations.confirmPassword(),
  }),
};

// Product schemas
export const productSchemas = {
  create: yup.object({
    name: yup
      .string()
      .required('Product name is required')
      .min(3, 'Product name must be at least 3 characters')
      .max(200, 'Product name must be less than 200 characters'),
    slug: commonValidations.slug,
    description: commonValidations.description.required('Description is required'),
    price: commonValidations.price.required('Price is required'),
    cost_price: commonValidations.price.optional(),
    sku: yup
      .string()
      .required('SKU is required')
      .max(50, 'SKU must be less than 50 characters'),
    stock_quantity: commonValidations.quantity.required('Stock quantity is required'),
    category_id: yup.number().required('Category is required'),
    brand_id: yup.number().optional(),
    is_active: yup.boolean().default(true),
    is_featured: yup.boolean().default(false),
    weight: yup.number().positive('Weight must be positive').optional(),
    dimensions: yup.object({
      length: yup.number().positive().optional(),
      width: yup.number().positive().optional(),
      height: yup.number().positive().optional(),
    }).optional(),
    tags: yup.array().of(yup.string()).optional(),
    images: yup.array().of(commonValidations.image).min(1, 'At least one image is required'),
  }),

  update: yup.object({
    name: yup
      .string()
      .required('Product name is required')
      .min(3, 'Product name must be at least 3 characters')
      .max(200, 'Product name must be less than 200 characters'),
    slug: commonValidations.slug,
    description: commonValidations.description.required('Description is required'),
    price: commonValidations.price.required('Price is required'),
    cost_price: commonValidations.price.optional(),
    sku: yup
      .string()
      .required('SKU is required')
      .max(50, 'SKU must be less than 50 characters'),
    stock_quantity: commonValidations.quantity.required('Stock quantity is required'),
    category_id: yup.number().required('Category is required'),
    brand_id: yup.number().optional(),
    is_active: yup.boolean(),
    is_featured: yup.boolean(),
    weight: yup.number().positive('Weight must be positive').optional(),
    dimensions: yup.object({
      length: yup.number().positive().optional(),
      width: yup.number().positive().optional(),
      height: yup.number().positive().optional(),
    }).optional(),
    tags: yup.array().of(yup.string()).optional(),
  }),
};

// Board schemas
export const boardSchemas = {
  create: yup.object({
    name: yup
      .string()
      .required('Board name is required')
      .min(3, 'Board name must be at least 3 characters')
      .max(100, 'Board name must be less than 100 characters'),
    description: commonValidations.description.optional(),
    price: commonValidations.price.required('Price is required'),
    is_active: yup.boolean().default(true),
    category: yup.string().required('Category is required'),
    difficulty_level: yup
      .string()
      .required('Difficulty level is required')
      .oneOf(['beginner', 'intermediate', 'advanced'], 'Invalid difficulty level'),
    estimated_time: yup
      .number()
      .positive('Estimated time must be positive')
      .required('Estimated time is required'),
    materials: yup.array().of(yup.string()).min(1, 'At least one material is required'),
    tools: yup.array().of(yup.string()).optional(),
    instructions: yup
      .string()
      .required('Instructions are required')
      .min(100, 'Instructions must be at least 100 characters'),
    images: yup.array().of(commonValidations.image).min(1, 'At least one image is required'),
  }),

  update: yup.object({
    name: yup
      .string()
      .required('Board name is required')
      .min(3, 'Board name must be at least 3 characters')
      .max(100, 'Board name must be less than 100 characters'),
    description: commonValidations.description.optional(),
    price: commonValidations.price.required('Price is required'),
    is_active: yup.boolean(),
    category: yup.string().required('Category is required'),
    difficulty_level: yup
      .string()
      .required('Difficulty level is required')
      .oneOf(['beginner', 'intermediate', 'advanced'], 'Invalid difficulty level'),
    estimated_time: yup
      .number()
      .positive('Estimated time must be positive')
      .required('Estimated time is required'),
    materials: yup.array().of(yup.string()).min(1, 'At least one material is required'),
    tools: yup.array().of(yup.string()).optional(),
    instructions: yup
      .string()
      .required('Instructions are required')
      .min(100, 'Instructions must be at least 100 characters'),
  }),
};

// Settings schemas
export const settingsSchemas = {
  general: yup.object({
    site_name: yup
      .string()
      .required('Site name is required')
      .max(100, 'Site name must be less than 100 characters'),
    site_description: commonValidations.description.optional(),
    site_url: commonValidations.url.required('Site URL is required'),
    admin_email: commonValidations.email,
    timezone: yup.string().required('Timezone is required'),
    language: yup.string().required('Language is required'),
    currency: yup.string().required('Currency is required'),
  }),

  email: yup.object({
    smtp_host: yup.string().required('SMTP host is required'),
    smtp_port: yup
      .number()
      .required('SMTP port is required')
      .min(1, 'Port must be greater than 0')
      .max(65535, 'Port must be less than 65536'),
    smtp_username: yup.string().required('SMTP username is required'),
    smtp_password: yup.string().required('SMTP password is required'),
    smtp_use_tls: yup.boolean().default(true),
    from_email: commonValidations.email,
    from_name: yup.string().required('From name is required'),
  }),

  payment: yup.object({
    stripe_public_key: yup.string().required('Stripe public key is required'),
    stripe_secret_key: yup.string().required('Stripe secret key is required'),
    paypal_client_id: yup.string().optional(),
    paypal_client_secret: yup.string().optional(),
    payment_currency: yup.string().required('Payment currency is required'),
    tax_rate: yup
      .number()
      .min(0, 'Tax rate cannot be negative')
      .max(100, 'Tax rate cannot exceed 100%')
      .optional(),
  }),
};
