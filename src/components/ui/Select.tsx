/**
 * Select Component
 * Dropdown selection with search and multi-select
 * Matches web app Select design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  ViewStyle,
} from 'react-native';
import { Modal } from './Modal';
import { SEMANTIC, PRIMARY } from '@/constants/colors';
import { spacing, borderRadius, typography } from '@/theme/theme';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string | number | (string | number)[];
  options: SelectOption[];
  onChange: (value: string | number | (string | number)[]) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  containerStyle?: ViewStyle;
  renderOption?: (option: SelectOption) => React.ReactNode;
}

export function Select({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  multiple = false,
  searchable = false,
  containerStyle,
  renderOption,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const hasError = !!error;

  // Get selected option(s) label
  const getSelectedLabel = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find((opt) => opt.value === value[0]);
        return option?.label || placeholder;
      }
      return `${value.length} selected`;
    } else {
      const option = options.find((opt) => opt.value === value);
      return option?.label || placeholder;
    }
  };

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Handle option selection
  const handleSelect = (optionValue: string | number) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter((v) => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  // Check if option is selected
  const isSelected = (optionValue: string | number) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Select Button */}
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        style={[
          styles.selectButton,
          hasError && styles.selectButtonError,
          disabled && styles.selectButtonDisabled,
        ]}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectText,
            (!value || (Array.isArray(value) && value.length === 0)) &&
              styles.placeholderText,
          ]}
        >
          {getSelectedLabel()}
        </Text>
        <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
      </Pressable>

      {/* Helper Text or Error */}
      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      {/* Options Modal */}
      <Modal
        visible={isOpen}
        onClose={handleClose}
        variant="bottom"
        title={label || 'Select'}
        swipeToDismiss
      >
        {/* Search Input */}
        {searchable && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={SEMANTIC.text.tertiary}
              autoFocus
            />
          </View>
        )}

        {/* Options List */}
        <FlatList
          data={filteredOptions}
          keyExtractor={(item) => String(item.value)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => !item.disabled && handleSelect(item.value)}
              style={[
                styles.option,
                isSelected(item.value) && styles.optionSelected,
                item.disabled && styles.optionDisabled,
              ]}
              disabled={item.disabled}
            >
              {renderOption ? (
                renderOption(item)
              ) : (
                <>
                  <Text
                    style={[
                      styles.optionText,
                      isSelected(item.value) && styles.optionTextSelected,
                      item.disabled && styles.optionTextDisabled,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected(item.value) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No options found</Text>
            </View>
          }
          style={styles.optionsList}
          showsVerticalScrollIndicator={false}
        />

        {/* Done Button (for multiple selection) */}
        {multiple && (
          <View style={styles.footer}>
            <Pressable style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  required: {
    color: SEMANTIC.border.error,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SEMANTIC.surface.default,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 44,
  },
  selectButtonError: {
    borderColor: SEMANTIC.border.error,
  },
  selectButtonDisabled: {
    backgroundColor: SEMANTIC.background.tertiary,
    borderColor: SEMANTIC.border.light,
  },
  selectText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
  },
  placeholderText: {
    color: SEMANTIC.text.tertiary,
  },
  chevron: {
    fontSize: 12,
    color: SEMANTIC.text.secondary,
    marginLeft: spacing[2],
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.border.error,
    marginTop: spacing[1],
  },

  // Search
  searchContainer: {
    marginBottom: spacing[3],
  },
  searchInput: {
    backgroundColor: SEMANTIC.background.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
  },

  // Options List
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  optionSelected: {
    backgroundColor: PRIMARY[50],
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
  },
  optionTextSelected: {
    fontWeight: typography.fontWeight.semibold,
    color: PRIMARY[700],
  },
  optionTextDisabled: {
    color: SEMANTIC.text.disabled,
  },
  checkmark: {
    fontSize: 18,
    color: PRIMARY[600],
    fontWeight: typography.fontWeight.bold,
  },

  // Empty State
  emptyState: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.secondary,
  },

  // Footer
  footer: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
  },
  doneButton: {
    backgroundColor: PRIMARY[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#ffffff',
  },
});
