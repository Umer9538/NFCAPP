/**
 * Offline Store (Zustand)
 * Manage offline state and queued requests
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineService, QueuedRequest, SyncResult } from '@/services/offlineService';

interface OfflineState {
  // State
  isOnline: boolean;
  queuedRequests: QueuedRequest[];
  lastSync: string | null;
  isSyncing: boolean;
  pendingSync: number;

  // Actions
  setOnline: (isOnline: boolean) => void;
  addToQueue: (request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>) => Promise<string>;
  removeFromQueue: (requestId: string) => Promise<void>;
  syncQueue: (executor?: (request: QueuedRequest) => Promise<any>) => Promise<SyncResult>;
  clearQueue: () => Promise<void>;
  loadQueue: () => Promise<void>;
  updatePendingSync: () => Promise<void>;
  init: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      // Initial State
      isOnline: true,
      queuedRequests: [],
      lastSync: null,
      isSyncing: false,
      pendingSync: 0,

      // Initialize
      init: async () => {
        try {
          // Initialize offline service
          await offlineService.init();

          // Subscribe to connectivity changes
          offlineService.subscribe((isOnline) => {
            set({ isOnline });
          });

          // Load queue from storage
          await get().loadQueue();

          // Update pending sync count
          await get().updatePendingSync();

          console.log('[OfflineStore] Initialized');
        } catch (error) {
          console.error('[OfflineStore] Init error:', error);
        }
      },

      // Set online status
      setOnline: (isOnline) => {
        set({ isOnline });

        // Auto-sync when coming back online
        if (isOnline && get().pendingSync > 0) {
          get().syncQueue();
        }
      },

      // Add request to queue
      addToQueue: async (request) => {
        try {
          const requestId = await offlineService.addToQueue(request);
          await get().loadQueue();
          await get().updatePendingSync();
          return requestId;
        } catch (error) {
          console.error('[OfflineStore] Add to queue error:', error);
          throw error;
        }
      },

      // Remove request from queue
      removeFromQueue: async (requestId) => {
        try {
          await offlineService.removeFromQueue(requestId);
          await get().loadQueue();
          await get().updatePendingSync();
        } catch (error) {
          console.error('[OfflineStore] Remove from queue error:', error);
          throw error;
        }
      },

      // Sync queue
      syncQueue: async (executor) => {
        const { isSyncing, isOnline } = get();

        if (isSyncing) {
          console.log('[OfflineStore] Sync already in progress');
          return { success: 0, failed: 0, skipped: 0, errors: [] };
        }

        if (!isOnline) {
          console.log('[OfflineStore] Cannot sync while offline');
          return { success: 0, failed: 0, skipped: 0, errors: [] };
        }

        try {
          set({ isSyncing: true });

          const result = await offlineService.syncQueue(executor);

          // Update state
          await get().loadQueue();
          await get().updatePendingSync();
          set({ lastSync: new Date().toISOString(), isSyncing: false });

          console.log('[OfflineStore] Sync complete:', result);
          return result;
        } catch (error) {
          console.error('[OfflineStore] Sync error:', error);
          set({ isSyncing: false });
          throw error;
        }
      },

      // Clear queue
      clearQueue: async () => {
        try {
          await offlineService.clearQueue();
          set({ queuedRequests: [], pendingSync: 0 });
        } catch (error) {
          console.error('[OfflineStore] Clear queue error:', error);
          throw error;
        }
      },

      // Load queue from storage
      loadQueue: async () => {
        try {
          const queue = await offlineService.getQueue();
          set({ queuedRequests: queue });
        } catch (error) {
          console.error('[OfflineStore] Load queue error:', error);
        }
      },

      // Update pending sync count
      updatePendingSync: async () => {
        try {
          const size = await offlineService.getQueueSize();
          set({ pendingSync: size });
        } catch (error) {
          console.error('[OfflineStore] Update pending sync error:', error);
        }
      },
    }),
    {
      name: 'offline-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist lastSync
      partialize: (state) => ({
        lastSync: state.lastSync,
      }),
    }
  )
);

// Initialize on import
useOfflineStore.getState().init();
