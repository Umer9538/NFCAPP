/**
 * React Query Configuration
 * Optional setup for using TanStack Query with the API
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure React Query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Retry failed requests
      retry: 1,
      // Stale time (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Cache time (10 minutes)
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
});

/**
 * Query Keys
 * Centralized query keys for type safety and consistency
 */
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    sessions: ['auth', 'sessions'] as const,
  },

  // Emergency Profile
  emergencyProfile: {
    all: ['emergency-profile'] as const,
    detail: (id: string) => ['emergency-profile', id] as const,
    current: ['emergency-profile', 'current'] as const,
  },

  // Medical
  medical: {
    conditions: ['medical', 'conditions'] as const,
    medications: ['medical', 'medications'] as const,
    allergies: ['medical', 'allergies'] as const,
  },

  // Contacts
  contacts: {
    all: ['contacts'] as const,
    detail: (id: string) => ['contacts', id] as const,
  },

  // NFC
  nfc: {
    tags: ['nfc', 'tags'] as const,
    tag: (id: string) => ['nfc', 'tags', id] as const,
    scans: (tagId: string) => ['nfc', 'scans', tagId] as const,
    allScans: ['nfc', 'scans'] as const,
  },

  // QR
  qr: {
    code: (profileId: string) => ['qr', profileId] as const,
  },
};

/**
 * Mutation Keys (for optimistic updates)
 */
export const mutationKeys = {
  auth: {
    login: 'auth.login',
    signup: 'auth.signup',
    logout: 'auth.logout',
    updateProfile: 'auth.updateProfile',
  },
  emergencyProfile: {
    create: 'emergencyProfile.create',
    update: 'emergencyProfile.update',
    delete: 'emergencyProfile.delete',
  },
  medical: {
    addCondition: 'medical.addCondition',
    updateCondition: 'medical.updateCondition',
    deleteCondition: 'medical.deleteCondition',
    addMedication: 'medical.addMedication',
    updateMedication: 'medical.updateMedication',
    deleteMedication: 'medical.deleteMedication',
    addAllergy: 'medical.addAllergy',
    updateAllergy: 'medical.updateAllergy',
    deleteAllergy: 'medical.deleteAllergy',
  },
  contacts: {
    add: 'contacts.add',
    update: 'contacts.update',
    delete: 'contacts.delete',
  },
  nfc: {
    register: 'nfc.register',
    deactivate: 'nfc.deactivate',
    update: 'nfc.update',
    delete: 'nfc.delete',
  },
  qr: {
    generate: 'qr.generate',
    regenerate: 'qr.regenerate',
  },
};
