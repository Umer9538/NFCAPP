// Format utility helpers for mobile app

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = 'CAD', locale = 'en-CA'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Title case (capitalize each word)
 */
export function titleCase(str: string): string {
  return str.split(' ').map(capitalize).join(' ');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string, maxLength = 2): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, maxLength);
}

/**
 * Format severity for display
 */
export function formatSeverity(severity: string): { label: string; color: string; bgColor: string } {
  const severityMap: Record<string, { label: string; color: string; bgColor: string }> = {
    low: { label: 'Low', color: '#22c55e', bgColor: '#dcfce7' },
    medium: { label: 'Medium', color: '#eab308', bgColor: '#fef9c3' },
    high: { label: 'High', color: '#f97316', bgColor: '#ffedd5' },
    critical: { label: 'Critical', color: '#ef4444', bgColor: '#fee2e2' }
  };
  
  return severityMap[severity.toLowerCase()] || { label: severity, color: '#6b7280', bgColor: '#f3f4f6' };
}

/**
 * Format status for display
 */
export function formatStatus(status: string): { label: string; color: string; bgColor: string } {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    open: { label: 'Open', color: '#3b82f6', bgColor: '#dbeafe' },
    investigating: { label: 'Investigating', color: '#f59e0b', bgColor: '#fef3c7' },
    resolved: { label: 'Resolved', color: '#22c55e', bgColor: '#dcfce7' },
    closed: { label: 'Closed', color: '#6b7280', bgColor: '#f3f4f6' },
    active: { label: 'Active', color: '#22c55e', bgColor: '#dcfce7' },
    inactive: { label: 'Inactive', color: '#6b7280', bgColor: '#f3f4f6' },
    suspended: { label: 'Suspended', color: '#ef4444', bgColor: '#fee2e2' },
    pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7' }
  };
  
  return statusMap[status.toLowerCase()] || { label: status, color: '#6b7280', bgColor: '#f3f4f6' };
}

/**
 * Format allergy severity for display
 */
export function formatAllergySeverity(severity: string): { label: string; color: string; bgColor: string } {
  const severityMap: Record<string, { label: string; color: string; bgColor: string }> = {
    mild: { label: 'Mild', color: '#22c55e', bgColor: '#dcfce7' },
    moderate: { label: 'Moderate', color: '#f59e0b', bgColor: '#fef3c7' },
    severe: { label: 'Severe', color: '#f97316', bgColor: '#ffedd5' },
    'life-threatening': { label: 'Life-Threatening', color: '#ef4444', bgColor: '#fee2e2' }
  };
  
  return severityMap[severity.toLowerCase()] || { label: severity, color: '#6b7280', bgColor: '#f3f4f6' };
}

/**
 * Format notification priority
 */
export function formatPriority(priority: string): { label: string; color: string; bgColor: string } {
  const priorityMap: Record<string, { label: string; color: string; bgColor: string }> = {
    low: { label: 'Low', color: '#6b7280', bgColor: '#f3f4f6' },
    medium: { label: 'Medium', color: '#3b82f6', bgColor: '#dbeafe' },
    high: { label: 'High', color: '#f97316', bgColor: '#ffedd5' },
    critical: { label: 'Critical', color: '#ef4444', bgColor: '#fee2e2' }
  };
  
  return priorityMap[priority.toLowerCase()] || { label: priority, color: '#6b7280', bgColor: '#f3f4f6' };
}

/**
 * Parse JSON safely
 */
export function parseJSON<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

