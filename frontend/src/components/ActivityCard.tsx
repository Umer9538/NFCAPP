/**
 * Activity Card Component
 * Reusable component for displaying activity log items
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow, format } from 'date-fns';

import { Card } from '@/components/ui';
import type { Activity, ActivityType } from '@/types/dashboard';
import { PRIMARY, SEMANTIC, STATUS, MEDICAL_COLORS } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface ActivityCardProps {
  activity: Activity;
  onPress?: (activity: Activity) => void;
}

export function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [rotateAnim] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const { icon, color, backgroundColor } = getActivityStyle(activity.type);

  return (
    <Card variant="elevated" padding="none" style={styles.card}>
      <Pressable
        onPress={onPress ? () => onPress(activity) : toggleExpand}
        style={styles.cardContent}
      >
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>

          {/* Activity Info */}
          <View style={styles.activityInfo}>
            <Text style={styles.action}>{activity.action}</Text>
            <Text style={styles.description} numberOfLines={expanded ? undefined : 2}>
              {activity.description}
            </Text>

            {/* Metadata */}
            <View style={styles.metadata}>
              <View style={styles.metadataItem}>
                <Ionicons name="time-outline" size={14} color={SEMANTIC.text.tertiary} />
                <Text style={styles.metadataText}>
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </Text>
              </View>

              {activity.location && (
                <View style={styles.metadataItem}>
                  <Ionicons name="location-outline" size={14} color={SEMANTIC.text.tertiary} />
                  <Text style={styles.metadataText}>
                    {[activity.location.city, activity.location.country]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Expand Button */}
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="chevron-down" size={20} color={SEMANTIC.text.tertiary} />
          </Animated.View>
        </View>

        {/* Expanded Details */}
        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />

            {/* Full Timestamp */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Timestamp:</Text>
              <Text style={styles.detailValue}>
                {format(new Date(activity.timestamp), 'PPpp')}
              </Text>
            </View>

            {/* Device Info */}
            {activity.device && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Device:</Text>
                <Text style={styles.detailValue}>
                  {activity.device.type}
                  {activity.device.os && ` (${activity.device.os})`}
                </Text>
              </View>
            )}

            {/* Browser */}
            {activity.device?.browser && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Browser:</Text>
                <Text style={styles.detailValue}>{activity.device.browser}</Text>
              </View>
            )}

            {/* IP Address */}
            {activity.ipAddress && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>IP Address:</Text>
                <Text style={[styles.detailValue, styles.monospace]}>
                  {activity.ipAddress}
                </Text>
              </View>
            )}

            {/* User Info */}
            {activity.userName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>User:</Text>
                <Text style={styles.detailValue}>{activity.userName}</Text>
              </View>
            )}

            {/* Activity Type Badge */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <View style={[styles.typeBadge, { backgroundColor }]}>
                <Text style={[styles.typeBadgeText, { color }]}>
                  {(activity.type || 'unknown').toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Additional Metadata */}
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <>
                <Text style={styles.metadataTitle}>Additional Details:</Text>
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{key}:</Text>
                    <Text style={styles.detailValue}>{String(value)}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </Pressable>
    </Card>
  );
}

function getActivityStyle(type: ActivityType): {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
} {
  switch (type) {
    case 'access':
      return {
        icon: 'eye-outline',
        color: MEDICAL_COLORS.blue[600],
        backgroundColor: MEDICAL_COLORS.blue[50],
      };
    case 'update':
      return {
        icon: 'create-outline',
        color: MEDICAL_COLORS.green[600],
        backgroundColor: MEDICAL_COLORS.green[50],
      };
    case 'system':
      return {
        icon: 'settings-outline',
        color: SEMANTIC.text.secondary,
        backgroundColor: SEMANTIC.background.surface,
      };
    case 'security':
      return {
        icon: 'shield-checkmark-outline',
        color: STATUS.warning,
        backgroundColor: '#FEF3C7',
      };
    case 'login':
      return {
        icon: 'log-in-outline',
        color: PRIMARY[600],
        backgroundColor: PRIMARY[50],
      };
    case 'scan':
      return {
        icon: 'scan-outline',
        color: MEDICAL_COLORS.purple[600],
        backgroundColor: MEDICAL_COLORS.purple[50],
      };
    default:
      return {
        icon: 'information-circle-outline',
        color: SEMANTIC.text.secondary,
        backgroundColor: SEMANTIC.background.surface,
      };
  }
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing[3],
  },
  cardContent: {
    padding: spacing[4],
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  action: {
    fontSize: 16,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  description: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[2],
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  metadataText: {
    fontSize: 12,
    color: SEMANTIC.text.tertiary,
  },
  expandedContent: {
    marginTop: spacing[3],
  },
  divider: {
    height: 1,
    backgroundColor: SEMANTIC.border.default,
    marginBottom: spacing[3],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
    gap: spacing[2],
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: SEMANTIC.text.secondary,
    minWidth: 90,
  },
  detailValue: {
    fontSize: 13,
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  monospace: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  typeBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
});
