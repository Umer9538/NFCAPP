/**
 * Database Services
 * Data access layer for all entities
 */

import { db } from './database';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalProfile {
  id: string;
  userId: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  organDonor: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalCondition {
  id: string;
  medicalProfileId: string;
  name: string;
  diagnosedDate?: string;
  severity?: string;
  notes?: string;
  createdAt: string;
}

export interface Allergy {
  id: string;
  medicalProfileId: string;
  allergen: string;
  reaction?: string;
  severity: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  medicalProfileId: string;
  name: string;
  dosage?: string;
  frequency?: string;
  prescribedBy?: string;
  startDate?: string;
  notes?: string;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: number;
  createdAt: string;
}

export interface Bracelet {
  id: string;
  userId: string;
  nfcId: string;
  status: string;
  linkedDate: string;
  lastAccessed?: string;
  accessCount: number;
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: string;
  invoiceDate: string;
  dueDate?: string;
  paidAt?: string;
  invoiceUrl?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: string;
}

// User Services
export const userService = {
  async getById(id: string): Promise<User | null> {
    return await db.getFirstAsync<User>('SELECT * FROM user WHERE id = ?', [id]);
  },

  async getByEmail(email: string): Promise<User | null> {
    return await db.getFirstAsync<User>('SELECT * FROM user WHERE email = ?', [email]);
  },

  async getAll(): Promise<User[]> {
    return await db.getAllAsync<User>('SELECT * FROM user');
  },

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO user (id, email, firstName, lastName, phone, dateOfBirth, profilePicture, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        user.phone || null,
        user.dateOfBirth || null,
        user.profilePicture || null,
        now,
        now,
      ]
    );
    return { ...user, createdAt: now, updatedAt: now };
  },

  async update(id: string, updates: Partial<User>): Promise<boolean> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.firstName) {
      fields.push('firstName = ?');
      values.push(updates.firstName);
    }
    if (updates.lastName) {
      fields.push('lastName = ?');
      values.push(updates.lastName);
    }
    if (updates.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updates.phone);
    }
    if (updates.dateOfBirth !== undefined) {
      fields.push('dateOfBirth = ?');
      values.push(updates.dateOfBirth);
    }
    if (updates.profilePicture !== undefined) {
      fields.push('profilePicture = ?');
      values.push(updates.profilePicture);
    }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE user SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  },
};

// Subscription Services
export const subscriptionService = {
  async getByUserId(userId: string): Promise<Subscription | null> {
    return await db.getFirstAsync<Subscription>(
      'SELECT * FROM subscription WHERE userId = ?',
      [userId]
    );
  },

  async create(subscription: Omit<Subscription, 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO subscription (id, userId, plan, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subscription.id,
        subscription.userId,
        subscription.plan,
        subscription.status,
        subscription.currentPeriodStart,
        subscription.currentPeriodEnd,
        subscription.cancelAtPeriodEnd,
        now,
        now,
      ]
    );
    return { ...subscription, createdAt: now, updatedAt: now };
  },

  async update(id: string, updates: Partial<Subscription>): Promise<boolean> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.plan) {
      fields.push('plan = ?');
      values.push(updates.plan);
    }
    if (updates.status) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.cancelAtPeriodEnd !== undefined) {
      fields.push('cancelAtPeriodEnd = ?');
      values.push(updates.cancelAtPeriodEnd);
    }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE subscription SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  },
};

