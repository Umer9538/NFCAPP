// Incident report/log validation schemas for mobile app

export const incidentSchemas = {
  // Incident report validation (Corporate)
  incidentReport: {
    title: {
      required: true,
      minLength: 1,
      maxLength: 200,
      message: 'Title is required'
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 2000,
      message: 'Description must be at least 10 characters'
    },
    employeeId: {
      required: true,
      message: 'Employee selection is required'
    },
    incidentDate: {
      required: true,
      message: 'Incident date is required'
    },
    severity: {
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      message: 'Severity is required'
    },
    location: {
      maxLength: 200,
      message: 'Location cannot exceed 200 characters'
    }
  },

  // Incident log validation (Construction) - extends incident report
  incidentLog: {
    title: {
      required: true,
      minLength: 1,
      maxLength: 200,
      message: 'Title is required'
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 2000,
      message: 'Description must be at least 10 characters'
    },
    employeeId: {
      required: true,
      message: 'Worker selection is required'
    },
    incidentDate: {
      required: true,
      message: 'Incident date is required'
    },
    incidentType: {
      required: true,
      enum: ['injury', 'first_aid', 'near_miss', 'property_damage', 'other'],
      message: 'Incident type is required'
    },
    severity: {
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      message: 'Severity is required'
    },
    location: {
      maxLength: 200,
      message: 'Location cannot exceed 200 characters'
    },
    bodyPartAffected: {
      maxLength: 100,
      message: 'Body part cannot exceed 100 characters'
    },
    treatmentProvided: {
      maxLength: 500,
      message: 'Treatment description cannot exceed 500 characters'
    }
  },

  // Status update validation
  statusUpdate: {
    status: {
      required: true,
      enum: ['open', 'investigating', 'resolved', 'closed'],
      message: 'Status is required'
    }
  }
};

// Severity levels with display info
export const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#22c55e', bgColor: '#dcfce7' },
  { value: 'medium', label: 'Medium', color: '#eab308', bgColor: '#fef9c3' },
  { value: 'high', label: 'High', color: '#f97316', bgColor: '#ffedd5' },
  { value: 'critical', label: 'Critical', color: '#ef4444', bgColor: '#fee2e2' }
];

// Status levels with display info
export const STATUS_LEVELS = [
  { value: 'open', label: 'Open', color: '#3b82f6', bgColor: '#dbeafe' },
  { value: 'investigating', label: 'Investigating', color: '#f59e0b', bgColor: '#fef3c7' },
  { value: 'resolved', label: 'Resolved', color: '#22c55e', bgColor: '#dcfce7' },
  { value: 'closed', label: 'Closed', color: '#6b7280', bgColor: '#f3f4f6' }
];

// Incident types with display info
export const INCIDENT_TYPE_OPTIONS = [
  { value: 'injury', label: 'Injury', icon: 'alert-triangle' },
  { value: 'first_aid', label: 'First Aid', icon: 'heart' },
  { value: 'near_miss', label: 'Near Miss', icon: 'alert-circle' },
  { value: 'property_damage', label: 'Property Damage', icon: 'home' },
  { value: 'other', label: 'Other', icon: 'more-horizontal' }
];

export default incidentSchemas;

