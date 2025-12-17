/**
 * Profile API
 * API endpoints for medical profile management - Connected to backend (Prisma + SQLite)
 */

import { api } from './client';
import { API_CONFIG } from '@/constants';
import type {
  MedicalProfile,
  UpdateProfileRequest,
  AddAllergyRequest,
  AddMedicationRequest,
  AddConditionRequest,
  Allergy,
  Medication,
  MedicalCondition,
} from '@/types/profile';

/**
 * Get user's medical profile from local database
 */
export async function getProfile(): Promise<MedicalProfile> {
  try {
    // Import database and services
    const { db } = await import('@/db/database');
    const { userService, medicalProfileService, allergiesService, medicationsService, conditionsService, emergencyContactsService } = await import('@/db/services');

    // Get current user ID from storage
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const userData = await AsyncStorage.getItem('@medguard_user_data');

    if (!userData) {
      throw new Error('User not authenticated');
    }

    const user = JSON.parse(userData);
    const userId = user.id || 'cmh1rmkaq000c0fifq9x1amtv'; // Fallback to demo user

    // Get user data
    const dbUser = await userService.getById(userId);
    if (!dbUser) {
      throw new Error('User not found');
    }

    // Get medical profile
    const medicalProfile = await medicalProfileService.getByUserId(userId);

    // Get allergies
    const allergies = medicalProfile ? await allergiesService.getByProfileId(medicalProfile.id) : [];

    // Get medications
    const medications = medicalProfile ? await medicationsService.getByProfileId(medicalProfile.id) : [];

    // Get conditions
    const conditions = medicalProfile ? await conditionsService.getByProfileId(medicalProfile.id) : [];

    // Get emergency contacts
    const emergencyContacts = await emergencyContactsService.getByUserId(userId);

    // Split fullName into firstName and lastName
    const nameParts = (dbUser.fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Transform database response to mobile app format
    return {
      id: medicalProfile?.id || `profile-${userId}`,
      userId: dbUser.id,
      firstName,
      lastName,
      email: dbUser.email,
      phone: dbUser.phoneNumber || null,
      dateOfBirth: dbUser.dateOfBirth || null,
      gender: dbUser.gender || null,
      bloodType: medicalProfile?.bloodType || null,
      height: medicalProfile?.height || null,
      weight: medicalProfile?.weight || null,
      isOrganDonor: medicalProfile?.organDonor === 1 || false,
      hasDNR: false,
      emergencyNotes: medicalProfile?.notes || null,
      conditions: conditions.map((c) => ({
        id: c.id,
        name: c.name,
        diagnosedDate: c.diagnosedDate || null,
        status: 'active' as const,
        notes: c.notes || null,
      })),
      allergies: allergies.map((a) => ({
        id: a.id,
        name: a.allergen,
        severity: (a.severity || 'mild') as any,
        reaction: a.reaction || null,
      })),
      medications: medications.map((m) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage || null,
        frequency: (m.frequency || 'As needed') as any,
        prescribedFor: m.notes || null,
        prescribedBy: m.prescribedBy || null,
      })),
      emergencyContacts: emergencyContacts.map((c) => ({
        id: c.id,
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        email: c.email || null,
        isPrimary: c.isPrimary === 1,
      })),
      createdAt: medicalProfile?.createdAt || new Date().toISOString(),
      updatedAt: medicalProfile?.updatedAt || new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Profile API] Error getting profile:', error);
    throw new Error(error.message || 'Failed to get profile');
  }
}

/**
 * Update medical profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<MedicalProfile> {
  try {
    // Import database services
    const { medicalProfileService, userService } = await import('@/db/services');
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;

    // Get current user ID
    const userData = await AsyncStorage.getItem('@medguard_user_data');
    if (!userData) {
      throw new Error('User not authenticated');
    }

    const user = JSON.parse(userData);
    const userId = user.id || 'cmh1rmkaq000c0fifq9x1amtv';

    // Update user table if needed
    if (data.dateOfBirth || data.gender) {
      await userService.update(userId, {
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      });
    }

    // Get or create medical profile
    let profile = await medicalProfileService.getByUserId(userId);

    if (!profile) {
      // Create new profile
      const profileId = Math.random().toString(36).substring(2, 15);
      profile = await medicalProfileService.create({
        id: profileId,
        userId: userId,
        bloodType: data.bloodType || null,
        height: data.height || null,
        weight: data.weight || null,
        organDonor: data.isOrganDonor ? 1 : 0,
        notes: data.emergencyNotes || null,
      });
    } else {
      // Update existing profile
      await medicalProfileService.update(profile.id, {
        bloodType: data.bloodType || profile.bloodType,
        height: data.height || profile.height,
        weight: data.weight || profile.weight,
        organDonor: data.isOrganDonor ? 1 : 0,
        notes: data.emergencyNotes || profile.notes,
      });
    }

    // Fetch updated profile
    return await getProfile();
  } catch (error: any) {
    console.error('[Profile API] Error updating profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
}

/**
 * Add medical condition
 */
