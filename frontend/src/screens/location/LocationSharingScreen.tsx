/**
 * Location Sharing Screen
 * Allows users to share their location with emergency contacts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
  Share,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import {
  MapPin,
  Share2,
  Clock,
  Eye,
  Copy,
  ExternalLink,
  Phone,
  MessageCircle,
  Mail,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Navigation,
  ArrowLeft,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppScreenNavigationProp } from '@/navigation/types';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typography, borderRadius } from '@/theme/theme';
import { GRAY, SEMANTIC } from '@/constants/colors';
import {
  createLocationShare,
  getLocationHistory,
  deactivateLocationShare,
  LocationShare,
} from '@/api/location';
import { API_CONFIG } from '@/constants/config';

export default function LocationSharingScreen() {
  const navigation = useNavigation<AppScreenNavigationProp>();
  const theme = useTheme();
  const primaryColor = theme.primary[600];

  // State
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shares, setShares] = useState<LocationShare[]>([]);
  const [stats, setStats] = useState({ totalShares: 0, totalViews: 0 });
  const [newShareUrl, setNewShareUrl] = useState<string | null>(null);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please enable location access in settings.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Try to get address
      let address: string | undefined;
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (geocode) {
          address = [geocode.street, geocode.city, geocode.region]
            .filter(Boolean)
            .join(', ');
        }
      } catch (e) {
        console.log('Geocoding error:', e);
      }

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        address,
      });
    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || '';
      let userMessage = 'We couldn\'t get your location. Please try again.';

      if (errorMessage.includes('permission')) {
        userMessage = 'Location permission is required. Please enable it in your device settings.';
      } else if (errorMessage.includes('timeout')) {
        userMessage = 'Getting your location took too long. Please try again.';
      } else if (errorMessage.includes('unavailable')) {
        userMessage = 'Location services are not available. Please check your device settings.';
      }

      setLocationError(userMessage);
    }
  }, []);

  // Load share history
  const loadShareHistory = useCallback(async () => {
    try {
      const response = await getLocationHistory(20, true);
      if (response.success) {
        setShares(response.shares);
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error loading share history:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    getCurrentLocation();
    loadShareHistory();
  }, [getCurrentLocation, loadShareHistory]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([getCurrentLocation(), loadShareHistory()]);
    setRefreshing(false);
  }, [getCurrentLocation, loadShareHistory]);

  // Create location share
  const handleShareLocation = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Unable to get current location. Please try again.');
      return;
    }

    setSharingLocation(true);
    try {
      const response = await createLocationShare({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        expiresInHours: 1,
      });

      if (response.success) {
        const shareUrl = `${API_CONFIG.BASE_URL}/location/${response.shareToken}`;
        setNewShareUrl(shareUrl);

        // Show share options
        showShareOptions(shareUrl);

        // Reload history
        loadShareHistory();
      }
    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || '';
      let userMessage = 'We couldn\'t share your location. Please try again.';

      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        userMessage = 'Unable to connect. Please check your internet connection and try again.';
      }

      Alert.alert('Unable to Share Location', userMessage);
    } finally {
      setSharingLocation(false);
    }
  };

  // Show share options modal
  const showShareOptions = (url: string) => {
    Alert.alert(
      'Location Link Ready',
      'Your location link has been created. How would you like to share it?',
      [
        {
          text: 'Copy Link',
          onPress: () => copyToClipboard(url),
        },
        {
          text: 'Share',
          onPress: () => shareLink(url),
        },
        {
          text: 'Done',
          style: 'cancel',
        },
      ]
    );
  };

  // Copy link to clipboard
  const copyToClipboard = async (url: string) => {
    await Clipboard.setStringAsync(url);
    Alert.alert('Link Copied', 'The location link has been copied to your clipboard.');
  };

  // Share link using native share
  const shareLink = async (url: string) => {
    try {
      await Share.share({
        message: `Check my location: ${url}`,
        url: url,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Deactivate a share
  const handleDeactivateShare = async (shareToken: string) => {
    Alert.alert(
      'Deactivate Share',
      'This will make the link inaccessible. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivateLocationShare(shareToken);
              loadShareHistory();
            } catch (error: any) {
              Alert.alert('Unable to Deactivate', 'We couldn\'t deactivate this share link. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Get share status
  const getShareStatus = (share: LocationShare) => {
    const now = new Date();
    const expiresAt = new Date(share.expiresAt);

    if (!share.isActive) {
      return { label: 'Deactivated', color: GRAY[500], icon: XCircle };
    }
    if (expiresAt < now) {
      return { label: 'Expired', color: '#ef4444', icon: Clock };
    }
    return { label: 'Active', color: '#10b981', icon: CheckCircle };
  };

  // Format time remaining
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m remaining`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m remaining`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={SEMANTIC.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Location Sharing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
          />
        }
      >
        {/* Current Location Card */}
        <Card style={styles.locationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <MapPin size={24} color={primaryColor} />
              <Text style={styles.cardTitle}>Current Location</Text>
            </View>
            <TouchableOpacity onPress={getCurrentLocation}>
              <RefreshCw size={20} color={GRAY[500]} />
            </TouchableOpacity>
          </View>

          {locationError ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color={'#ef4444'} />
              <Text style={styles.errorText}>{locationError}</Text>
            </View>
          ) : currentLocation ? (
            <View style={styles.locationInfo}>
              <Text style={styles.addressText}>
                {currentLocation.address || 'Getting address...'}
              </Text>
              <Text style={styles.coordsText}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
              {currentLocation.accuracy && (
                <Text style={styles.accuracyText}>
                  Accuracy: {Math.round(currentLocation.accuracy)}m
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={primaryColor} />
              <Text style={styles.loadingText}>Getting location...</Text>
            </View>
          )}

          <Button
            onPress={handleShareLocation}
            disabled={!currentLocation || sharingLocation}
            style={{ ...styles.shareButton, backgroundColor: primaryColor }}
            icon={<Share2 size={20} color="#FFFFFF" />}
          >
            {sharingLocation ? 'Sharing...' : 'Share My Location'}
          </Button>

          <Text style={styles.shareNote}>
            Creates a link that expires in 1 hour
          </Text>
        </Card>

        {/* Stats Card */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Share2 size={24} color={primaryColor} />
            <Text style={styles.statValue}>{stats.totalShares}</Text>
            <Text style={styles.statLabel}>Total Shares</Text>
          </Card>
          <Card style={styles.statCard}>
            <Eye size={24} color={primaryColor} />
            <Text style={styles.statValue}>{stats.totalViews}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </Card>
        </View>

        {/* Share History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share History</Text>

          {shares.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Navigation size={48} color={GRAY[300]} />
              <Text style={styles.emptyTitle}>No shares yet</Text>
              <Text style={styles.emptyText}>
                Share your location with emergency contacts for quick assistance
              </Text>
            </Card>
          ) : (
            shares.map((share) => {
              const status = getShareStatus(share);
              const StatusIcon = status.icon;

              return (
                <Card key={share.id} style={styles.shareCard}>
                  <View style={styles.shareHeader}>
                    <View style={styles.shareStatus}>
                      <StatusIcon size={16} color={status.color} />
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                    <Text style={styles.shareDate}>
                      {formatDate(share.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.shareInfo}>
                    <Text style={styles.shareAddress} numberOfLines={1}>
                      {share.address || `${share.latitude.toFixed(4)}, ${share.longitude.toFixed(4)}`}
                    </Text>
                    {status.label === 'Active' && (
                      <Text style={styles.timeRemaining}>
                        {getTimeRemaining(share.expiresAt)}
                      </Text>
                    )}
                  </View>

                  <View style={styles.shareStats}>
                    <View style={styles.shareStat}>
                      <Eye size={14} color={GRAY[500]} />
                      <Text style={styles.shareStatText}>
                        {share.accessCount} views
                      </Text>
                    </View>
                  </View>

                  {status.label === 'Active' && (
                    <View style={styles.shareActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => copyToClipboard(`${API_CONFIG.BASE_URL}/location/${share.shareToken}`)}
                      >
                        <Copy size={16} color={primaryColor} />
                        <Text style={[styles.actionText, { color: primaryColor }]}>
                          Copy
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => shareLink(`${API_CONFIG.BASE_URL}/location/${share.shareToken}`)}
                      >
                        <Share2 size={16} color={primaryColor} />
                        <Text style={[styles.actionText, { color: primaryColor }]}>
                          Share
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeactivateShare(share.shareToken)}
                      >
                        <XCircle size={16} color={'#ef4444'} />
                        <Text style={[styles.actionText, { color: '#ef4444' }]}>
                          Deactivate
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SEMANTIC.background.secondary,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SEMANTIC.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: spacing[4],
    paddingTop: spacing[4],
  },
  locationCard: {
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  locationInfo: {
    marginBottom: spacing[4],
  },
  addressText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  coordsText: {
    fontSize: typography.fontSize.sm,
    color: GRAY[500],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  accuracyText: {
    fontSize: typography.fontSize.xs,
    color: GRAY[400],
    marginTop: spacing[1],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: '#fef2f2',
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: '#ef4444',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: GRAY[500],
  },
  shareButton: {
    marginTop: spacing[2],
  },
  shareNote: {
    fontSize: typography.fontSize.xs,
    color: GRAY[500],
    textAlign: 'center',
    marginTop: spacing[2],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1,
    padding: spacing[4],
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
    marginTop: spacing[2],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: GRAY[500],
    marginTop: spacing[1],
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[3],
  },
  emptyCard: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
    marginTop: spacing[3],
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: GRAY[500],
    textAlign: 'center',
    marginTop: spacing[2],
  },
  shareCard: {
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  shareStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  shareDate: {
    fontSize: typography.fontSize.xs,
    color: GRAY[500],
  },
  shareInfo: {
    marginBottom: spacing[2],
  },
  shareAddress: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
  },
  timeRemaining: {
    fontSize: typography.fontSize.xs,
    color: '#10b981',
    marginTop: spacing[1],
  },
  shareStats: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing[3],
  },
  shareStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  shareStatText: {
    fontSize: typography.fontSize.xs,
    color: GRAY[500],
  },
  shareActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
    paddingTop: spacing[3],
    gap: spacing[4],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