// Medical Profile Services
export const medicalProfileService = {
  async getByUserId(userId: string): Promise<MedicalProfile | null> {
    return await db.getFirstAsync<MedicalProfile>(
      'SELECT * FROM medical_profile WHERE userId = ?',
      [userId]
    );
  },

  async update(id: string, updates: Partial<MedicalProfile>): Promise<boolean> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.bloodType !== undefined) {
      fields.push('bloodType = ?');
      values.push(updates.bloodType);
    }
    if (updates.height !== undefined) {
      fields.push('height = ?');
      values.push(updates.height);
    }
    if (updates.weight !== undefined) {
      fields.push('weight = ?');
      values.push(updates.weight);
    }
    if (updates.organDonor !== undefined) {
      fields.push('organDonor = ?');
      values.push(updates.organDonor);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    await db.runAsync(
      `UPDATE medical_profile SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  },
};

// Medical Conditions Services
export const medicalConditionsService = {
  async getByProfileId(medicalProfileId: string): Promise<MedicalCondition[]> {
    return await db.getAllAsync<MedicalCondition>(
      'SELECT * FROM medical_conditions WHERE medicalProfileId = ? ORDER BY createdAt DESC',
      [medicalProfileId]
    );
  },

  async create(condition: Omit<MedicalCondition, 'createdAt'>): Promise<MedicalCondition> {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO medical_conditions (id, medicalProfileId, name, diagnosedDate, severity, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        condition.id,
        condition.medicalProfileId,
        condition.name,
        condition.diagnosedDate || null,
        condition.severity || null,
        condition.notes || null,
        now,
      ]
    );
    return { ...condition, createdAt: now };
  },

  async delete(id: string): Promise<boolean> {
    await db.runAsync('DELETE FROM medical_conditions WHERE id = ?', [id]);
    return true;
  },
};

// Allergies Services
export const allergiesService = {
  async getByProfileId(medicalProfileId: string): Promise<Allergy[]> {
    return await db.getAllAsync<Allergy>(
      'SELECT * FROM allergies WHERE medicalProfileId = ? ORDER BY severity DESC, createdAt DESC',
      [medicalProfileId]
    );
  },

  async create(allergy: Omit<Allergy, 'createdAt'>): Promise<Allergy> {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO allergies (id, medicalProfileId, allergen, reaction, severity, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        allergy.id,
        allergy.medicalProfileId,
        allergy.allergen,
        allergy.reaction || null,
        allergy.severity,
        now,
      ]
    );
    return { ...allergy, createdAt: now };
  },

  async delete(id: string): Promise<boolean> {
    await db.runAsync('DELETE FROM allergies WHERE id = ?', [id]);
    return true;
  },
};

// Medications Services
export const medicationsService = {
  async getByProfileId(medicalProfileId: string): Promise<Medication[]> {
    return await db.getAllAsync<Medication>(
      'SELECT * FROM medications WHERE medicalProfileId = ? ORDER BY createdAt DESC',
      [medicalProfileId]
    );
  },

  async create(medication: Omit<Medication, 'createdAt'>): Promise<Medication> {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO medications (id, medicalProfileId, name, dosage, frequency, prescribedBy, startDate, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        medication.id,
        medication.medicalProfileId,
        medication.name,
        medication.dosage || null,
        medication.frequency || null,
        medication.prescribedBy || null,
        medication.startDate || null,
        medication.notes || null,
        now,
      ]
    );
    return { ...medication, createdAt: now };
  },

  async delete(id: string): Promise<boolean> {
    await db.runAsync('DELETE FROM medications WHERE id = ?', [id]);
    return true;
  },
};

// Emergency Contacts Services
export const emergencyContactsService = {
  async getByUserId(userId: string): Promise<EmergencyContact[]> {
    return await db.getAllAsync<EmergencyContact>(
      'SELECT * FROM emergency_contacts WHERE userId = ? ORDER BY isPrimary DESC, createdAt ASC',
      [userId]
    );
  },

  async create(contact: Omit<EmergencyContact, 'createdAt'>): Promise<EmergencyContact> {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO emergency_contacts (id, userId, name, relationship, phone, email, isPrimary, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contact.id,
        contact.userId,
        contact.name,
        contact.relationship,
        contact.phone,
        contact.email || null,
        contact.isPrimary,
        now,
      ]
    );
    return { ...contact, createdAt: now };
  },

  async update(id: string, updates: Partial<EmergencyContact>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.relationship) {
      fields.push('relationship = ?');
      values.push(updates.relationship);
    }
    if (updates.phone) {
      fields.push('phone = ?');
      values.push(updates.phone);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.isPrimary !== undefined) {
      fields.push('isPrimary = ?');
      values.push(updates.isPrimary);
    }

    values.push(id);

    await db.runAsync(
      `UPDATE emergency_contacts SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  },

  async delete(id: string): Promise<boolean> {
    await db.runAsync('DELETE FROM emergency_contacts WHERE id = ?', [id]);
    return true;
  },
};

