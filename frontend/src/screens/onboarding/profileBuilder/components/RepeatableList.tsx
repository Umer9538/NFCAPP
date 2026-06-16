import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY, GRAY, STATUS } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

interface Props<T> {
  items: T[];
  /** Heading rendered on the closed-row summary. Falls back to "Entry N". */
  itemTitle: (item: T, index: number) => string;
  /** Optional secondary line under the title. */
  itemSubtitle?: (item: T, index: number) => string | undefined;
  renderEditor: (item: T, index: number) => React.ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
  addLabel: string;
  emptyHint?: string;
}

/**
 * Accordion-style list: each row is collapsed by default; tapping opens its
 * editor. Avoids one giant scrolling form when the user has many entries.
 */
export function RepeatableList<T>({
  items,
  itemTitle,
  itemSubtitle,
  renderEditor,
  onAdd,
  onRemove,
  addLabel,
  emptyHint,
}: Props<T>) {
  const [openIndex, setOpenIndex] = useState<number>(items.length === 0 ? -1 : 0);

  if (items.length === 0) {
    return (
      <View>
        {emptyHint && <Text style={styles.emptyHint}>{emptyHint}</Text>}
        <Pressable onPress={onAdd} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={20} color={PRIMARY[600]} />
          <Text style={styles.addText}>{addLabel}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const title = itemTitle(item, idx) || `Entry ${idx + 1}`;
        const subtitle = itemSubtitle?.(item, idx);
        return (
          <View key={idx} style={[styles.row, isOpen && styles.rowOpen]}>
            <Pressable
              style={styles.rowHeader}
              onPress={() => setOpenIndex(isOpen ? -1 : idx)}
            >
              <View style={styles.rowHeaderText}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={GRAY[500]}
              />
            </Pressable>
            {isOpen && (
              <View style={styles.editor}>
                {renderEditor(item, idx)}
                <Pressable style={styles.removeButton} onPress={() => onRemove(idx)}>
                  <Ionicons name="trash-outline" size={16} color={STATUS.error.main} />
                  <Text style={styles.removeText}>Remove this entry</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
      <Pressable
        onPress={() => {
          onAdd();
          setOpenIndex(items.length); // open the newly-added row
        }}
        style={styles.addButton}
      >
        <Ionicons name="add-circle-outline" size={20} color={PRIMARY[600]} />
        <Text style={styles.addText}>{addLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyHint: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[3],
    fontStyle: 'italic',
  },
  row: {
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
    backgroundColor: SEMANTIC.surface.default,
    overflow: 'hidden',
  },
  rowOpen: {
    borderColor: PRIMARY[300],
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
  },
  rowHeaderText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  rowSubtitle: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: 2,
  },
  editor: {
    padding: spacing[3],
    paddingTop: 0,
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
  },
  removeText: {
    color: STATUS.error.main,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingVertical: spacing[3],
    borderWidth: 1,
    borderColor: PRIMARY[300],
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    backgroundColor: PRIMARY[50],
  },
  addText: {
    color: PRIMARY[700],
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
  },
});
