/**
 * Incident Report Details Screen
 * View full details of an incident report with actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  FileText,
  Edit2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { format } from 'date-fns';

import {
  getIncidentReport,
  updateIncidentStatus,
  deleteIncidentReport,
  type IncidentReport,
  type IncidentStatus,
  type IncidentSeverity,
} from '@/api/organizations';
import { SEMANTIC, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

type RouteParams = {
  IncidentReportDetails: {
    reportId: string;
  };
};

const STATUS_CONFIG: Record<IncidentStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  open: { label: 'Open', color: '#ef4444', bgColor: '#fef2f2', icon: AlertCircle },
  investigating: { label: 'Investigating', color: '#f59e0b', bgColor: '#fffbeb', icon: Clock },
  resolved: { label: 'Resolved', color: '#10b981', bgColor: '#ecfdf5', icon: CheckCircle2 },
  closed: { label: 'Closed', color: '#6b7280', bgColor: '#f3f4f6', icon: XCircle },
};

const SEVERITY_CONFIG: Record<IncidentSeverity, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: '#10b981', bgColor: '#ecfdf5' },
  medium: { label: 'Medium', color: '#f59e0b', bgColor: '#fffbeb' },
  high: { label: 'High', color: '#ef4444', bgColor: '#fef2f2' },
  critical: { label: 'Critical', color: '#7c3aed', bgColor: '#f5f3ff' },
};

const STATUS_OPTIONS: IncidentStatus[] = ['open', 'investigating', 'resolved', 'closed'];

export default function IncidentReportDetailsScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'IncidentReportDetails'>>();
  const queryClient = useQueryClient();
  const { reportId } = route.params;

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus | null>(null);
  const [statusNotes, setStatusNotes] = useState('');

  // Fetch report details
  const {
    data: report,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['incidentReport', reportId],
    queryFn: () => getIncidentReport(reportId),
  });

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: IncidentStatus; notes?: string }) =>
      updateIncidentStatus(reportId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidentReport', reportId] });
      queryClient.invalidateQueries({ queryKey: ['incidentReports'] });
      queryClient.invalidateQueries({ queryKey: ['incidentReportStats'] });
      setShowStatusModal(false);
      setStatusNotes('');
      Alert.alert('Status Updated', 'The report status has been updated successfully.');
    },
    onError: (error: any) => {
      const errorMessage = error?.message?.toLowerCase() || '';
      let userMessage = 'We couldn\'t update the status. Please try again.';

      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        userMessage = 'Unable to connect. Please check your internet connection.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        userMessage = 'You don\'t have permission to change the status.';
      }

      Alert.alert('Unable to Update Status', userMessage);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteIncidentReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidentReports'] });
      queryClient.invalidateQueries({ queryKey: ['incidentReportStats'] });
      Alert.alert('Report Deleted', 'The incident report has been deleted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      const errorMessage = error?.message?.toLowerCase() || '';
      let userMessage = 'We couldn\'t delete this report. Please try again.';

      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        userMessage = 'Unable to connect. Please check your internet connection.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        userMessage = 'You don\'t have permission to delete this report.';
      }

      Alert.alert('Unable to Delete Report', userMessage);
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    (navigation as any).navigate('EditIncidentReport', { reportId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this incident report? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const handleUpdateStatus = () => {
    if (report) {
      setSelectedStatus(report.status);
      setShowStatusModal(true);
    }
  };

  const handleConfirmStatusUpdate = () => {
    if (selectedStatus) {
      statusMutation.mutate({ status: selectedStatus, notes: statusNotes.trim() || undefined });
    }
  };

  const renderStatusModal = () => (
    <Modal
      visible={showStatusModal}
      animationType="fade"
      transparent
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowStatusModal(false)}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <Pressable onPress={() => setShowStatusModal(false)}>
              <X size={24} color={GRAY[600]} />
            </Pressable>
          </View>

          {/* Status Options */}
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((status) => {
              const config = STATUS_CONFIG[status];
              const StatusIcon = config.icon;
              const isSelected = selectedStatus === status;

              return (
                <Pressable
                  key={status}
                  style={[
                    styles.statusOption,
                    isSelected && { backgroundColor: config.bgColor, borderColor: config.color },
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <StatusIcon size={20} color={config.color} />
                  <Text style={[styles.statusOptionText, { color: config.color }]}>
                    {config.label}
                  </Text>
                  {isSelected && (
                    <CheckCircle2 size={18} color={config.color} style={styles.statusCheck} />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes about this status change..."
              placeholderTextColor={GRAY[400]}
              value={statusNotes}
              onChangeText={setStatusNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <Pressable
              style={styles.modalCancelButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.modalConfirmButton, statusMutation.isPending && styles.buttonDisabled]}
              onPress={handleConfirmStatusUpdate}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalConfirmText}>Update Status</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Incident Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY[500]} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={SEMANTIC.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Incident Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={GRAY[400]} />
          <Text style={styles.errorTitle}>Report Not Found</Text>
          <Text style={styles.errorText}>
            This incident report may have been deleted or is no longer available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[report.status];
  const severityConfig = SEVERITY_CONFIG[report.severity];
  const StatusIcon = statusConfig.icon;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Incident Details</Text>
        <Pressable onPress={() => refetch()} style={styles.refreshButton}>
          <RefreshCw size={20} color={GRAY[600]} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Title & Badges */}
        <View style={styles.titleSection}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: severityConfig.bgColor }]}>
              <Text style={[styles.badgeText, { color: severityConfig.color }]}>
                {severityConfig.label} Severity
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusConfig.bgColor }]}>
              <StatusIcon size={14} color={statusConfig.color} />
              <Text style={[styles.badgeText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={18} color={GRAY[500]} />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>

        {/* Affected Employee */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={18} color={GRAY[500]} />
            <Text style={styles.sectionTitle}>Affected Employee</Text>
          </View>
          <View style={styles.employeeCard}>
            <Text style={styles.employeeName}>{report.employeeName}</Text>
            {report.employeeEmail && (
              <Text style={styles.employeeEmail}>{report.employeeEmail}</Text>
            )}
          </View>
        </View>

        {/* Location */}
        {report.location && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={18} color={GRAY[500]} />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.locationText}>{report.location}</Text>
          </View>
        )}

        {/* Dates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={GRAY[500]} />
            <Text style={styles.sectionTitle}>Timeline</Text>
          </View>
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#ef4444' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Incident Date</Text>
                <Text style={styles.timelineValue}>
                  {format(new Date(report.incidentDate), 'MMMM d, yyyy')}
                </Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#3b82f6' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Reported</Text>
                <Text style={styles.timelineValue}>
                  {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                </Text>
                <Text style={styles.timelineSubtext}>by {report.reportedByName}</Text>
              </View>
            </View>
            {report.resolvedAt && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#10b981' }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Resolved</Text>
                  <Text style={styles.timelineValue}>
                    {format(new Date(report.resolvedAt), 'MMM d, yyyy h:mm a')}
                  </Text>
                  {report.resolvedByName && (
                    <Text style={styles.timelineSubtext}>by {report.resolvedByName}</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {report.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={18} color={GRAY[500]} />
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{report.notes}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Pressable style={styles.primaryAction} onPress={handleUpdateStatus}>
            <RefreshCw size={20} color="#fff" />
            <Text style={styles.primaryActionText}>Update Status</Text>
          </Pressable>
          <View style={styles.secondaryActions}>
            <Pressable style={styles.secondaryAction} onPress={handleEdit}>
              <Edit2 size={20} color={PRIMARY[500]} />
              <Text style={styles.secondaryActionText}>Edit</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryAction, styles.deleteAction]}
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <ActivityIndicator color="#ef4444" size="small" />
              ) : (
                <>
                  <Trash2 size={20} color="#ef4444" />
                  <Text style={[styles.secondaryActionText, { color: '#ef4444' }]}>Delete</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {renderStatusModal()}
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
  refreshButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  errorText: {
    fontSize: 14,
    color: GRAY[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  titleSection: {
    marginBottom: spacing[6],
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[3],
    lineHeight: 32,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 16,
    color: SEMANTIC.text.primary,
    lineHeight: 24,
    backgroundColor: '#fff',
    padding: spacing[4],
    borderRadius: 12,
  },
  employeeCard: {
    backgroundColor: '#fff',
    padding: spacing[4],
    borderRadius: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  employeeEmail: {
    fontSize: 14,
    color: GRAY[500],
    marginTop: 4,
  },
  locationText: {
    fontSize: 16,
    color: SEMANTIC.text.primary,
    backgroundColor: '#fff',
    padding: spacing[4],
    borderRadius: 12,
  },
  timelineContainer: {
    backgroundColor: '#fff',
    padding: spacing[4],
    borderRadius: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: spacing[3],
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY[500],
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 15,
    fontWeight: '500',
    color: SEMANTIC.text.primary,
  },
  timelineSubtext: {
    fontSize: 13,
    color: GRAY[500],
    marginTop: 2,
  },
  notesCard: {
    backgroundColor: '#fffbeb',
    padding: spacing[4],
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  notesText: {
    fontSize: 14,
    color: SEMANTIC.text.primary,
    lineHeight: 22,
  },
  actionsSection: {
    marginTop: spacing[4],
    gap: spacing[3],
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: PRIMARY[500],
    paddingVertical: spacing[4],
    borderRadius: 12,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: '#fff',
    paddingVertical: spacing[4],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GRAY[200],
  },
  deleteAction: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: PRIMARY[500],
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: spacing[4],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  statusOptions: {
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: 12,
    backgroundColor: GRAY[50],
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing[3],
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  statusCheck: {
    marginLeft: 'auto',
  },
  notesContainer: {
    marginBottom: spacing[4],
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  notesInput: {
    backgroundColor: GRAY[50],
    borderWidth: 1,
    borderColor: GRAY[200],
    borderRadius: 10,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 15,
    color: SEMANTIC.text.primary,
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: 10,
    backgroundColor: GRAY[100],
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY[600],
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: 10,
    backgroundColor: PRIMARY[500],
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