// Bracelet Services
export const braceletService = {
  async getByUserId(userId: string): Promise<Bracelet | null> {
    return await db.getFirstAsync<Bracelet>(
      'SELECT * FROM bracelet WHERE userId = ?',
      [userId]
    );
  },

  async getByNfcId(nfcId: string): Promise<Bracelet | null> {
    return await db.getFirstAsync<Bracelet>(
      'SELECT * FROM bracelet WHERE nfcId = ?',
      [nfcId]
    );
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE bracelet SET status = ?, updatedAt = ? WHERE id = ?',
      [status, now, id]
    );
    return true;
  },

  async incrementAccessCount(id: string): Promise<boolean> {
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE bracelet SET accessCount = accessCount + 1, lastAccessed = ?, updatedAt = ? WHERE id = ?',
      [now, now, id]
    );
    return true;
  },
};

// Invoices Services
export const invoicesService = {
  async getByUserId(userId: string): Promise<Invoice[]> {
    return await db.getAllAsync<Invoice>(
      'SELECT * FROM invoices WHERE userId = ? ORDER BY invoiceDate DESC',
      [userId]
    );
  },
};

// Activity Logs Services
export const activityLogsService = {
  async getByUserId(userId: string, limit: number = 10): Promise<ActivityLog[]> {
    return await db.getAllAsync<ActivityLog>(
      'SELECT * FROM activity_logs WHERE userId = ? ORDER BY timestamp DESC LIMIT ?',
      [userId, limit]
    );
  },

  async create(log: Omit<ActivityLog, 'id'>): Promise<ActivityLog> {
    const id = Math.random().toString(36).substring(2, 15);
    await db.runAsync(
      `INSERT INTO activity_logs (id, userId, type, description, timestamp, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, log.userId, log.type, log.description, log.timestamp, log.metadata || null]
    );
    return { id, ...log };
  },
};

// Dashboard Services
export const dashboardService = {
  async getStats(userId: string) {
    const user = await userService.getById(userId);
    const medicalProfile = await medicalProfileService.getByUserId(userId);
    const conditions = medicalProfile
      ? await medicalConditionsService.getByProfileId(medicalProfile.id)
      : [];
    const allergies = medicalProfile
      ? await allergiesService.getByProfileId(medicalProfile.id)
      : [];
    const medications = medicalProfile
      ? await medicationsService.getByProfileId(medicalProfile.id)
      : [];
    const contacts = await emergencyContactsService.getByUserId(userId);
    const bracelet = await braceletService.getByUserId(userId);

    // Calculate profile completeness
    let completeness = 0;
    if (user?.firstName && user?.lastName) completeness += 20;
    if (user?.phone) completeness += 10;
    if (user?.dateOfBirth) completeness += 10;
    if (medicalProfile?.bloodType) completeness += 15;
    if (conditions.length > 0) completeness += 10;
    if (allergies.length > 0) completeness += 10;
    if (medications.length > 0) completeness += 10;
    if (contacts.length > 0) completeness += 15;

    return {
      profileCompleteness: Math.min(completeness, 100),
      upcomingReminders: 0, // Can be calculated based on medication schedules
      recentAccesses: {
        count: bracelet?.accessCount || 0,
        lastAccess: bracelet?.lastAccessed || null,
      },
      subscription: {
        plan: 'Monthly',
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  },

  async getRecentActivities(userId: string) {
    return await activityLogsService.getByUserId(userId, 10);
  },
};
