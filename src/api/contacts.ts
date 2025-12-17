/**
 * Contacts API
 * API endpoints for emergency contacts and doctor information - Using SQLite database
 */

import { emergencyContactsService } from '@/db/services';
import type {
  EmergencyContact,
  EmergencyContactInput,
  DoctorInfo,
  DoctorInfoInput,
} from '@/types/dashboard';

// Demo user ID for local development
const DEMO_USER_ID = 'user-demo-001';

/**
 * Get all emergency contacts
 */
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  try {
    const contacts = await emergencyContactsService.getByUserId(DEMO_USER_ID);

    return contacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email,
      isPrimary: contact.isPrimary === 1,
      createdAt: contact.createdAt,
      updatedAt: contact.createdAt, // No updatedAt in DB schema
    }));
  } catch (error) {
    console.error('[Contacts API] Error getting contacts:', error);
    throw error;
  }
}

/**
 * Get a single emergency contact
 */
export async function getEmergencyContact(id: string): Promise<EmergencyContact> {
  try {
    const contacts = await emergencyContactsService.getByUserId(DEMO_USER_ID);
    const contact = contacts.find((c) => c.id === id);

    if (!contact) {
      throw new Error('Contact not found');
    }

    return {
      id: contact.id,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email,
      isPrimary: contact.isPrimary === 1,
      createdAt: contact.createdAt,
      updatedAt: contact.createdAt,
    };
  } catch (error) {
    console.error('[Contacts API] Error getting contact:', error);
    throw error;
  }
}

/**
 * Add a new emergency contact
 */
export async function addEmergencyContact(
  data: EmergencyContactInput
): Promise<EmergencyContact> {
  try {
    const id = Math.random().toString(36).substring(2, 15);
    const contact = await emergencyContactsService.create({
      id,
      userId: DEMO_USER_ID,
      name: data.name,
      relationship: data.relationship,
      phone: data.phone,
      email: data.email,
      isPrimary: data.isPrimary ? 1 : 0,
    });

    return {
      id: contact.id,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email,
      isPrimary: contact.isPrimary === 1,
      createdAt: contact.createdAt,
      updatedAt: contact.createdAt,
    };
  } catch (error) {
    console.error('[Contacts API] Error adding contact:', error);
    throw error;
  }
}

/**
 * Update an emergency contact
 */
export async function updateEmergencyContact(
  id: string,
  data: Partial<EmergencyContactInput>
): Promise<EmergencyContact> {
  try {
    await emergencyContactsService.update(id, {
      name: data.name,
      relationship: data.relationship,
      phone: data.phone,
      email: data.email,
      isPrimary: data.isPrimary !== undefined ? (data.isPrimary ? 1 : 0) : undefined,
    });

    return await getEmergencyContact(id);
  } catch (error) {
    console.error('[Contacts API] Error updating contact:', error);
    throw error;
  }
}

/**
 * Delete an emergency contact
 */
export async function deleteEmergencyContact(id: string): Promise<{ message: string }> {
  try {
    await emergencyContactsService.delete(id);
    return { message: 'Contact deleted successfully' };
  } catch (error) {
    console.error('[Contacts API] Error deleting contact:', error);
    throw error;
  }
}

/**
 * Get doctor information
 */
export async function getDoctorInfo(): Promise<DoctorInfo | null> {
  try {
    // Get the emergency contact with relationship "Primary Care Physician" or "Doctor"
    const contacts = await emergencyContactsService.getByUserId(DEMO_USER_ID);
    const doctorContact = contacts.find(
      (c) => c.relationship === 'Primary Care Physician' || c.relationship === 'Doctor'
    );

    if (!doctorContact) {
      return null;
    }

    return {
      id: doctorContact.id,
      name: doctorContact.name,
      phone: doctorContact.phone,
      email: doctorContact.email,
      specialty: undefined, // Not in current schema
      address: undefined, // Not in current schema
      updatedAt: doctorContact.createdAt,
    };
  } catch (error) {
    console.error('[Contacts API] Error getting doctor info:', error);
    throw error;
  }
}

/**
 * Update doctor information
 */
export async function updateDoctorInfo(data: DoctorInfoInput): Promise<DoctorInfo> {
  try {
    // Check if doctor contact exists
    const contacts = await emergencyContactsService.getByUserId(DEMO_USER_ID);
    const existingDoctor = contacts.find(
      (c) => c.relationship === 'Primary Care Physician' || c.relationship === 'Doctor'
    );

    if (existingDoctor) {
      // Update existing doctor contact
      await emergencyContactsService.update(existingDoctor.id, {
        name: data.name,
        phone: data.phone,
        email: data.email,
        relationship: 'Primary Care Physician',
      });

      return {
        id: existingDoctor.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        specialty: data.specialty,
        address: data.address,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Create new doctor contact
      const id = Math.random().toString(36).substring(2, 15);
      const contact = await emergencyContactsService.create({
        id,
        userId: DEMO_USER_ID,
        name: data.name,
        relationship: 'Primary Care Physician',
        phone: data.phone,
        email: data.email,
        isPrimary: 0,
      });

      return {
        id: contact.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        specialty: data.specialty,
        address: data.address,
        updatedAt: contact.createdAt,
      };
    }
  } catch (error) {
    console.error('[Contacts API] Error updating doctor info:', error);
    throw error;
  }
}

export const contactsApi = {
  getEmergencyContacts,
  getEmergencyContact,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  getDoctorInfo,
  updateDoctorInfo,
};
