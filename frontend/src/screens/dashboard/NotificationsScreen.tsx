/**
 * Notifications Screen
 * Display all notifications with filtering and actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { DashboardScreenNavigationProp } from '@/navigation/types';

import { Header, EmptyState } from '@/components/shared';
import { Toast, useToast, LoadingSpinner } from '@/components/ui';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  type Notification,
} from '@/api/notifications';
import {
  getNotificationIcon,
  getNotificationColor,
  clearBadgeCount,
  type NotificationType,
} from '@/services/notificationService';
import { formatSmartDate } from '@/utils/formatting';
import { PRIMARY, SEMANTIC } from '@/constants/colors';
import { spacing } from '@/theme/theme';

const FILTER_OPTIONS: { label: string; value: NotificationType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Profile Access', value: 'profile_access' },
  { label: 'Health', value: 'health_reminder' },
  { label: 'Security', value: 'security' },
  { label: 'Subscription', value: 'subscription' },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { toastConfig, hideToast, success, error: showError } = useToast();

  const [selectedFilter, setSelectedFilter] = useState<NotificationType | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', selectedFilter],
    queryFn: () =>
      getNotifications(1, 50, selectedFilter === 'all' ? undefined : selectedFilter),
  });

  // Clear badge count when screen is focused
  useEffect(() => {
    clearBadgeCount();
  }, []);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      showError(error?.message || 'Failed to mark as read');
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('Notification deleted');
    },
    onError: (error: any) => {
      showError(error?.message || 'Failed to delete notification');
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('All notifications marked as read');
    },
    onError: (error: any) => {
      showError(error?.message || 'Failed to mark all as read');
    },
  });

  // Delete all mutation
  const deleteAllMutation = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('All notifications deleted');
    },
    onError: (error: any) => {
      showError(error?.message || 'Failed to delete all notifications');
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      // TODO: Implement deep linking navigation
      console.log('Navigate to:', notification.actionUrl);
    }
  };

  const handleDelete = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotificationMutation.mutate(notificationId),
        },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    if (data && data.unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => deleteAllMutation.mutate(),
        },
      ]
    );
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconColor = getNotificationColor(item.type);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.notificationItem,
          !item.read && styles.notificationItemUnread,
          pressed && styles.notificationItemPressed,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons
            name={getNotificationIcon(item.type) as any}
            size={24}
            color={iconColor}
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[
                styles.notificationTitle,
                !item.read && styles.notificationTitleUnread,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatSmartDate(item.createdAt)}
            </Text>
          </View>

          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>

          {!item.read && <View style={styles.unreadDot} />}
        </View>

        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="close-circle" size={20} color={SEMANTIC.text.tertiary} />
        </Pressable>
      </Pressable>
    );
  };

  const renderFilterChip = (filter: typeof FILTER_OPTIONS[0]) => {
    const isSelected = selectedFilter === filter.value;

    return (
      <Pressable
        key={filter.value}
        style={[styles.filterChip, isSelected && styles.filterChipSelected]}
        onPress={() => setSelectedFilter(filter.value)}
      >
        <Text
          style={[
            styles.filterChipText,
            isSelected && styles.filterChipTextSelected,
          ]}
        >
          {filter.label}
        </Text>
      </Pressable>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Filter Chips */}
      <View style={styles.filters}>
        {FILTER_OPTIONS.map(renderFilterChip)}
      </View>

      {/* Action Buttons */}
      {data && data.notifications.length > 0 && (
        <View style={styles.actions}>
          {data.unreadCount > 0 && (
            <Pressable
              style={styles.actionButton}
              onPress={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <Ionicons
                name="checkmark-done"
                size={20}
                color={PRIMARY[600]}
              />
              <Text style={styles.actionButtonText}>Mark all read</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.actionButton}
            onPress={handleClearAll}
            disabled={deleteAllMutation.isPending}
          >
            <Ionicons name="trash-outline" size={20} color={SEMANTIC.error} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
              Clear all
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Notifications" showBackButton />
        <LoadingSpinner visible />
      </View>
    );
  }

  const notifications = data?.notifications || [];

  return (
    <View style={styles.container}>
      <Header title="Notifications" showBackButton />

      {notifications.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="No Notifications"
          description={
            selectedFilter === 'all'
              ? "You're all caught up! No new notifications."
              : `No ${FILTER_OPTIONS.find((f) => f.value === selectedFilter)?.label.toLowerCase()} notifications.`
          }
          actionLabel={selectedFilter !== 'all' ? 'View All' : undefined}
          onActionPress={
            selectedFilter !== 'all' ? () => setSelectedFilter('all') : undefined
          }
        />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={PRIMARY[600]}
            />
          }
        />
      )}

      <Toast {...toastConfig} onDismiss={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  listContent: {
    paddingBottom: spacing[6],
  },
  header: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.background.elevated,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 16,
    backgroundColor: SEMANTIC.background.default,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  filterChipSelected: {
    backgroundColor: PRIMARY[600],
    borderColor: PRIMARY[600],
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: SEMANTIC.text.secondary,
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY[600],
  },
  actionButtonTextDanger: {
    color: SEMANTIC.error,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.background.elevated,
  },
  notificationItemUnread: {
    backgroundColor: PRIMARY[50],
  },
  notificationItemPressed: {
    backgroundColor: SEMANTIC.background.secondary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[1],
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginRight: spacing[2],
  },
  notificationTitleUnread: {
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
  },
  notificationMessage: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY[600],
  },
  deleteButton: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },
});
