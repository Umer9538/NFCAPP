/**
 * Safe Zones — mirrors the web's /dashboard/safe-zones page 1:1.
 * Uses the same backend endpoints (/api/safe-zones*).
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Plus,
  X,
  Trash2,
  Edit3,
  MapPin,
  Power,
  PowerOff,
  LogIn,
  LogOut,
  AlertCircle,
} from 'lucide-react-native';

import { PRIMARY, GRAY } from '@/constants/colors';
import {
  safeZonesApi,
  type SafeZone,
  type SafeZoneInput,
} from '@/api/safeZones';

interface FormState {
  name: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
  alertOnEntry: boolean;
  alertOnExit: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  latitude: '',
  longitude: '',
  radiusMeters: '200',
  alertOnEntry: true,
  alertOnExit: true,
};

export default function SafeZonesScreen() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; editing: SafeZone | null }>({
    open: false,
    editing: null,
  });
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['safeZones'],
    queryFn: safeZonesApi.listSafeZones,
  });
  const zones = data?.data ?? [];
  const meta = data?.meta ?? { count: 0, limit: 3 };
  const limitReached = meta.count >= meta.limit;

  const createMut = useMutation({
    mutationFn: (body: SafeZoneInput) => safeZonesApi.createSafeZone(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['safeZones'] });
      setModal({ open: false, editing: null });
    },
    onError: (e: any) => setFormError(extractError(e)),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<SafeZoneInput> & { isActive?: boolean } }) =>
      safeZonesApi.updateSafeZone(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['safeZones'] }),
    onError: (e: any) => setFormError(extractError(e)),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => safeZonesApi.deleteSafeZone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['safeZones'] }),
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModal({ open: true, editing: null });
  };
  const openEdit = (zone: SafeZone) => {
    setForm({
      name: zone.name,
      latitude: String(zone.latitude),
      longitude: String(zone.longitude),
      radiusMeters: String(zone.radiusMeters),
      alertOnEntry: zone.alertOnEntry,
      alertOnExit: zone.alertOnExit,
    });
    setFormError(null);
    setModal({ open: true, editing: zone });
  };

  const handleSubmit = () => {
    setFormError(null);
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    const radius = parseInt(form.radiusMeters, 10);

    if (!form.name.trim()) return setFormError('Name is required');
    if (form.name.trim().length > 50) return setFormError('Name must be 50 characters or less');
    if (isNaN(lat) || lat < -90 || lat > 90)
      return setFormError('Latitude must be between -90 and 90');
    if (isNaN(lng) || lng < -180 || lng > 180)
      return setFormError('Longitude must be between -180 and 180');
    if (isNaN(radius) || radius < 50 || radius > 5000)
      return setFormError('Radius must be between 50 and 5000 meters');

    const body: SafeZoneInput = {
      name: form.name.trim(),
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
      alertOnEntry: form.alertOnEntry,
      alertOnExit: form.alertOnExit,
    };
    if (modal.editing) updateMut.mutate({ id: modal.editing.id, patch: body });
    else createMut.mutate(body);
  };

  const handleDelete = (zone: SafeZone) => {
    Alert.alert(
      `Delete "${zone.name}"?`,
      'This safe zone will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMut.mutate(zone.id),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.headerTitleRow}>
            <Shield size={24} color={PRIMARY[600]} />
            <Text style={styles.headerTitle}>Safe Zones</Text>
          </View>
          <Text style={styles.headerSub}>
            Create geofenced areas and get alerts when boundaries are crossed.
          </Text>
        </View>

        <View style={styles.actionRow}>
          <View
            style={[
              styles.zoneCountBadge,
              limitReached && {
                backgroundColor: '#fee2e2',
                borderColor: '#fecaca',
              },
            ]}
          >
            <Text
              style={[
                styles.zoneCountText,
                limitReached && { color: PRIMARY[700] },
              ]}
            >
              {meta.count} / {meta.limit} zones
            </Text>
          </View>
          <Pressable
            onPress={openAdd}
            disabled={limitReached}
            style={[
              styles.primaryBtn,
              limitReached && { opacity: 0.5 },
            ]}
          >
            <Plus size={14} color="#fff" />
            <Text style={styles.primaryBtnText}>Add Zone</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={PRIMARY[600]} />
          </View>
        ) : zones.length === 0 ? (
          <View style={styles.emptyBlock}>
            <View style={styles.emptyIcon}>
              <MapPin size={28} color={GRAY[400]} />
            </View>
            <Text style={styles.emptyTitle}>No safe zones yet</Text>
            <Text style={styles.emptyHint}>
              Create your first safe zone to start receiving alerts when
              boundaries are crossed.
            </Text>
            <Pressable onPress={openAdd} style={styles.primaryBtn}>
              <Plus size={14} color="#fff" />
              <Text style={styles.primaryBtnText}>Create Safe Zone</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {zones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                onToggle={() =>
                  updateMut.mutate({
                    id: zone.id,
                    patch: { isActive: !zone.isActive },
                  })
                }
                onEdit={() => openEdit(zone)}
                onDelete={() => handleDelete(zone)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal
        visible={modal.open}
        animationType="slide"
        transparent
        onRequestClose={() => setModal({ open: false, editing: null })}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modal.editing ? 'Edit Safe Zone' : 'New Safe Zone'}
              </Text>
              <Pressable
                onPress={() => setModal({ open: false, editing: null })}
                hitSlop={8}
              >
                <X size={20} color={GRAY[500]} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {formError && (
                <View style={styles.formErrorBox}>
                  <AlertCircle size={14} color={PRIMARY[600]} />
                  <Text style={styles.formErrorText}>{formError}</Text>
                </View>
              )}

              <Field label="Zone Name" optional>
                <TextInput
                  value={form.name}
                  onChangeText={(t) => setForm({ ...form, name: t })}
                  placeholder="e.g. Home, School, Office"
                  placeholderTextColor={GRAY[400]}
                  style={styles.input}
                />
              </Field>

              <View style={styles.row2}>
                <Field label="Latitude" optional style={{ flex: 1 }}>
                  <TextInput
                    value={form.latitude}
                    onChangeText={(t) => setForm({ ...form, latitude: t })}
                    placeholder="e.g. 43.6532"
                    placeholderTextColor={GRAY[400]}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </Field>
                <Field label="Longitude" optional style={{ flex: 1 }}>
                  <TextInput
                    value={form.longitude}
                    onChangeText={(t) => setForm({ ...form, longitude: t })}
                    placeholder="e.g. -79.3832"
                    placeholderTextColor={GRAY[400]}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </Field>
              </View>

              <Field label="Radius (meters)" optional>
                <TextInput
                  value={form.radiusMeters}
                  onChangeText={(t) => setForm({ ...form, radiusMeters: t })}
                  placeholder="50 – 5000"
                  placeholderTextColor={GRAY[400]}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </Field>

              <Text style={styles.alertPrefsTitle}>Alert Preferences</Text>
              <Checkbox
                checked={form.alertOnEntry}
                label="Alert when entering this zone"
                onToggle={() =>
                  setForm({ ...form, alertOnEntry: !form.alertOnEntry })
                }
              />
              <Checkbox
                checked={form.alertOnExit}
                label="Alert when leaving this zone"
                onToggle={() =>
                  setForm({ ...form, alertOnExit: !form.alertOnExit })
                }
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setModal({ open: false, editing: null })}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={createMut.isPending || updateMut.isPending}
                  style={[
                    styles.primaryBtn,
                    (createMut.isPending || updateMut.isPending) && { opacity: 0.6 },
                  ]}
                >
                  {(createMut.isPending || updateMut.isPending) && (
                    <ActivityIndicator size="small" color="#fff" />
                  )}
                  <Text style={styles.primaryBtnText}>
                    {modal.editing ? 'Save Changes' : 'Create Zone'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ZoneCard({
  zone,
  onToggle,
  onEdit,
  onDelete,
}: {
  zone: SafeZone;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.zoneCard}>
      <View
        style={[
          styles.zoneStrip,
          { backgroundColor: zone.isActive ? '#22c55e' : GRAY[300] },
        ]}
      />
      <View style={{ padding: 14, gap: 10 }}>
        <View style={styles.tabHeaderRow}>
          <View style={styles.zoneCardTitleRow}>
            <Shield size={18} color={PRIMARY[500]} />
            <Text style={styles.zoneName} numberOfLines={1}>
              {zone.name}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: zone.isActive ? '#dcfce7' : GRAY[100],
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: zone.isActive ? '#166534' : GRAY[600] },
              ]}
            >
              {zone.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        <View style={styles.zoneMetaRow}>
          <MapPin size={14} color={GRAY[400]} />
          <Text style={styles.zoneMetaText}>
            {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
          </Text>
        </View>
        <View style={styles.zoneMetaRow}>
          <View style={styles.radiusDot} />
          <Text style={styles.zoneMetaText}>{zone.radiusMeters}m radius</Text>
        </View>

        <View style={styles.alertChipRow}>
          {zone.alertOnEntry && (
            <View style={styles.alertChipBlue}>
              <LogIn size={12} color="#1d4ed8" />
              <Text style={styles.alertChipBlueText}>Entry alert</Text>
            </View>
          )}
          {zone.alertOnExit && (
            <View style={styles.alertChipOrange}>
              <LogOut size={12} color="#c2410c" />
              <Text style={styles.alertChipOrangeText}>Exit alert</Text>
            </View>
          )}
        </View>

        <View style={styles.zoneActions}>
          <Pressable onPress={onToggle} style={styles.zoneActionBtn}>
            {zone.isActive ? (
              <PowerOff size={14} color={GRAY[700]} />
            ) : (
              <Power size={14} color={GRAY[700]} />
            )}
            <Text style={styles.zoneActionText}>
              {zone.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </Pressable>
          <Pressable onPress={onEdit} style={styles.zoneIconBtn}>
            <Edit3 size={16} color={GRAY[700]} />
          </Pressable>
          <Pressable onPress={onDelete} style={styles.zoneIconBtnDanger}>
            <Trash2 size={16} color={PRIMARY[600]} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Field({
  label,
  optional,
  children,
  style,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {optional && <Text style={styles.optional}>(Optional)</Text>}
      </View>
      {children}
    </View>
  );
}

function Checkbox({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.checkboxRow}>
      <View
        style={[
          styles.checkbox,
          checked && {
            backgroundColor: '#2563eb',
            borderColor: '#2563eb',
          },
        ]}
      >
        {checked && <Text style={styles.checkboxTick}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

function extractError(e: any) {
  return (
    e?.response?.data?.error ||
    e?.response?.data?.message ||
    e?.message ||
    'Something went wrong'
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY[50] },
  scroll: { padding: 16, gap: 14 },

  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: GRAY[900],
    letterSpacing: -0.5,
  },
  headerSub: { marginTop: 6, fontSize: 13, color: GRAY[600], lineHeight: 18 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  zoneCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: GRAY[100],
    borderWidth: 1,
    borderColor: GRAY[200],
  },
  zoneCountText: { fontSize: 12, color: GRAY[700], fontWeight: '600' },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: PRIMARY[600],
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  loadingBlock: { paddingVertical: 40, alignItems: 'center' },
  emptyBlock: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GRAY[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: GRAY[900], marginTop: 6 },
  emptyHint: {
    fontSize: 13,
    color: GRAY[600],
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
    marginBottom: 8,
  },

  // Zone card
  zoneCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GRAY[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  zoneStrip: { height: 4 },
  zoneCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  zoneName: { fontSize: 15, fontWeight: '700', color: GRAY[900], flex: 1 },
  tabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  zoneMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  zoneMetaText: { fontSize: 13, color: GRAY[700] },
  radiusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: GRAY[400],
  },
  alertChipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  alertChipBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  alertChipBlueText: { color: '#1d4ed8', fontSize: 11, fontWeight: '600' },
  alertChipOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  alertChipOrangeText: { color: '#c2410c', fontSize: 11, fontWeight: '600' },
  zoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: GRAY[100],
  },
  zoneActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: GRAY[50],
    borderRadius: 8,
  },
  zoneActionText: { color: GRAY[700], fontSize: 12, fontWeight: '600' },
  zoneIconBtn: {
    padding: 8,
    backgroundColor: GRAY[50],
    borderRadius: 8,
  },
  zoneIconBtnDanger: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: GRAY[900] },

  // Field
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: GRAY[800] },
  optional: { fontSize: 12, color: GRAY[500] },
  input: {
    borderWidth: 1,
    borderColor: GRAY[300],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: GRAY[900],
    backgroundColor: '#fff',
  },
  row2: { flexDirection: 'row', gap: 12 },

  formErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  formErrorText: { color: PRIMARY[700], fontSize: 12, flex: 1 },

  alertPrefsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: GRAY[800],
    marginTop: 4,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: GRAY[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxTick: { color: '#fff', fontWeight: '800', fontSize: 13 },
  checkboxLabel: { fontSize: 13, color: GRAY[800] },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: GRAY[100],
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY[300],
    backgroundColor: '#fff',
  },
  cancelBtnText: { color: PRIMARY[700], fontWeight: '700', fontSize: 13 },
});
