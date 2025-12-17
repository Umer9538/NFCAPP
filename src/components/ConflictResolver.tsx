/**
 * Conflict Resolver Component
 * UI for resolving data conflicts between local and server
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { format } from 'date-fns';

export interface Conflict {
  field: string;
  localValue: any;
  serverValue: any;
  localUpdatedAt?: string;
  serverUpdatedAt?: string;
}

export type ConflictResolutionStrategy = 'local' | 'server' | 'manual';

export interface ConflictResolverProps {
  visible: boolean;
  conflicts: Conflict[];
  onResolve: (strategy: ConflictResolutionStrategy, selections?: Record<string, 'local' | 'server'>) => void;
  onCancel: () => void;
  entityName?: string;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  visible,
  conflicts,
  onResolve,
  onCancel,
  entityName = 'Data',
}) => {
  const [selections, setSelections] = useState<Record<string, 'local' | 'server'>>({});

  const handleSelect = (field: string, source: 'local' | 'server') => {
    setSelections((prev) => ({
      ...prev,
      [field]: source,
    }));
  };

  const handleResolveManual = () => {
    // Check if all conflicts have been resolved
    const allResolved = conflicts.every((c) => selections[c.field]);

    if (!allResolved) {
      return;
    }

    onResolve('manual', selections);
    setSelections({});
  };

  const handleResolveAll = (strategy: 'local' | 'server') => {
    onResolve(strategy);
    setSelections({});
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'None';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (Array.isArray(value)) {
      return value.join(', ') || 'Empty';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  const formatFieldName = (field: string): string => {
    // Convert camelCase to Title Case
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const allResolved = conflicts.every((c) => selections[c.field]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="git-merge" size={24} color={COLORS.warning[600]} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Resolve Conflicts</Text>
              <Text style={styles.subtitle}>
                {entityName} was modified both locally and on the server
              </Text>
            </View>
          </View>

          {/* Conflicts List */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {conflicts.map((conflict, index) => (
              <Card key={conflict.field} variant="outlined" padding="md" style={styles.conflictCard}>
                {/* Field Name */}
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldName}>{formatFieldName(conflict.field)}</Text>
                  {selections[conflict.field] && (
                    <View style={styles.resolvedBadge}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                      <Text style={styles.resolvedText}>Resolved</Text>
                    </View>
                  )}
                </View>

                {/* Comparison */}
                <View style={styles.comparisonContainer}>
                  {/* Local Version */}
                  <Pressable
                    style={[
                      styles.versionCard,
                      selections[conflict.field] === 'local' && styles.versionCardSelected,
                    ]}
                    onPress={() => handleSelect(conflict.field, 'local')}
                  >
                    <View style={styles.versionHeader}>
                      <View style={[styles.versionBadge, styles.localBadge]}>
                        <Ionicons name="phone-portrait" size={14} color={COLORS.primary[600]} />
                        <Text style={[styles.versionBadgeText, { color: COLORS.primary[600] }]}>
                          Your Device
                        </Text>
                      </View>
                      {selections[conflict.field] === 'local' && (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary[600]} />
                      )}
                    </View>

                    {conflict.localUpdatedAt && (
                      <Text style={styles.timestamp}>
                        {format(new Date(conflict.localUpdatedAt), 'MMM d, h:mm a')}
                      </Text>
                    )}

                    <Text style={styles.valueText}>{formatValue(conflict.localValue)}</Text>
                  </Pressable>

                  {/* VS Divider */}
                  <View style={styles.divider}>
                    <Text style={styles.dividerText}>VS</Text>
                  </View>

                  {/* Server Version */}
                  <Pressable
                    style={[
                      styles.versionCard,
                      selections[conflict.field] === 'server' && styles.versionCardSelected,
                    ]}
                    onPress={() => handleSelect(conflict.field, 'server')}
                  >
                    <View style={styles.versionHeader}>
                      <View style={[styles.versionBadge, styles.serverBadge]}>
                        <Ionicons name="cloud" size={14} color={COLORS.secondary[600]} />
                        <Text style={[styles.versionBadgeText, { color: COLORS.secondary[600] }]}>
                          Server
                        </Text>
                      </View>
                      {selections[conflict.field] === 'server' && (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary[600]} />
                      )}
                    </View>

                    {conflict.serverUpdatedAt && (
                      <Text style={styles.timestamp}>
                        {format(new Date(conflict.serverUpdatedAt), 'MMM d, h:mm a')}
                      </Text>
                    )}

                    <Text style={styles.valueText}>{formatValue(conflict.serverValue)}</Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleResolveAll('local')}
                style={styles.quickButton}
              >
                Keep All Local
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleResolveAll('server')}
                style={styles.quickButton}
              >
                Use All Server
              </Button>
            </View>

            {/* Main Actions */}
            <View style={styles.mainActions}>
              <Button variant="ghost" onPress={onCancel} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button
                onPress={handleResolveManual}
                disabled={!allResolved}
                style={styles.resolveButton}
              >
                Resolve ({Object.keys(selections).length}/{conflicts.length})
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.warning[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray[600],
  },
  scrollView: {
    paddingHorizontal: SPACING.lg,
  },
  conflictCard: {
    marginBottom: SPACING.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  fieldName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.gray[900],
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success[500],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resolvedText: {
    ...TYPOGRAPHY.caption,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  comparisonContainer: {
    gap: SPACING.sm,
  },
  versionCard: {
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    backgroundColor: COLORS.gray[50],
  },
  versionCardSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  localBadge: {
    backgroundColor: COLORS.primary[100],
  },
  serverBadge: {
    backgroundColor: COLORS.secondary[100],
  },
  versionBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginLeft: 4,
  },
  timestamp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  valueText: {
    ...TYPOGRAPHY.body,
    color: COLORS.gray[900],
  },
  divider: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[400],
    fontWeight: '700',
  },
  actions: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickButton: {
    flex: 1,
  },
  mainActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
  },
  resolveButton: {
    flex: 2,
  },
});