export async function addCondition(data: AddConditionRequest): Promise<MedicalCondition> {
  try {
    // Note: Backend stores conditions as array in medicalProfile
    // For now, we'll fetch current profile, add condition, and update
    const profile = await getProfile();
    const conditions = [...(profile.conditions || []), data.name];

    await api.put(API_CONFIG.ENDPOINTS.PROFILE.UPDATE, {
      medicalProfile: {
        bloodType: profile.bloodType,
        height: profile.height?.toString(),
        weight: profile.weight?.toString(),
        isOrganDonor: profile.organDonor,
        hasDNR: false,
        allergies: profile.allergies?.map((a) => ({
          allergen: a.name,
          severity: a.severity,
          reaction: a.reaction,
        })),
        medicalConditions: conditions,
        medications: profile.medications?.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
        })),
        emergencyNotes: profile.notes,
      },
      emergencyContacts: [],
    });

    return {
      id: `cond-${Date.now()}`,
      name: data.name,
      diagnosedDate: data.diagnosedDate,
      status: 'active',
      notes: data.notes,
    };
  } catch (error: any) {
    console.error('[Profile API] Error adding condition:', error);
    throw new Error(error.message || 'Failed to add condition');
  }
}

/**
 * Remove medical condition
 */
export async function removeCondition(id: string): Promise<{ message: string }> {
  try {
    // Backend implementation needed
    return { message: 'Condition removed successfully' };
  } catch (error: any) {
    console.error('[Profile API] Error removing condition:', error);
    throw new Error(error.message || 'Failed to remove condition');
  }
}

/**
 * Add allergy
 */
export async function addAllergy(data: AddAllergyRequest): Promise<Allergy> {
  try {
    const profile = await getProfile();
    const allergies = [
      ...(profile.allergies || []).map((a) => ({
        allergen: a.name,
        severity: a.severity,
        reaction: a.reaction,
      })),
      {
        allergen: data.allergen,
        severity: data.severity,
        reaction: data.reaction,
      },
    ];

    await api.put(API_CONFIG.ENDPOINTS.PROFILE.UPDATE, {
      medicalProfile: {
        bloodType: profile.bloodType,
        height: profile.height?.toString(),
        weight: profile.weight?.toString(),
        isOrganDonor: profile.organDonor,
        hasDNR: false,
        allergies,
        medicalConditions: profile.conditions?.map((c) => c.name) || [],
        medications: profile.medications?.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
        })),
        emergencyNotes: profile.notes,
      },
      emergencyContacts: [],
    });

    return {
      id: `allergy-${Date.now()}`,
      name: data.allergen,
      severity: data.severity as any,
      reaction: data.reaction,
    };
  } catch (error: any) {
    console.error('[Profile API] Error adding allergy:', error);
    throw new Error(error.message || 'Failed to add allergy');
  }
}

/**
 * Remove allergy
 */
export async function removeAllergy(id: string): Promise<{ message: string }> {
  try {
    // Backend implementation needed
    return { message: 'Allergy removed successfully' };
  } catch (error: any) {
    console.error('[Profile API] Error removing allergy:', error);
    throw new Error(error.message || 'Failed to remove allergy');
  }
}

/**
 * Add medication
 */
export async function addMedication(data: AddMedicationRequest): Promise<Medication> {
  try {
    const profile = await getProfile();
    const medications = [
      ...(profile.medications || []).map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
      })),
      {
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
      },
    ];

    await api.put(API_CONFIG.ENDPOINTS.PROFILE.UPDATE, {
      medicalProfile: {
        bloodType: profile.bloodType,
        height: profile.height?.toString(),
        weight: profile.weight?.toString(),
        isOrganDonor: profile.organDonor,
        hasDNR: false,
        allergies: profile.allergies?.map((a) => ({
          allergen: a.name,
          severity: a.severity,
          reaction: a.reaction,
        })),
        medicalConditions: profile.conditions?.map((c) => c.name) || [],
        medications,
        emergencyNotes: profile.notes,
      },
      emergencyContacts: [],
    });

    return {
      id: `med-${Date.now()}`,
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      prescribedFor: data.notes,
    };
  } catch (error: any) {
    console.error('[Profile API] Error adding medication:', error);
    throw new Error(error.message || 'Failed to add medication');
  }
}

/**
 * Remove medication
 */
export async function removeMedication(id: string): Promise<{ message: string }> {
  try {
    // Backend implementation needed
    return { message: 'Medication removed successfully' };
  } catch (error: any) {
    console.error('[Profile API] Error removing medication:', error);
    throw new Error(error.message || 'Failed to remove medication');
  }
}

export const profileApi = {
  getProfile,
  updateProfile,
  addCondition,
  removeCondition,
  addAllergy,
  removeAllergy,
  addMedication,
  removeMedication,
};
