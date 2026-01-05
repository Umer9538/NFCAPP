/**
 * Emergency Notifications Screen
 * Education-specific screen for sending emergency alerts and notifications
 * Supports different notification types and target audiences
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bell,
  Search,
  Plus,
  AlertTriangle,
  AlertCircle,
  Info,
  Cloud,
  Send,
  Users,
  ChevronRight,
  Clock,
  CheckCircle2,
  X,
  Megaphone,
} from 'lucide-react-native';
import { format, formatDistanceToNow } from 'date-fns';

import {
  getEmergencyNotifications,
  sendEmergencyNotification,
  type EmergencyNotification,
  type NotificationType,
  type NotificationAudience,
} from '@/api/organizations';
import { SEMANTIC, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

const TYPE_CONFIG: Record<NotificationType, { label: string; color: string; bgColor: string; icon: any }> = {
  emergency: { label: 'Emergency', color: '#ef4444', bgColor: '#fef2f2', icon: AlertTriangle },
  alert: { label: 'Alert', color: '#f59e0b', bgColor: '#fffbeb', icon: AlertCircle },
  info: { label: 'Information', color: '#3b82f6', bgColor: '#eff6ff', icon: Info },
  weather: { label: 'Weather', color: '#8b5cf6', bgColor: '#f5f3ff', icon: Cloud },
};

const TYPE_TABS: { key: NotificationType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'alert', label: 'Alerts' },
  { key: 'info', label: 'Info' },
  { key: 'weather', label: 'Weather' },
];

const AUDIENCE_OPTIONS: { key: NotificationAudience; label: string; icon: typeof Users }[] = [
  { key: 'all', label: 'Everyone', icon: Users },
  { key: 'students', label: 'Students Only', icon: Users },
  { key: 'parents', label: 'Parents Only', icon: Users },
  { key: 'staff', label: 'Staff Only', icon: Users },
  { key: 'teachers', label: 'Teachers Only', icon: Users },
];

const PRIORITY_OPTIONS = [
  { key: 'critical', label: 'Critical', color: '#ef4444' },
  { key: 'high', label: 'High', color: '#f59e0b' },
  { key: 'medium', label: 'Medium', color: '#3b82f6' },
  { key: 'low', label: 'Low', color: '#10b981' },
];

export default function EmergencyNotificationsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Compose form state
  const [composeTitle, setComposeTitle] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [composeType, setComposeType] = useState<NotificationType>('info');
  const [composePriority, setComposePriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [composeAudience, setComposeAudience] = useState<NotificationAudience[]>(['all']);

  // Fetch notifications
  const {
    data: notifications,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['emergencyNotifications'],
    queryFn: getEmergencyNotifications,
  });

  // Filter notifications
  const filteredNotifications = (notifications || []).filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Send notification mutation
  const sendMutation = useMutation({
    mutationFn: sendEmergencyNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyNotifications'] });
      Alert.alert('Success', 'Notification sent successfully');
      resetComposeForm();
      setShowComposeModal(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to send notification');
    },
  });

  const resetComposeForm = () => {
    setComposeTitle('');
    setComposeMessage('');
    setComposeType('info');
    setComposePriority('medium');
    setComposeAudience(['all']);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleTypeFilter = useCallback((type: NotificationType | 'all') => {
    setSelectedType(type);
  }, []);

  const handleSendNotification = () => {
    if (!composeTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!composeMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    Alert.alert(
      'Confirm Send',
      `Send this ${TYPE_CONFIG[composeType].label.toLowerCase()} notification to ${
        composeAudience.includes('all') ? 'everyone' : composeAudience.join(', ')
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'default',
          onPress: () => {
            sendMutation.mutate({
              title: composeTitle,
              message: composeMessage,
              type: composeType,
              priority: composePriority,
              targetAudience: composeAudience,
            });
          },
        },
      ]
    );
  };

  const handleViewDetails = (notification: EmergencyNotification) => {
    Alert.alert(
      notification.title,
      `${notification.message}\n\n` +
        `Type: ${TYPE_CONFIG[notification.type].label}\n` +
        `Priority: ${notification.priority}\n` +
        `Sent to: ${notification.targetAudience.join(', ')}\n` +
        `Sent: ${format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const renderStatsCards = () => {
    const stats = {
      emergency: filteredNotifications.filter((n) => n.type === 'emergency').length,
      alert: filteredNotifications.filter((n) => n.type === 'alert').length,
      info: filteredNotifications.filter((n) => n.type === 'info').length,
      total: (notifications || []).length,
    };

    return (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
          <AlertTriangle size={20} color="#ef4444" />
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.emergency}</Text>
          <Text style={styles.statLabel}>Emergency</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
          <AlertCircle size={20} color="#f59e0b" />
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.alert}</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
          <Info size={20} color="#3b82f6" />
          <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{stats.info}</Text>
          <Text style={styles.statLabel}>Info</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f3f4f6' }]}>
          <Bell size={20} color="#6b7280" />
          <Text style={[styles.statNumber, { color: '#6b7280' }]}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>
    );
  };

  const renderSearchAndFilters = () => (
    <View style={styles.searchFilterContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={GRAY[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notifications..."
          placeholderTextColor={GRAY[400]}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Type Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
      >
        {TYPE_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              selectedType === tab.key && styles.tabActive,
            ]}
            onPress={() => handleTypeFilter(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                selectedType === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderNotificationItem = ({ item }: { item: EmergencyNotification }) => {
    const typeConfig = TYPE_CONFIG[item.type];
    const TypeIcon = typeConfig.icon;

    return (
      <Pressable
        style={styles.notificationCard}
        onPress={() => handleViewDetails(item)}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTitleRow}>
            <View style={[styles.typeIcon, { backgroundColor: typeConfig.bgColor }]}>
              <TypeIcon size={20} color={typeConfig.color} />
            </View>
            <View style={styles.notificationTitleContainer}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.badgesRow}>
                <View style={[styles.typeBadge, { backgroundColor: typeConfig.bgColor }]}>
                  <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>
                    {typeConfig.label}
                  </Text>
                </View>
                <View style={[styles.priorityBadge, {
                  backgroundColor: PRIORITY_OPTIONS.find(p => p.key === item.priority)?.color + '20'
                }]}>
                  <Text style={[styles.priorityBadgeText, {
                    color: PRIORITY_OPTIONS.find(p => p.key === item.priority)?.color
                  }]}>
                    {item.priority}
                  </Text>
                </View>
              </View>
            </View>
            <ChevronRight size={20} color={GRAY[400]} />
          </View>
        </View>

        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>

        <View style={styles.notificationMeta}>
          <View style={styles.metaItem}>
            <Users size={14} color={GRAY[400]} />
            <Text style={styles.metaText}>
              {item.targetAudience.includes('all') ? 'Everyone' : item.targetAudience.join(', ')}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={14} color={GRAY[400]} />
            <Text style={styles.metaText}>
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Bell size={48} color={GRAY[400]} />
      </View>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery || selectedType !== 'all'
          ? 'No notifications match your search criteria. Try adjusting your filters.'
          : 'No notifications have been sent yet. Send your first notification to communicate with your community.'}
      </Text>
      {!searchQuery && selectedType === 'all' && (
        <Pressable style={styles.emptyButton} onPress={() => setShowComposeModal(true)}>
          <Plus size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Send Notification</Text>
        </Pressable>
      )}
    </View>
  );

  const renderComposeModal = () => (
    <Modal
      visible={showComposeModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowComposeModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Pressable onPress={() => setShowComposeModal(false)} style={styles.modalCloseButton}>
            <X size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.modalTitle}>New Notification</Text>
          <Pressable
            onPress={handleSendNotification}
            style={[styles.sendButton, sendMutation.isPending && styles.sendButtonDisabled]}
            disabled={sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Send size={18} color="#fff" />
                <Text style={styles.sendButtonText}>Send</Text>
              </>
            )}
          </Pressable>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Type Selection */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Notification Type</Text>
            <View style={styles.typeGrid}>
              {(Object.keys(TYPE_CONFIG) as NotificationType[]).map((type) => {
                const config = TYPE_CONFIG[type];
                const TypeIcon = config.icon;
                return (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeOption,
                      composeType === type && { borderColor: config.color, backgroundColor: config.bgColor },
                    ]}
                    onPress={() => setComposeType(type)}
                  >
                    <TypeIcon size={24} color={composeType === type ? config.color : GRAY[400]} />
                    <Text
                      style={[
                        styles.typeOptionText,
                        composeType === type && { color: config.color },
                      ]}
                    >
                      {config.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Title */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter notification title..."
              placeholderTextColor={GRAY[400]}
              value={composeTitle}
              onChangeText={setComposeTitle}
              maxLength={100}
            />
          </View>

          {/* Message */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Enter notification message..."
              placeholderTextColor={GRAY[400]}
              value={composeMessage}
              onChangeText={setComposeMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{composeMessage.length}/500</Text>
          </View>

          {/* Priority */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Priority</Text>
            <View style={styles.priorityGrid}>
              {PRIORITY_OPTIONS.map((priority) => (
                <Pressable
                  key={priority.key}
                  style={[
                    styles.priorityOption,
                    composePriority === priority.key && {
                      borderColor: priority.color,
                      backgroundColor: priority.color + '10',
                    },
                  ]}
                  onPress={() => setComposePriority(priority.key as any)}
                >
                  <View
                    style={[styles.priorityDot, { backgroundColor: priority.color }]}
                  />
                  <Text
                    style={[
                      styles.priorityOptionText,
                      composePriority === priority.key && { color: priority.color },
                    ]}
                  >
                    {priority.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Target Audience */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Send To</Text>
            <View style={styles.audienceGrid}>
              {AUDIENCE_OPTIONS.map((audience) => {
                const isSelected = composeAudience.includes(audience.key);
                return (
                  <Pressable
                    key={audience.key}
                    style={[
                      styles.audienceOption,
                      isSelected && styles.audienceOptionSelected,
                    ]}
                    onPress={() => {
                      if (audience.key === 'all') {
                        setComposeAudience(['all']);
                      } else {
                        const newAudience = composeAudience.filter((a) => a !== 'all');
                        if (isSelected) {
                          setComposeAudience(newAudience.filter((a) => a !== audience.key));
                        } else {
                          setComposeAudience([...newAudience, audience.key]);
                        }
                      }
                    }}
                  >
                    {isSelected ? (
                      <CheckCircle2 size={18} color={PRIMARY[500]} />
                    ) : (
                      <View style={styles.audienceCheckbox} />
                    )}
                    <Text
                      style={[
                        styles.audienceOptionText,
                        isSelected && styles.audienceOptionTextSelected,
                      ]}
                    >
                      {audience.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Search and Filters */}
      {renderSearchAndFilters()}

      {/* Notifications List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY[500]} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[PRIMARY[500]]}
            />
          }
        />
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setShowComposeModal(true)}>
        <Megaphone size={24} color="#fff" />
      </Pressable>

      {/* Compose Modal */}
      {renderComposeModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    gap: spacing[2],
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 12,
    gap: spacing[1],
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: GRAY[600],
    fontWeight: '500',
  },
  searchFilterContainer: {
    backgroundColor: '#fff',
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    paddingHorizontal: spacing[3],
    backgroundColor: GRAY[100],
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing[3],
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  tabsScrollView: {
    marginTop: spacing[3],
  },
  tabsContainer: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
    backgroundColor: GRAY[100],
  },
  tabActive: {
    backgroundColor: PRIMARY[500],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: GRAY[600],
  },
  tabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: spacing[4],
    paddingBottom: spacing[20],
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationHeader: {
    marginBottom: spacing[2],
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTitleContainer: {
    flex: 1,
    gap: spacing[1],
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  typeBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notificationMessage: {
    fontSize: 14,
    color: GRAY[600],
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: GRAY[100],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metaText: {
    fontSize: 12,
    color: GRAY[500],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingTop: spacing[8],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GRAY[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  emptyDescription: {
    fontSize: 14,
    color: GRAY[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[6],
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: PRIMARY[500],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing[3],
    fontSize: 14,
    color: GRAY[500],
  },
  fab: {
    position: 'absolute',
    right: spacing[4],
    bottom: spacing[6],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: SEMANTIC.background.default,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
    backgroundColor: '#fff',
  },
  modalCloseButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: PRIMARY[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing[4],
  },
  formSection: {
    marginBottom: spacing[6],
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[3],
  },
  typeGrid: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: GRAY[200],
    backgroundColor: '#fff',
    gap: spacing[2],
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: GRAY[600],
  },
  titleInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: GRAY[200],
    borderRadius: 10,
    padding: spacing[3],
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  messageInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: GRAY[200],
    borderRadius: 10,
    padding: spacing[3],
    fontSize: 16,
    color: SEMANTIC.text.primary,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: GRAY[400],
    textAlign: 'right',
    marginTop: spacing[1],
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GRAY[200],
    backgroundColor: '#fff',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: GRAY[600],
  },
  audienceGrid: {
    gap: spacing[2],
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GRAY[200],
    backgroundColor: '#fff',
  },
  audienceOptionSelected: {
    borderColor: PRIMARY[500],
    backgroundColor: PRIMARY[50],
  },
  audienceCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: GRAY[300],
  },
  audienceOptionText: {
    fontSize: 15,
    color: GRAY[600],
  },
  audienceOptionTextSelected: {
    color: PRIMARY[600],
    fontWeight: '500',
  },
});
