import { IncidentStatus, IncidentSeverity, IncidentType } from './common.types';

export interface IncidentReport {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  incidentDate: Date;
  location?: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedById: string;
  reportedByName: string;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Construction-specific incident log with additional fields
export interface IncidentLog extends IncidentReport {
  incidentType: IncidentType;
  bodyPartAffected?: string | null;
  treatmentProvided?: string | null;
  requiresMedicalAttention?: boolean;
}

export interface CreateIncidentReportInput {
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  incidentDate: string | Date;
  location?: string;
  severity: IncidentSeverity;
}

export interface CreateIncidentLogInput extends CreateIncidentReportInput {
  incidentType: IncidentType;
  bodyPartAffected?: string;
  treatmentProvided?: string;
  requiresMedicalAttention?: boolean;
}

export interface UpdateIncidentStatusInput {
  status: IncidentStatus;
}

export interface IncidentFilters {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  incidentType?: IncidentType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface IncidentStats {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  closed: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

// Body parts for incident logs
export const BODY_PARTS = [
  'Head',
  'Neck',
  'Shoulder',
  'Arm',
  'Elbow',
  'Wrist',
  'Hand',
  'Finger',
  'Chest',
  'Back',
  'Abdomen',
  'Hip',
  'Leg',
  'Knee',
  'Ankle',
  'Foot',
  'Toe',
  'Multiple',
  'Other'
] as const;

export type BodyPart = typeof BODY_PARTS[number];

// Incident types for construction
export const INCIDENT_TYPES = [
  'injury',
  'first_aid',
  'near_miss',
  'property_damage',
  'other'
] as const;

