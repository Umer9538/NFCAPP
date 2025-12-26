// Medical profile validation schemas for mobile app

export const medicalSchemas = {
  // Medical profile validation
  medicalProfile: {
    bloodType: {
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      message: 'Blood type is required'
    },
    height: {
      required: true,
      pattern: /^\d+(\.\d+)?\s*(cm|ft|in|m)?$/i,
      message: 'Height is required'
    },
    weight: {
      required: true,
      pattern: /^\d+(\.\d+)?\s*(kg|lbs|lb)?$/i,
      message: 'Weight is required'
    }
  },

  // Allergy validation
  allergy: {
    name: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: 'Allergy name is required'
    },
    severity: {
      required: true,
      enum: ['mild', 'moderate', 'severe', 'life-threatening'],
      message: 'Severity is required'
    },
    notes: {
      maxLength: 500,
      message: 'Notes cannot exceed 500 characters'
    }
  },

  // Medication validation
  medication: {
    name: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: 'Medication name is required'
    },
    dosage: {
      required: true,
      minLength: 1,
      maxLength: 50,
      message: 'Dosage is required'
    },
    frequency: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: 'Frequency is required'
    },
    notes: {
      maxLength: 500,
      message: 'Notes cannot exceed 500 characters'
    }
  },

  // Medical condition validation
  medicalCondition: {
    name: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: 'Condition name is required'
    },
    diagnosisDate: {
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      message: 'Date must be in YYYY-MM-DD format'
    },
    notes: {
      maxLength: 500,
      message: 'Notes cannot exceed 500 characters'
    }
  },

  // Emergency contact validation
  emergencyContact: {
    name: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: 'Contact name is required'
    },
    relation: {
      required: true,
      minLength: 1,
      maxLength: 50,
      message: 'Relationship is required'
    },
    phone: {
      required: true,
      pattern: /^\+?[0-9]{10,15}$/,
      message: 'Valid phone number is required'
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email address'
    }
  },

  // Doctor info validation
  doctorInfo: {
    doctorName: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: 'Doctor name is required'
    },
    doctorPhone: {
      pattern: /^\+?[0-9]{10,15}$/,
      message: 'Invalid phone number'
    },
    doctorEmail: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email address'
    },
    doctorSpecialty: {
      maxLength: 100,
      message: 'Specialty cannot exceed 100 characters'
    },
    doctorAddress: {
      maxLength: 200,
      message: 'Address cannot exceed 200 characters'
    }
  }
};

// Helper to validate enum values
export function validateEnum(value: string, enumValues: string[]): boolean {
  return enumValues.includes(value);
}

// Helper to validate array of objects
export function validateArray<T>(
  items: T[],
  validateItem: (item: T) => { valid: boolean; errors: string[] }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  items.forEach((item, index) => {
    const result = validateItem(item);
    if (!result.valid) {
      result.errors.forEach(error => {
        errors.push(`Item ${index + 1}: ${error}`);
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export default medicalSchemas;

