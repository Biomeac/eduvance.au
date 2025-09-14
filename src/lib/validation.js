// src/lib/validation.js
// Client-side validation utilities for frontend components
import { useState } from 'react';

// Validation schemas for different data types
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character'
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: 'Username must be 3-50 characters, letters, numbers, hyphens, and underscores only'
  },
  subjectName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s-]+$/,
    message: 'Subject name must be 2-100 characters, letters, numbers, spaces, and hyphens only'
  },
  description: {
    required: false,
    maxLength: 1000,
    message: 'Description must be less than 1000 characters'
  },
  url: {
    required: true,
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid URL starting with http:// or https://'
  },
  googleDriveUrl: {
    required: true,
    pattern: /^https:\/\/drive\.google\.com\/.+/,
    message: 'Please enter a valid Google Drive URL'
  }
};

// Sanitize input to prevent XSS
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Validate a single field
export function validateField(value, rules) {
  const errors = [];
  
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(`${rules.message || 'This field is required'}`);
    return errors;
  }
  
  if (value && value.toString().trim() !== '') {
    const stringValue = value.toString();
    
    if (rules.minLength && stringValue.length < rules.minLength) {
      errors.push(`${rules.message || `Must be at least ${rules.minLength} characters`}`);
    }
    
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      errors.push(`${rules.message || `Must be no more than ${rules.maxLength} characters`}`);
    }
    
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      errors.push(rules.message || 'Invalid format');
    }
  }
  
  return errors;
}

// Validate form data against schema
export function validateForm(data, schema) {
  const errors = {};
  let isValid = true;
  
  for (const [field, rules] of Object.entries(schema)) {
    const fieldErrors = validateField(data[field], rules);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  }
  
  return { isValid, errors };
}

// Validate and sanitize form data
export function validateAndSanitizeForm(data, schema) {
  const sanitizedData = sanitizeInput(data);
  const validation = validateForm(sanitizedData, schema);
  
  return {
    ...validation,
    data: sanitizedData
  };
}

// Common validation schemas for forms
export const FORM_SCHEMAS = {
  staffLogin: {
    email: VALIDATION_RULES.email,
    password: { required: true, message: 'Password is required' }
  },
  staffUser: {
    username: VALIDATION_RULES.username,
    email: VALIDATION_RULES.email,
    password: VALIDATION_RULES.password,
    role: {
      required: true,
      enum: ['admin', 'moderator', 'staff'],
      message: 'Role must be admin, moderator, or staff'
    }
  },
  resourceUpload: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 200,
      message: 'Title must be 3-200 characters'
    },
    description: VALIDATION_RULES.description,
    link: VALIDATION_RULES.url,
    unitChapterName: {
      required: false,
      maxLength: 100,
      message: 'Unit/Chapter name must be less than 100 characters'
    }
  },
  communityNote: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 200,
      message: 'Title must be 3-200 characters'
    },
    description: VALIDATION_RULES.description,
    link: VALIDATION_RULES.url,
    unitChapterName: {
      required: false,
      maxLength: 100,
      message: 'Unit/Chapter name must be less than 100 characters'
    }
  }
};

// Real-time validation hook for React components
export function useValidation(schema) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validateFieldInHook = (field, value) => {
    const fieldSchema = schema[field];
    if (!fieldSchema) return;
    
    const fieldErrors = validateField(value, fieldSchema);
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors
    }));
  };
  
  const handleBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateFieldInHook(field, value);
  };
  
  const handleChange = (field, value) => {
    if (touched[field]) {
      validateFieldInHook(field, value);
    }
  };
  
  const validateFormInHook = (data) => {
    const validation = validateForm(data, schema);
    setErrors(validation.errors);
    setTouched(Object.keys(schema).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return validation;
  };
  
  const resetValidation = () => {
    setErrors({});
    setTouched({});
  };
  
  return {
    errors,
    touched,
    validateField: validateFieldInHook,
    handleBlur,
    handleChange,
    validateForm: validateFormInHook,
    resetValidation
  };
}

// CSRF token generation and validation
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token, sessionToken) {
  return token && sessionToken && token === sessionToken;
}

// File upload validation
export function validateFileUpload(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'],
    allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif']
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(`File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// SQL injection prevention for search queries
export function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return '';
  
  return query
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .replace(/[;\\]/g, '') // Remove SQL injection characters
    .trim()
    .substring(0, 100); // Limit length
}

// XSS prevention for user-generated content
export function sanitizeUserContent(content) {
  if (typeof content !== 'string') return '';
  
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}
