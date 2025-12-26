/**
 * useOffline Hook
 * Monitor network connectivity and handle offline state
 */

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';

export interface OfflineState {
  isOffline: boolean;
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
}

/**
 * Hook to monitor network connectivity
 */
export function useOffline(): OfflineState {
  const [state, setState] = useState<OfflineState>({
    isOffline: false,
    isConnected: true,
    type: null,
    isInternetReachable: null,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then((netInfoState) => {
      updateState(netInfoState);
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((netInfoState) => {
      updateState(netInfoState);

      // Refetch queries when coming back online
      if (netInfoState.isConnected && netInfoState.isInternetReachable) {
        queryClient.invalidateQueries();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateState = (netInfoState: NetInfoState) => {
    setState({
      isOffline: !netInfoState.isConnected || netInfoState.isInternetReachable === false,
      isConnected: netInfoState.isConnected ?? false,
      type: netInfoState.type,
      isInternetReachable: netInfoState.isInternetReachable,
    });
  };

  return state;
}

/**
 * Hook to get current network status
 */
export async function checkNetworkStatus(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

/**
 * Hook to wait for network connection
 */
export function useWaitForNetwork(): {
  waitForNetwork: () => Promise<void>;
  isWaiting: boolean;
} {
  const [isWaiting, setIsWaiting] = useState(false);

  const waitForNetwork = async () => {
    setIsWaiting(true);

    return new Promise<void>((resolve) => {
      const unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected && state.isInternetReachable) {
          unsubscribe();
          setIsWaiting(false);
          resolve();
        }
      });

      // Check current state immediately
      NetInfo.fetch().then((state) => {
        if (state.isConnected && state.isInternetReachable) {
          unsubscribe();
          setIsWaiting(false);
          resolve();
        }
      });
    });
  };

  return {
    waitForNetwork,
    isWaiting,
  };
}
