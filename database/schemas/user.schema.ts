// User validation schemas for mobile app
// These can be used with Zod or converted to other validation libraries

export const userSchemas = {
  // Signup validation
  signup: {
    fullName: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: 'Full name is required'
    },
    username: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: 'Username must be at least 3 characters, alphanumeric and underscore only'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email address'
    },
    password: {
      required: true,
      minLength: 8,
      patterns: [
        { pattern: /[A-Z]/, message: 'Password must contain at least one uppercase letter' },
        { pattern: /[a-z]/, message: 'Password must contain at least one lowercase letter' },
        { pattern: /[0-9]/, message: 'Password must contain at least one number' }
      ],
      message: 'Password must be at least 8 characters'
    }
  },

  // Login validation
  login: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email address'
    },
    password: {
      required: true,
      minLength: 1,
      message: 'Password is required'
    }
  },

  // Profile update validation
  profileUpdate: {
    fullName: {
      minLength: 1,
      maxLength: 100,
      message: 'Full name cannot be empty'
    },
    phoneNumber: {
      pattern: /^\+?[0-9]{10,15}$/,
      message: 'Invalid phone number'
    },
    dateOfBirth: {
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      message: 'Date must be in YYYY-MM-DD format'
    },
    postalCode: {
      maxLength: 10,
      message: 'Invalid postal code'
    }
  },

  // Password change validation
  changePassword: {
    currentPassword: {
      required: true,
      message: 'Current password is required'
    },
    newPassword: {
      required: true,
      minLength: 8,
      patterns: [
        { pattern: /[A-Z]/, message: 'Password must contain at least one uppercase letter' },
        { pattern: /[a-z]/, message: 'Password must contain at least one lowercase letter' },
        { pattern: /[0-9]/, message: 'Password must contain at least one number' }
      ],
      message: 'New password must be at least 8 characters'
    }
  },

  // Verification code validation
  verificationCode: {
    code: {
      required: true,
      length: 6,
      pattern: /^[0-9]{6}$/,
      message: 'Verification code must be 6 digits'
    }
  }
};

// Helper function to validate a field
export function validateField(
  value: string | undefined | null,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    length?: number;
    pattern?: RegExp;
    patterns?: Array<{ pattern: RegExp; message: string }>;
    message?: string;
  }
): { valid: boolean; error?: string } {
  // Check required
  if (rules.required && (!value || value.trim() === '')) {
    return { valid: false, error: rules.message || 'This field is required' };
  }

  // If not required and empty, skip other validations
  if (!value || value.trim() === '') {
    return { valid: true };
  }

  // Check exact length
  if (rules.length && value.length !== rules.length) {
    return { valid: false, error: rules.message || `Must be exactly ${rules.length} characters` };
  }

  // Check min length
  if (rules.minLength && value.length < rules.minLength) {
    return { valid: false, error: rules.message || `Must be at least ${rules.minLength} characters` };
  }

  // Check max length
  if (rules.maxLength && value.length > rules.maxLength) {
    return { valid: false, error: rules.message || `Must be at most ${rules.maxLength} characters` };
  }

  // Check single pattern
  if (rules.pattern && !rules.pattern.test(value)) {
    return { valid: false, error: rules.message || 'Invalid format' };
  }

  // Check multiple patterns
  if (rules.patterns) {
    for (const { pattern, message } of rules.patterns) {
      if (!pattern.test(value)) {
        return { valid: false, error: message };
      }
    }
  }

  return { valid: true };
}

export default userSchemas;

