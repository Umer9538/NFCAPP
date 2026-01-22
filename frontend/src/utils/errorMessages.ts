/**
 * Error Message Utilities
 * Converts technical error messages to human-readable format
 */

/**
 * Convert any error to a user-friendly message
 */
export function getErrorMessage(error: any, context?: string): string {
  // Extract the raw message
  let rawMessage = '';
  if (typeof error === 'string') {
    rawMessage = error;
  } else if (error?.message) {
    rawMessage = error.message;
  } else if (error?.error) {
    rawMessage = error.error;
  }

  const msg = rawMessage.toLowerCase();

  // ============================================
  // AUTHENTICATION ERRORS
  // ============================================
  if (msg.includes('invalid credentials') || msg.includes('wrong password') || msg.includes('incorrect password')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('user not found') || msg.includes('no user') || msg.includes('account not found')) {
    return 'No account found with this email address.';
  }
  if (msg.includes('email already') || msg.includes('already registered') || msg.includes('already exists')) {
    if (context === 'signup') {
      return 'This email is already registered. Please try logging in instead.';
    }
    return 'This already exists. Please try a different one.';
  }
  if (msg.includes('email not verified') || msg.includes('verify your email')) {
    return 'Please verify your email address first.';
  }
  if (msg.includes('suspended') || msg.includes('account disabled')) {
    return 'Your account has been suspended. Please contact support.';
  }
  if (msg.includes('invalid token') || msg.includes('token expired') || msg.includes('session expired')) {
    return 'Your session has expired. Please log in again.';
  }
  if (msg.includes('unauthorized') || msg.includes('not authorized')) {
    return 'You are not authorized to do this. Please log in again.';
  }

  // ============================================
  // VALIDATION ERRORS
  // ============================================
  if (msg.includes('required') && msg.includes('field')) {
    return 'Please fill in all required fields.';
  }
  if (msg.includes('invalid email') || msg.includes('email invalid')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('short') || msg.includes('strong'))) {
    return 'Password must be at least 8 characters with letters and numbers.';
  }
  if (msg.includes('password') && msg.includes('match')) {
    return 'Passwords do not match. Please try again.';
  }
  if (msg.includes('phone') && msg.includes('invalid')) {
    return 'Please enter a valid phone number.';
  }
  if (msg.includes('validation failed') || msg.includes('invalid input')) {
    return 'Please check your input and try again.';
  }

  // ============================================
  // ORGANIZATION ERRORS
  // ============================================
  if (msg.includes('organization not found')) {
    return 'Organization not found. Please check your details.';
  }
  if (msg.includes('not part of') && msg.includes('organization')) {
    return 'You are not part of any organization.';
  }
  if (msg.includes('only admin') || msg.includes('administrator only') || msg.includes('admin only')) {
    return 'Only administrators can do this.';
  }
  if (msg.includes('only available for education')) {
    return 'This feature is only available for education accounts.';
  }

  // ============================================
  // PROFILE ERRORS
  // ============================================
  if (msg.includes('profile not found') || msg.includes('no profile')) {
    return 'Profile not found. Please complete your profile setup.';
  }
  if (msg.includes('profile incomplete') || msg.includes('complete your profile')) {
    return 'Please complete your profile first.';
  }

  // ============================================
  // MEDICAL DATA ERRORS
  // ============================================
  if (msg.includes('allergy') && msg.includes('already')) {
    return 'This allergy is already in your profile.';
  }
  if (msg.includes('medication') && msg.includes('already')) {
    return 'This medication is already in your profile.';
  }
  if (msg.includes('condition') && msg.includes('already')) {
    return 'This condition is already in your profile.';
  }
  if (msg.includes('contact') && msg.includes('already')) {
    return 'This contact is already added.';
  }

  // ============================================
  // NETWORK ERRORS
  // ============================================
  if (msg.includes('network error') || msg.includes('network request failed')) {
    return 'Unable to connect. Please check your internet connection.';
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'The request took too long. Please try again.';
  }
  if (msg.includes('connection') && (msg.includes('refused') || msg.includes('failed'))) {
    return 'Unable to connect to the server. Please try again.';
  }
  if (msg.includes('no internet') || msg.includes('offline')) {
    return 'You appear to be offline. Please check your connection.';
  }

  // ============================================
  // SERVER ERRORS
  // ============================================
  if (msg.includes('internal server error') || msg.includes('500')) {
    return 'Something went wrong on our end. Please try again.';
  }
  if (msg.includes('service unavailable') || msg.includes('503')) {
    return 'The service is temporarily unavailable. Please try again later.';
  }
  if (msg.includes('bad gateway') || msg.includes('502')) {
    return 'The service is temporarily unavailable. Please try again.';
  }

  // ============================================
  // PERMISSION ERRORS
  // ============================================
  if (msg.includes('permission denied') || msg.includes('access denied') || msg.includes('forbidden')) {
    return 'You don\'t have permission to do this.';
  }
  if (msg.includes('not allowed')) {
    return 'This action is not allowed.';
  }

  // ============================================
  // RESOURCE ERRORS
  // ============================================
  if (msg.includes('not found') || msg.includes('404')) {
    return 'The requested item was not found.';
  }
  if (msg.includes('already exists') || msg.includes('duplicate')) {
    return 'This item already exists.';
  }
  if (msg.includes('limit exceeded') || msg.includes('too many')) {
    return 'You\'ve reached the limit. Please try again later.';
  }

  // ============================================
  // FALLBACK - Clean up technical message
  // ============================================
  if (rawMessage) {
    // Remove technical prefixes
    let cleanMessage = rawMessage
      .replace(/^(error:|exception:|failed:)\s*/i, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\{.*?\}/g, '')
      .trim();

    // Capitalize first letter
    if (cleanMessage.length > 0) {
      cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
    }

    // Add period if missing
    if (cleanMessage && !cleanMessage.endsWith('.') && !cleanMessage.endsWith('!') && !cleanMessage.endsWith('?')) {
      cleanMessage += '.';
    }

    // If the message is still readable, return it
    if (cleanMessage.length > 0 && cleanMessage.length < 200) {
      return cleanMessage;
    }
  }

  // Ultimate fallback based on context
  switch (context) {
    case 'login':
      return 'Unable to sign in. Please check your credentials and try again.';
    case 'signup':
      return 'Unable to create account. Please try again.';
    case 'profile':
      return 'Unable to update profile. Please try again.';
    case 'save':
      return 'Unable to save changes. Please try again.';
    case 'load':
      return 'Unable to load data. Please try again.';
    case 'delete':
      return 'Unable to delete. Please try again.';
    case 'send':
      return 'Unable to send. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Get a success message for common actions
 */
export function getSuccessMessage(action: string, item?: string): string {
  const itemText = item ? ` ${item}` : '';

  switch (action) {
    case 'save':
      return `${item || 'Changes'} saved successfully!`;
    case 'create':
      return `${item || 'Item'} created successfully!`;
    case 'update':
      return `${item || 'Item'} updated successfully!`;
    case 'delete':
      return `${item || 'Item'} deleted successfully.`;
    case 'add':
      return `${item || 'Item'} added successfully!`;
    case 'remove':
      return `${item || 'Item'} removed.`;
    case 'send':
      return `${item || 'Message'} sent successfully!`;
    case 'invite':
      return `Invitation sent to${itemText}!`;
    case 'verify':
      return 'Verification successful!';
    case 'login':
      return 'Welcome back!';
    case 'signup':
      return 'Account created! Please verify your email.';
    case 'logout':
      return 'You have been logged out.';
    case 'password':
      return 'Password updated successfully!';
    default:
      return 'Success!';
  }
}
