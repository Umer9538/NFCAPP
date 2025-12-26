export interface OSHAComplianceMetric {
  id: string;
  organizationId: string;
  category: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  lastReview: Date;
  nextReview: Date;
  violations: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOSHAComplianceMetricInput {
  category: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  lastReview: string | Date;
  nextReview: string | Date;
  violations?: number;
  notes?: string;
}

export interface UpdateOSHAComplianceMetricInput {
  status?: 'compliant' | 'non_compliant' | 'pending';
  lastReview?: string | Date;
  nextReview?: string | Date;
  violations?: number;
  notes?: string;
}

export interface TrainingRecord {
  id: string;
  organizationId: string;
  workerId: string;
  workerName: string;
  trainingType: string;
  completedDate: Date;
  expiryDate?: Date | null;
  status: 'current' | 'expired' | 'expiring_soon';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTrainingRecordInput {
  workerId: string;
  workerName: string;
  trainingType: string;
  completedDate: string | Date;
  expiryDate?: string | Date;
}

export interface UpdateTrainingRecordInput {
  trainingType?: string;
  completedDate?: string | Date;
  expiryDate?: string | Date;
}

// Worker with construction-specific fields
export interface Worker {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  position?: string | null;
  jobSite?: string | null;
  profileComplete: boolean;
  suspended: boolean;
  createdAt: Date;
}

export interface CreateWorkerInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  jobSite?: string;
}

export interface UpdateWorkerInput {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  position?: string;
  jobSite?: string;
}

// OSHA Compliance categories
export const OSHA_CATEGORIES = [
  'Personal Protective Equipment (PPE)',
  'Fall Protection',
  'Hazard Communication',
  'Machine Guarding',
  'Electrical Safety',
  'Scaffolding',
  'Ladders',
  'Excavation and Trenching',
  'Respiratory Protection',
  'Lockout/Tagout',
  'Fire Safety',
  'Crane Safety',
  'Welding Safety',
  'Chemical Safety',
  'Noise Exposure'
] as const;

export type OSHACategory = typeof OSHA_CATEGORIES[number];

// Training types
export const TRAINING_TYPES = [
  'OSHA 10-Hour Construction',
  'OSHA 30-Hour Construction',
  'OSHA 10-Hour General Industry',
  'OSHA 30-Hour General Industry',
  'Fall Protection',
  'Scaffold Safety',
  'Hazard Communication',
  'Forklift Certification',
  'Crane Operator',
  'First Aid/CPR',
  'Confined Space Entry',
  'Lockout/Tagout',
  'Electrical Safety',
  'Fire Extinguisher',
  'Respiratory Protection',
  'Excavation Safety',
  'Rigging',
  'Welding Safety',
  'PPE Training',
  'Aerial Lift',
  'Other'
] as const;

export type TrainingType = typeof TRAINING_TYPES[number];

// OSHA compliance stats
export interface OSHAComplianceStats {
  totalCategories: number;
  compliant: number;
  nonCompliant: number;
  pending: number;
  complianceRate: number;
  totalViolations: number;
}

export interface TrainingStats {
  totalRecords: number;
  current: number;
  expiringSoon: number;
  expired: number;
}

