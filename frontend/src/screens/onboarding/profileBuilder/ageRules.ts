/**
 * Mirrors lib/validation/age-rules.ts in the web platform. The backend
 * rejects submits that violate these — we enforce client-side too so the
 * UI hides/disables fields before the user wastes effort on them.
 */

import type { Gender, ProfileFormData } from './types';

export function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function showPregnancyTab(gender: Gender, age: number | null): boolean {
  if (!gender || gender.toLowerCase() !== 'female') return false;
  if (age === null || age < 12 || age > 55) return false;
  return true;
}

export function showPediatricTab(age: number | null): boolean {
  return age !== null && age < 18;
}

export function isUnder18(age: number | null): boolean {
  return age !== null && age < 18;
}

export function isUnder3(age: number | null): boolean {
  return age !== null && age < 3;
}

export function isSchoolAge(age: number | null): boolean {
  return age !== null && age >= 5 && age <= 18;
}

export function ageGroupLabel(age: number | null): string {
  if (age === null) return '';
  if (age <= 2) return 'Infant';
  if (age <= 12) return 'Child';
  if (age <= 17) return 'Adolescent';
  if (age <= 64) return 'Adult';
  return 'Senior';
}

/**
 * Client-side mirror of the backend's age validation. Returns an error string
 * if any rule is violated, otherwise null. Substance-use fields must stay
 * "none"/empty for under-18 users.
 */
export function validateAgeRules(data: ProfileFormData): string | null {
  const age = calculateAge(data.dateOfBirth);
  if (age === null) return null;

  if (age < 18) {
    if (data.alcoholUse && data.alcoholUse !== 'none') {
      return 'Substance-use questions are only available for users 18+.';
    }
    if (data.tobaccoUse && data.tobaccoUse !== 'none') {
      return 'Substance-use questions are only available for users 18+.';
    }
    if (data.recreationalDrugUse && data.recreationalDrugUse !== 'none') {
      return 'Substance-use questions are only available for users 18+.';
    }
  }

  return null;
}
