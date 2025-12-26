export interface Allergy {
  name: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  notes?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
}

export interface MedicalCondition {
  name: string;
  diagnosisDate?: string;
  notes?: string;
}

export interface MedicalProfile {
  id: string;
  userId: string;
  bloodType: string;
  height: string;
  weight: string;
  allergies: string; // JSON string of Allergy[]
  medicalConditions: string; // JSON string of MedicalCondition[]
  medications: string; // JSON string of Medication[]
  emergencyNotes?: string | null;
  isOrganDonor: boolean;
  hasDNR: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalProfileParsed extends Omit<MedicalProfile, 'allergies' | 'medicalConditions' | 'medications'> {
  allergies: Allergy[];
  medicalConditions: MedicalCondition[];
  medications: Medication[];
}

export interface CreateMedicalProfileInput {
  bloodType: string;
  height: string;
  weight: string;
  allergies: Allergy[];
  medicalConditions: MedicalCondition[];
  medications: Medication[];
  emergencyNotes?: string;
  isOrganDonor?: boolean;
  hasDNR?: boolean;
}

export interface UpdateMedicalProfileInput {
  bloodType?: string;
  height?: string;
  weight?: string;
  allergies?: Allergy[];
  medicalConditions?: MedicalCondition[];
  medications?: Medication[];
  emergencyNotes?: string;
  isOrganDonor?: boolean;
  hasDNR?: boolean;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relation: string;
  phone: string;
  email?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmergencyContactInput {
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

export interface UpdateEmergencyContactInput {
  name?: string;
  relation?: string;
  phone?: string;
  email?: string;
}

export interface DoctorInfo {
  id: string;
  userId: string;
  doctorName: string;
  doctorPhone?: string | null;
  doctorEmail?: string | null;
  doctorSpecialty?: string | null;
  doctorAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDoctorInfoInput {
  doctorName: string;
  doctorPhone?: string;
  doctorEmail?: string;
  doctorSpecialty?: string;
  doctorAddress?: string;
}

export interface UpdateDoctorInfoInput {
  doctorName?: string;
  doctorPhone?: string;
  doctorEmail?: string;
  doctorSpecialty?: string;
  doctorAddress?: string;
}

export interface Prescription {
  id: string;
  userId: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Blood type options for dropdown
export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'
] as const;

export type BloodType = typeof BLOOD_TYPES[number];

// Allergy severity options
export const ALLERGY_SEVERITIES = [
  'mild', 'moderate', 'severe', 'life-threatening'
] as const;

export type AllergySeverity = typeof ALLERGY_SEVERITIES[number];

// Common medication frequencies
export const MEDICATION_FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'Once weekly',
  'Once monthly',
  'Custom'
] as const;

export type MedicationFrequency = typeof MEDICATION_FREQUENCIES[number];

