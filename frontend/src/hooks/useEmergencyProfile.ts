/**
 * Emergency Profile Hooks
 * React Query hooks for emergency profile management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyProfileApi } from '@/api';
import { queryKeys } from '@/api/queryClient';
import type { EmergencyProfile } from '@/types';

/**
 * Get current user's emergency profile
 */
export function useEmergencyProfile() {
  return useQuery({
    queryKey: queryKeys.emergencyProfile.current,
    queryFn: () => emergencyProfileApi.getEmergencyProfile(),
  });
}

/**
 * Get emergency profile by ID (for scanning)
 */
export function useEmergencyProfileById(id: string) {
  return useQuery({
    queryKey: queryKeys.emergencyProfile.detail(id),
    queryFn: () => emergencyProfileApi.getEmergencyProfileById(id),
    enabled: !!id,
  });
}

/**
 * Create emergency profile
 */
export function useCreateEmergencyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<EmergencyProfile>) =>
      emergencyProfileApi.createEmergencyProfile(data),
    onSuccess: () => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyProfile.current });
    },
  });
}

/**
 * Update emergency profile
 */
export function useUpdateEmergencyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmergencyProfile> }) =>
      emergencyProfileApi.updateEmergencyProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyProfile.current });
    },
  });
}

/**
 * Delete emergency profile
 */
export function useDeleteEmergencyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emergencyProfileApi.deleteEmergencyProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyProfile.current });
    },
  });
}

/**
 * Medical Conditions Hooks
 */
export function useMedicalConditions() {
  return useQuery({
    queryKey: queryKeys.medical.conditions,
    queryFn: () => emergencyProfileApi.getMedicalConditions(),
  });
}

export function useAddMedicalCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; diagnosedDate?: string; notes?: string }) =>
      emergencyProfileApi.addMedicalCondition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medical.conditions });
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyProfile.current });
    },
  });
}

export function useUpdateMedicalCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; diagnosedDate?: string; notes?: string };
    }) => emergencyProfileApi.updateMedicalCondition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medical.conditions });
    },
  });
}

export function useDeleteMedicalCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emergencyProfileApi.deleteMedicalCondition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medical.conditions });
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyProfile.current });
    },
  });
}

/**
 * Medications Hooks
 */
export function useMedications() {
  return useQuery({
    queryKey: queryKeys.medical.medications,
    queryFn: () => emergencyProfileApi.getMedications(),
  });
}

export function useAddMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      dosage: string;
      frequency: string;
      prescribedBy?: string;
      startDate?: string;
    }) => emergencyProfileApi.addMedication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medical.medications });
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyProfile.current });
    },
  });
}

/**
 * Allergies Hooks
 */
export function useAllergies() {
  return useQuery({
    queryKey: queryKeys.medical.allergies,
    queryFn: () => emergencyProfileApi.getAllergies(),
  });
}

export function useAddAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      allergen: string;
      severity: 'mild' | 'moderate' | 'severe';
      reaction?: string;
    }) => emergencyProfileApi.addAllergy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medical.allergies });
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyProfile.current });
    },
  });
}

/**
 * Emergency Contacts Hooks
 */
export function useEmergencyContacts() {
  return useQuery({
    queryKey: queryKeys.contacts.all,
    queryFn: () => emergencyProfileApi.getEmergencyContacts(),
  });
}

export function useAddEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      relationship: string;
      phoneNumber: string;
      email?: string;
    }) => emergencyProfileApi.addEmergencyContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyProfile.current });
    },
  });
}

export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        relationship?: string;
        phoneNumber?: string;
        email?: string;
      };
    }) => emergencyProfileApi.updateEmergencyContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emergencyProfileApi.deleteEmergencyContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyProfile.current });
    },
  });
}
