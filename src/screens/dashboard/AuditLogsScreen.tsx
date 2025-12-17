/**
 * Audit Logs Screen
 * Displays activity/audit logs with filtering and pagination
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { LoadingSpinner, Toast, useToast } from '@/components/ui';
import { ActivityCard } from '@/components/ActivityCard';
import { ActivityFilterModal } from '@/components/ActivityFilterModal';
import { activitiesApi } from '@/api/activities';
import type { ActivityFilters, Activity } from '@/types/dashboard';
import { PRIMARY, SEMANTIC, STATUS } from '@/constants/colors';
import { spacing } from '@/theme/theme';

const PAGE_SIZE = 20;

export default function AuditLogsScreen() {
  const { toastConfig, hideToast, success, error: showError } = useToast();
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Infinite query for pagination
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['activities', filters],
    queryFn: ({ pageParam = 1 }) => activitiesApi.getActivities(filters, pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    // Mock data for development
    placeholderData: {
      pages: [getMockActivitiesResponse()],
      pageParams: [1],
    },
  });

  // Flatten all pages into single array
  const activities = data?.pages.flatMap((page) => page.activities) || [];
  const totalCount = data?.pages[0]?.total || 0;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleApplyFilters = (newFilters: ActivityFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setShowFilterModal(false);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      setIsExporting(true);

      // In a real app, this would call the API and download the file
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1500));

      success(`Activities exported as ${format.toUpperCase()}`);
    } catch (err) {
      showError(`Failed to export activities`);
    } finally {
      setIsExporting(false);
    }
  };

  const showExportOptions = () => {
    Alert.alert(
      'Export Activities',
      'Choose export format',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Export as PDF',
          onPress: () => handleExport('pdf'),
        },
        {
          text: 'Export as CSV',
          onPress: () => handleExport('csv'),
        },
      ],
      { cancelable: true }
    );
  };

  const activeFilterCount =
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.types?.length || 0);

  if (isLoading && activities.length === 0) {
    return <LoadingSpinner visible text="Loading activities..." />;
  }

  if (error && activities.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={STATUS.error} />
        <Text style={styles.errorText}>Failed to load activities</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Activity Logs</Text>
          {totalCount > 0 && (
            <Text style={styles.subtitle}>{totalCount} activities</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {/* Filter Button */}
          <Pressable
            style={styles.headerButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={20} color={PRIMARY[600]} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Export Button */}
          <Pressable
            style={styles.headerButton}
            onPress={showExportOptions}
            disabled={isExporting}
          >
            {isExporting ? (
              <LoadingSpinner visible size="small" color={PRIMARY[600]} />
            ) : (
              <Ionicons name="download-outline" size={20} color={PRIMARY[600]} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Active Filters Chips */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFilters}>
          <View style={styles.activeFiltersContent}>
            {filters.dateFrom && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  From: {new Date(filters.dateFrom).toLocaleDateString()}
                </Text>
                <Pressable
                  onPress={() => setFilters({ ...filters, dateFrom: undefined })}
                >
                  <Ionicons name="close-circle" size={16} color={SEMANTIC.text.secondary} />
                </Pressable>
              </View>
            )}
            {filters.dateTo && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  To: {new Date(filters.dateTo).toLocaleDateString()}
                </Text>
                <Pressable
                  onPress={() => setFilters({ ...filters, dateTo: undefined })}
                >
                  <Ionicons name="close-circle" size={16} color={SEMANTIC.text.secondary} />
                </Pressable>
              </View>
            )}
            {filters.types?.map((type) => (
              <View key={type} style={styles.filterChip}>
                <Text style={styles.filterChipText}>{type}</Text>
                <Pressable
                  onPress={() =>
                    setFilters({
                      ...filters,
                      types: filters.types?.filter((t) => t !== type),
                    })
                  }
                >
                  <Ionicons name="close-circle" size={16} color={SEMANTIC.text.secondary} />
                </Pressable>
              </View>
            ))}
          </View>
          <Pressable onPress={handleResetFilters}>
            <Text style={styles.clearFiltersText}>Clear all</Text>
          </Pressable>
        </View>
      )}

      {/* Activities List */}
      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={80} color={SEMANTIC.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No Activities Found</Text>
          <Text style={styles.emptyStateText}>
            {activeFilterCount > 0
              ? 'Try adjusting your filters to see more results.'
              : 'Your activity history will appear here.'}
          </Text>
          {activeFilterCount > 0 && (
            <Pressable style={styles.resetButton} onPress={handleResetFilters}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityCard activity={item} />}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={PRIMARY[600]}
            />
          }
          ListFooterComponent={() => {
            if (isFetchingNextPage) {
              return (
                <View style={styles.loadingMore}>
                  <LoadingSpinner visible size="small" />
                  <Text style={styles.loadingMoreText}>Loading more...</Text>
                </View>
              );
            }
            if (!hasNextPage && activities.length > 0) {
              return (
                <View style={styles.endOfList}>
                  <Text style={styles.endOfListText}>You've reached the end</Text>
                </View>
              );
            }
            return null;
          }}
        />
      )}

      {/* Filter Modal */}
      <ActivityFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />

      {/* Toast */}
      <Toast {...toastConfig} onDismiss={hideToast} />
    </View>
  );
}

