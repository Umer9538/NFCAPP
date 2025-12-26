/**
 * Edit Incident Report Screen
 * Edit an existing incident report
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  ChevronDown,
  Calendar,
  MapPin,
  AlertTriangle,
  Check,
} from 'lucide-react-native';
import { format } from 'date-fns';

import {
  getIncidentReport,
  updateIncidentReport,
  type UpdateIncidentReportRequest,
  type IncidentSeverity,
} from '@/api/organizations';
import { SEMANTIC, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

type RouteParams = {
  EditIncidentReport: {
    reportId: string;
  };
};

const SEVERITY_OPTIONS: { key: IncidentSeverity; label: string; color: string; description: string }[] = [
  { key: 'low', label: 'Low', color: '#10b981', description: 'Minor issue, no immediate action required' },
  { key: 'medium', label: 'Medium', color: '#f59e0b', description: 'Moderate issue, attention needed' },
  { key: 'high', label: 'High', color: '#ef4444', description: 'Serious issue, prompt action required' },
  { key: 'critical', label: 'Critical', color: '#7c3aed', description: 'Emergency, immediate action required' },
];

export default function EditIncidentReportScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'EditIncidentReport'>>();
  const queryClient = useQueryClient();
  const { reportId } = route.params;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [notes, setNotes] = useState('');

  // Modal states
  const [showSeverityPicker, setShowSeverityPicker] = useState(false);

  // Fetch existing report
  const { data: report, isLoading } = useQuery({
    queryKey: ['incidentReport', reportId],
    queryFn: () => getIncidentReport(reportId),
  });

  // Initialize form when report loads
  useEffect(() => {
    if (report) {
      setTitle(report.title || '');
      setDescription(report.description || '');
      setLocation(report.location || '');
      setSeverity(report.severity || 'medium');
      setNotes(report.notes || '');
    }
  }, [report]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateIncidentReportRequest) => updateIncidentReport(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidentReport', reportId] });
      queryClient.invalidateQueries({ queryKey: ['incidentReports'] });
      Alert.alert('Success', 'Incident report updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update incident report');
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return;
    }

    const data: UpdateIncidentReportRequest = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || undefined,
      severity,
      notes: notes.trim() || undefined,
    };

    updateMutation.mutate(data);
  };

  const renderSeverityPicker = () => (
    <Modal
      visible={showSeverityPicker}
      animationType="fade"
      transparent
    >
      <Pressable
        style={styles.severityModalOverlay}
        onPress={() => setShowSeverityPicker(false)}
      >
        <View style={styles.severityModalContent}>
          <Text style={styles.severityModalTitle}>Select Severity</Text>
          {SEVERITY_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              style={[
                styles.severityOption,
                severity === option.key && styles.severityOptionSelected,
              ]}
              onPress={() => {
                setSeverity(option.key);
                setShowSeverityPicker(false);
              }}
            >
              <View style={styles.severityOptionHeader}>
                <View style={[styles.severityDot, { backgroundColor: option.color }]} />
                <Text style={styles.severityOptionLabel}>{option.label}</Text>
                {severity === option.key && (
                  <Check size={18} color={PRIMARY[500]} />
                )}
              </View>
              <Text style={styles.severityOptionDesc}>{option.description}</Text>
            </Pressable>
          ))}
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
          <Text style={styles.headerTitle}>Edit Report</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY[500]} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedSeverityConfig = SEVERITY_OPTIONS.find((s) => s.key === severity);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Report</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
        {/* Employee Info (read-only) */}
        {report && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Affected Employee</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{report.employeeName}</Text>
              <Text style={styles.readOnlySubtext}>Cannot be changed</Text>
            </View>
          </View>
        )}

        {/* Title */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Brief incident title..."
            placeholderTextColor={GRAY[400]}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Description *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Detailed description of the incident..."
            placeholderTextColor={GRAY[400]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Location</Text>
          <View style={styles.textInputWithIcon}>
            <MapPin size={20} color={GRAY[400]} />
            <TextInput
              style={styles.textInputInner}
              placeholder="Where did it happen?"
              placeholderTextColor={GRAY[400]}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Severity */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Severity *</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => setShowSeverityPicker(true)}
          >
            <AlertTriangle size={20} color={selectedSeverityConfig?.color || GRAY[400]} />
            <View style={styles.severitySelected}>
              <Text
                style={[
                  styles.selectButtonText,
                  styles.selectButtonTextActive,
                  { color: selectedSeverityConfig?.color },
                ]}
              >
                {selectedSeverityConfig?.label}
              </Text>
              <Text style={styles.severityDesc}>{selectedSeverityConfig?.description}</Text>
            </View>
            <ChevronDown size={20} color={GRAY[400]} />
          </Pressable>
        </View>

        {/* Notes */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Additional Notes</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Add any additional notes..."
            placeholderTextColor={GRAY[400]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, updateMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>

      {renderSeverityPicker()}
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
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  fieldContainer: {
    marginBottom: spacing[5],
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  readOnlyField: {
    backgroundColor: GRAY[100],
    borderRadius: 10,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  readOnlyText: {
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  readOnlySubtext: {
    fontSize: 12,
    color: GRAY[500],
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: GRAY[200],
    borderRadius: 10,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing[3],
  },
  textInputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: GRAY[200],
    borderRadius: 10,
    paddingHorizontal: spacing[4],
  },
  textInputInner: {
    flex: 1,
    paddingVertical: spacing[3],
    paddingLeft: spacing[3],
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: GRAY[200],
    borderRadius: 10,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  selectButtonText: {
    flex: 1,
    marginLeft: spacing[3],
    fontSize: 16,
    color: GRAY[400],
  },
  selectButtonTextActive: {
    color: SEMANTIC.text.primary,
  },
  severitySelected: {
    flex: 1,
    marginLeft: spacing[3],
  },
  severityDesc: {
    fontSize: 12,
    color: GRAY[500],
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: PRIMARY[500],
    borderRadius: 10,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[4],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Severity modal
  severityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  severityModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: spacing[4],
  },
  severityModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[4],
  },
  severityOption: {
    padding: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[2],
    backgroundColor: GRAY[50],
  },
  severityOptionSelected: {
    backgroundColor: PRIMARY[50],
    borderWidth: 2,
    borderColor: PRIMARY[500],
  },
  severityOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing[2],
  },
  severityOptionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  severityOptionDesc: {
    fontSize: 13,
    color: GRAY[500],
    marginLeft: 20,
  },
});
