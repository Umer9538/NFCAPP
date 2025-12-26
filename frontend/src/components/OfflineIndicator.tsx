/**
 * Offline Indicator
 * Banner displayed at top when device is offline
 */

import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOfflineStore } from '@/store/offlineStore';
import { PRIMARY, GRAY, STATUS, SEMANTIC } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');

export const OfflineIndicator: React.FC = () => {
  const { isOnline, lastSync, pendingSync, isSyncing } = useOfflineStore();
  const [slideAnim] = React.useState(new Animated.Value(-100));

  React.useEffect(() => {
    if (!isOnline) {
      // Slide down when offline
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Slide up when online
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline]);

  if (isOnline && !isSyncing) {
    return null;
  }

  const getStatusMessage = () => {
    if (isSyncing) {
      return `Syncing ${pendingSync} pending ${pendingSync === 1 ? 'item' : 'items'}...`;
    }

    if (!isOnline) {
      if (pendingSync > 0) {
        return `Offline - ${pendingSync} ${pendingSync === 1 ? 'change' : 'changes'} pending`;
      }
      return 'You are offline';
    }

    return 'Connected';
  };

  const getLastSyncMessage = () => {
    if (!lastSync) return null;

    try {
      const syncDate = new Date(lastSync);
      return `Last synced ${formatDistanceToNow(syncDate, { addSuffix: true })}`;
    } catch {
      return null;
    }
  };

  const backgroundColor = isSyncing
    ? PRIMARY[500]
    : isOnline
    ? STATUS.success.main
    : GRAY[800];

  const icon = isSyncing
    ? 'sync'
    : isOnline
    ? 'cloud-done'
    : 'cloud-offline';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Ionicons
            name={icon}
            size={18}
            color="#fff"
            style={isSyncing && styles.syncIcon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.statusText}>{getStatusMessage()}</Text>
            {!isOnline && getLastSyncMessage() && (
              <Text style={styles.lastSyncText}>{getLastSyncMessage()}</Text>
            )}
          </View>
        </View>

        {isSyncing && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingSync}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width,
    paddingTop: 50, // Account for status bar
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[4],
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: spacing[3],
    flex: 1,
  },
  statusText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    color: '#fff',
    fontWeight: '600',
  },
  lastSyncText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  syncIcon: {
    // Animation would be applied via Animated.View in a production app
    opacity: 0.9,
  },
});
