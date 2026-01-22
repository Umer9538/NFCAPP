/**
 * Create Incident Report Screen
 * Form to create a new incident report
 */

import React, { useState } from 'react';
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
  FlatList,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ArrowLeft,
  ChevronDown,
  Calendar,
  User,
  MapPin,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react-native';
import { format } from 'date-fns';

import {
  createIncidentReport,
  getEmployees,
  type CreateIncidentReportRequest,
  type IncidentSeverity,
  type Employee,
} from '@/api/organizations';
import { SEMANTIC, GRAY, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';
import type { AppScreenNavigationProp } from '@/navigation/types';

const SEVERITY_OPTIONS: { key: IncidentSeverity; label: string; color: string; description: string }[] = [
  { key: 'low', label: 'Low', color: '#10b981', description: 'Minor issue, no immediate action required' },
  { key: 'medium', label: 'Medium', color: '#f59e0b', description: 'Moderate issue, attention needed' },
  { key: 'high', label: 'High', color: '#ef4444', description: 'Serious issue, prompt action required' },
  { key: 'critical', label: 'Critical', color: '#7c3aed', description: 'Emergency, immediate action required' },
];

export default function CreateIncidentReportScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [incidentDate, setIncidentDate] = useState(new Date());
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');

  // Modal states
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSeverityPicker, setShowSeverityPicker] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Fetch employees for picker
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', 1, employeeSearch],
    queryFn: () => getEmployees(1, 100, employeeSearch),
  });

  const employees = employeesData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateIncidentReportRequest) => createIncidentReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidentReports'] });
      queryClient.invalidateQueries({ queryKey: ['incidentReportStats'] });
      Alert.alert('Report Created', 'Your incident report has been submitted successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      const errorMessage = error?.message?.toLowerCase() || '';
      let userMessage = 'We couldn\'t create the report. Please try again.';

      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        userMessage = 'Unable to connect. Please check your internet connection and try again.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        userMessage = 'You don\'t have permission to create incident reports.';
      }

      Alert.alert('Unable to Create Report', userMessage);
    },
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for this report.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please provide a description of the incident.');
      return;
    }
    if (!selectedEmployee) {
      Alert.alert('Missing Information', 'Please select the affected employee.');
      return;
    }

    const data: CreateIncidentReportRequest = {
      employeeId: selectedEmployee.id,
      title: title.trim(),
      description: description.trim(),
      incidentDate: incidentDate.toISOString(),
      location: location.trim() || undefined,
      severity,
    };

    createMutation.mutate(data);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setIncidentDate(date);
    }
  };

  const renderEmployeePicker = () => (
    <Modal
      visible={showEmployeePicker}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Employee</Text>
          <Pressable onPress={() => setShowEmployeePicker(false)}>
            <X size={24} color={GRAY[600]} />
          </Pressable>
        </View>

        <View style={styles.modalSearchContainer}>
          <TextInput
            style={styles.modalSearchInput}
            placeholder="Search employees..."
            placeholderTextColor={GRAY[400]}
            value={employeeSearch}
            onChangeText={setEmployeeSearch}
          />
        </View>

        {isLoadingEmployees ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY[500]} />
          </View>
        ) : (
          <FlatList
            data={employees}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.employeeItem,
                  selectedEmployee?.id === item.id && styles.employeeItemSelected,
                ]}
                onPress={() => {
                  setSelectedEmployee(item);
                  setShowEmployeePicker(false);
                }}
              >
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{item.fullName}</Text>
                  <Text style={styles.employeeEmail}>{item.email}</Text>
                  {item.department && (
                    <Text style={styles.employeeDept}>{item.department}</Text>
                  )}
                </View>
                {selectedEmployee?.id === item.id && (
                  <Check size={20} color={PRIMARY[500]} />
                )}
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyText}>No employees found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );

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

  const selectedSeverityConfig = SEVERITY_OPTIONS.find((s) => s.key === severity);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Incident Report</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
        {/* Employee Selector */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Affected Employee *</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => setShowEmployeePicker(true)}
          >
            <User size={20} color={GRAY[400]} />
            <Text
              style={[
                styles.selectButtonText,
                selectedEmployee && styles.selectButtonTextActive,
              ]}
            >
              {selectedEmployee ? selectedEmployee.fullName : 'Select employee...'}
            </Text>
            <ChevronDown size={20} color={GRAY[400]} />
          </Pressable>
        </View>

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

        {/* Incident Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Incident Date *</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={GRAY[400]} />
            <Text style={[styles.selectButtonText, styles.selectButtonTextActive]}>
              {format(incidentDate, 'MMMM d, yyyy')}
            </Text>
            <ChevronDown size={20} color={GRAY[400]} />
          </Pressable>
        </View>

        {showDatePicker && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={incidentDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
            {Platform.OS === 'ios' && (
              <Pressable
                style={styles.datePickerDone}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerDoneText}>Done</Text>
              </Pressable>
            )}
          </View>
        )}

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

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Report</Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Modals */}
      {renderEmployeePicker()}
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
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: -spacing[4],
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  datePickerDone: {
    alignItems: 'flex-end',
    padding: spacing[3],
    borderTopWidth: 1,
    borderTopColor: GRAY[200],
  },
  datePickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY[500],
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: GRAY[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  modalSearchContainer: {
    padding: spacing[4],
    backgroundColor: GRAY[50],
  },
  modalSearchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: GRAY[200],
    borderRadius: 10,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
    color: SEMANTIC.text.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: GRAY[100],
  },
  employeeItemSelected: {
    backgroundColor: PRIMARY[50],
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
  },
  employeeEmail: {
    fontSize: 14,
    color: GRAY[500],
    marginTop: 2,
  },
  employeeDept: {
    fontSize: 12,
    color: GRAY[400],
    marginTop: 2,
  },
  emptyList: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: GRAY[500],
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
