/**
 * Offline Service
 * Detect connectivity and manage offline queue
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QueuedRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SyncResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ requestId: string; error: string }>;
}

const QUEUE_STORAGE_KEY = '@medguard_offline_queue';
const MAX_QUEUE_SIZE = 100;
const MAX_RETRIES = 3;

class OfflineService {
  private isOnline: boolean = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize offline service
   */
  async init(): Promise<void> {
    // Get initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? true;

    // Subscribe to network changes
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? true;

      console.log(`[Offline] Network status changed: ${this.isOnline ? 'Online' : 'Offline'}`);

      // Notify listeners
      this.notifyListeners();

      // Auto-sync when coming back online
      if (!wasOnline && this.isOnline) {
        console.log('[Offline] Back online, triggering auto-sync');
        this.syncQueue().catch((error) => {
          console.error('[Offline] Auto-sync failed:', error);
        });
      }
    });

    console.log(`[Offline] Initialized - ${this.isOnline ? 'Online' : 'Offline'}`);
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }

  /**
   * Get current online status
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Subscribe to online status changes
   */
  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isOnline);
      } catch (error) {
        console.error('[Offline] Error in listener:', error);
      }
    });
  }

  /**
   * Add request to offline queue
   */
  async addToQueue(
    request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>
  ): Promise<string> {
    try {
      const queue = await this.getQueue();

      // Check queue size limit
      if (queue.length >= MAX_QUEUE_SIZE) {
        // Remove oldest low-priority items
        const filtered = queue
          .sort((a, b) => {
            if (a.priority === b.priority) {
              return a.timestamp - b.timestamp;
            }
            return a.priority === 'low' ? -1 : 1;
          })
          .slice(0, MAX_QUEUE_SIZE - 1);

        await this.saveQueue(filtered);
      }

      const queuedRequest: QueuedRequest = {
        ...request,
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retries: 0,
        maxRetries: request.maxRetries || MAX_RETRIES,
      };

      const updatedQueue = [...queue, queuedRequest];
      await this.saveQueue(updatedQueue);

      console.log(`[Offline] Added request to queue: ${queuedRequest.id}`);
      return queuedRequest.id;
    } catch (error) {
      console.error('[Offline] Error adding to queue:', error);
      throw error;
    }
  }

  /**
   * Get queued requests
   */
  async getQueue(): Promise<QueuedRequest[]> {
    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (!queueJson) {
        return [];
      }

      const queue: QueuedRequest[] = JSON.parse(queueJson);
      return queue;
    } catch (error) {
      console.error('[Offline] Error getting queue:', error);
      return [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(queue: QueuedRequest[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('[Offline] Error saving queue:', error);
      throw error;
    }
  }

  /**
   * Remove request from queue
   */
  async removeFromQueue(requestId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const filtered = queue.filter((req) => req.id !== requestId);
      await this.saveQueue(filtered);

      console.log(`[Offline] Removed request from queue: ${requestId}`);
    } catch (error) {
      console.error('[Offline] Error removing from queue:', error);
      throw error;
    }
  }

  /**
   * Clear entire queue
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
      console.log('[Offline] Cleared queue');
    } catch (error) {
      console.error('[Offline] Error clearing queue:', error);
      throw error;
    }
  }

  /**
   * Get queue size
   */
  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  /**
   * Sync queued requests
   */
  async syncQueue(
    executor?: (request: QueuedRequest) => Promise<any>
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    try {
      // Check if online
      if (!this.isOnline) {
        console.log('[Offline] Cannot sync - offline');
        return result;
      }

      const queue = await this.getQueue();

      if (queue.length === 0) {
        console.log('[Offline] Queue is empty');
        return result;
      }

      console.log(`[Offline] Syncing ${queue.length} requests`);

      // Sort by priority and timestamp
      const sortedQueue = queue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.timestamp - b.timestamp;
      });

      // Process each request
      for (const request of sortedQueue) {
        try {
          // Check if max retries exceeded
          if (request.retries >= request.maxRetries) {
            console.log(`[Offline] Skipping request ${request.id} - max retries exceeded`);
            result.skipped++;
            await this.removeFromQueue(request.id);
            continue;
          }

          // Execute request
          if (executor) {
            await executor(request);
          } else {
            await this.executeRequest(request);
          }

          // Success - remove from queue
          await this.removeFromQueue(request.id);
          result.success++;

          console.log(`[Offline] Successfully synced request: ${request.id}`);
        } catch (error: any) {
          console.error(`[Offline] Error syncing request ${request.id}:`, error);

          // Increment retry count
          request.retries++;
          const queue = await this.getQueue();
          const updatedQueue = queue.map((req) =>
            req.id === request.id ? request : req
          );
          await this.saveQueue(updatedQueue);

          result.failed++;
          result.errors.push({
            requestId: request.id,
            error: error.message || 'Unknown error',
          });
        }
      }

      console.log(`[Offline] Sync complete - Success: ${result.success}, Failed: ${result.failed}, Skipped: ${result.skipped}`);
      return result;
    } catch (error) {
      console.error('[Offline] Error during sync:', error);
      throw error;
    }
  }

  /**
   * Execute a queued request (default implementation)
   */
  private async executeRequest(request: QueuedRequest): Promise<any> {
    // This is a default implementation that can be overridden
    // In practice, you would inject your API client here
    console.log(`[Offline] Executing request: ${request.method} ${request.url}`);

    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...request.headers,
      },
      body: request.data ? JSON.stringify(request.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Check for conflicts
   */
  async detectConflicts(
    localData: any,
    serverData: any,
    idField: string = 'id'
  ): Promise<Array<{ local: any; server: any; field: string }>> {
    const conflicts: Array<{ local: any; server: any; field: string }> = [];

    // Check if both have same ID but different updatedAt
    if (localData[idField] === serverData[idField]) {
      const localUpdated = new Date(localData.updatedAt).getTime();
      const serverUpdated = new Date(serverData.updatedAt).getTime();

      if (localUpdated !== serverUpdated) {
        // Compare each field
        Object.keys(localData).forEach((key) => {
          if (
            key !== 'updatedAt' &&
            key !== 'createdAt' &&
            JSON.stringify(localData[key]) !== JSON.stringify(serverData[key])
          ) {
            conflicts.push({
              local: localData[key],
              server: serverData[key],
              field: key,
            });
          }
        });
      }
    }

    return conflicts;
  }

  /**
   * Merge conflicting data (server wins by default)
   */
  mergeData(localData: any, serverData: any, strategy: 'server' | 'local' | 'merge' = 'server'): any {
    switch (strategy) {
      case 'local':
        return localData;

      case 'server':
        return serverData;

      case 'merge':
        // Custom merge logic - newer timestamp wins for each field
        const merged = { ...serverData };
        const localUpdated = new Date(localData.updatedAt).getTime();
        const serverUpdated = new Date(serverData.updatedAt).getTime();

        if (localUpdated > serverUpdated) {
          // Local is newer, merge local changes
          Object.keys(localData).forEach((key) => {
            if (key !== 'id' && key !== 'createdAt') {
              merged[key] = localData[key];
            }
          });
        }

        return merged;

      default:
        return serverData;
    }
  }
}

// Export singleton instance
export const offlineService = new OfflineService();