// Mock data for development
function getMockActivitiesResponse() {
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'access',
      action: 'Emergency Profile Accessed',
      description: 'Your emergency profile was viewed by a first responder',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      location: {
        city: 'San Francisco',
        country: 'USA',
      },
      device: {
        type: 'Mobile',
        os: 'iOS 17.0',
        browser: 'Safari',
      },
      ipAddress: '192.168.1.1',
    },
    {
      id: '2',
      type: 'update',
      action: 'Profile Updated',
      description: 'Emergency contact information was updated',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      location: {
        city: 'San Francisco',
        country: 'USA',
      },
      device: {
        type: 'Mobile',
        os: 'iOS 17.0',
        browser: 'Safari',
      },
      ipAddress: '192.168.1.1',
      userName: 'You',
    },
    {
      id: '3',
      type: 'scan',
      action: 'NFC Bracelet Scanned',
      description: 'Your NFC bracelet was scanned',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      location: {
        city: 'Oakland',
        country: 'USA',
      },
      device: {
        type: 'Mobile',
        os: 'Android 14',
      },
      ipAddress: '192.168.1.50',
    },
    {
      id: '4',
      type: 'login',
      action: 'Successful Login',
      description: 'You logged in from a new device',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      location: {
        city: 'San Francisco',
        country: 'USA',
      },
      device: {
        type: 'Desktop',
        os: 'macOS 14.0',
        browser: 'Chrome',
      },
      ipAddress: '192.168.1.100',
      userName: 'You',
    },
    {
      id: '5',
      type: 'security',
      action: 'Password Changed',
      description: 'Your password was successfully changed',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      location: {
        city: 'San Francisco',
        country: 'USA',
      },
      device: {
        type: 'Mobile',
        os: 'iOS 17.0',
      },
      ipAddress: '192.168.1.1',
      userName: 'You',
    },
    {
      id: '6',
      type: 'system',
      action: 'Subscription Renewed',
      description: 'Your premium subscription was automatically renewed',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      metadata: {
        plan: 'Premium',
        amount: '$9.99',
      },
    },
    {
      id: '7',
      type: 'update',
      action: 'Medical Information Updated',
      description: 'Medication list was updated',
      timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      location: {
        city: 'San Francisco',
        country: 'USA',
      },
      device: {
        type: 'Mobile',
        os: 'iOS 17.0',
      },
      ipAddress: '192.168.1.1',
      userName: 'You',
    },
  ];

  return {
    activities: mockActivities,
    total: 25,
    page: 1,
    limit: PAGE_SIZE,
    hasMore: true,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: SEMANTIC.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: STATUS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  activeFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: PRIMARY[50],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.default,
  },
  activeFiltersContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    flex: 1,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: SEMANTIC.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRIMARY[200],
  },
  filterChipText: {
    fontSize: 12,
    color: SEMANTIC.text.primary,
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 12,
    color: PRIMARY[600],
    fontWeight: '600',
  },
  listContent: {
    padding: spacing[4],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  errorText: {
    fontSize: 16,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[4],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyStateText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  resetButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: PRIMARY[600],
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    gap: spacing[2],
  },
  loadingMoreText: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
  },
  endOfList: {
    padding: spacing[6],
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 14,
    color: SEMANTIC.text.tertiary,
    fontStyle: 'italic',
  },
});
