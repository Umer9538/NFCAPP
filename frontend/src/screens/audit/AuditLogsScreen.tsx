/**
 * Audit Logs — mirrors the web's /dashboard/audit-logs page.
 * GET /api/audit-logs?page=&pageSize=&type=&status=&startDate=&endDate=&search=
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Calendar,
  AlertCircle,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  Lock,
} from 'lucide-react-native';

import { PRIMARY, GRAY } from '@/constants/colors';
import { auditApi } from '@/api/audit';
import type {
  AuditLog,
  AuditLogStatus,
  AuditLogType,
} from '@/types/audit';

const PAGE_SIZE = 15;
const PRESETS = ['Today', 'Last 7 Days', 'Last 30 Days'] as const;
const LOCKED_PRESETS = ['Last 90 Days', 'Last 6 Months', 'Last Year'] as const;

const TYPE_OPTIONS: { value: AuditLogType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'login', label: 'Login' },
  { value: 'profile_access', label: 'Profile Access' },
  { value: 'profile_update', label: 'Update' },
  { value: 'bracelet_scan', label: 'Bracelet Scan' },
  { value: 'qr_scan', label: 'QR Scan' },
  { value: 'password_change', label: 'Password' },
  { value: 'settings_change', label: 'Settings' },
  { value: 'emergency_access', label: 'Emergency' },
];
const STATUS_OPTIONS: { value: AuditLogStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'failure', label: 'Failure' },
  { value: 'warning', label: 'Warning' },
];

export default function AuditLogsScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<AuditLogType | 'all'>('all');
  const [status, setStatus] = useState<AuditLogStatus | 'all'>('all');
  const [preset, setPreset] = useState<(typeof PRESETS)[number] | null>(
    'Last 30 Days',
  );

  const { startDate, endDate } = useMemo(() => {
    if (!preset) return { startDate: undefined, endDate: undefined };
    const end = new Date();
    const start = new Date();
    if (preset === 'Today') start.setHours(0, 0, 0, 0);
    else if (preset === 'Last 7 Days') start.setDate(end.getDate() - 7);
    else if (preset === 'Last 30 Days') start.setDate(end.getDate() - 30);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [preset]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['auditLogs', page, type, status, search, startDate, endDate],
    queryFn: () =>
      auditApi.getAuditLogs(page, PAGE_SIZE, {
        type,
        status,
        search: search.trim() || undefined,
        startDate,
        endDate,
      }),
  });
  const logs = data?.logs ?? [];
  const stats = data?.stats;
  const pagination = data?.pagination ?? {
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Audit Logs</Text>
            <Text style={styles.headerSub}>
              Track all access to your medical profile for security and
              compliance.
            </Text>
          </View>
          <View style={styles.retentionBadge}>
            <Lock size={11} color="#a16207" />
            <Text style={styles.retentionText}>7 days retention</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <StatTile
            value={stats?.totalAccesses ?? 0}
            label="Total Accesses"
            Icon={FileText}
            tint={{ bg: '#dbeafe', fg: '#2563eb' }}
          />
          <StatTile
            value={stats?.thisMonth ?? 0}
            label="This Month"
            Icon={Calendar}
            tint={{ bg: '#fee2e2', fg: PRIMARY[600] }}
          />
          <StatTile
            value={stats?.failedAttempts ?? 0}
            label="Failed Attempts"
            Icon={AlertCircle}
            tint={{ bg: '#fee2e2', fg: PRIMARY[600] }}
          />
          <StatTile
            value={stats?.uniqueLocations ?? 0}
            label="Locations"
            Icon={MapPin}
            tint={{ bg: '#f3e8ff', fg: '#9333ea' }}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.filterRow}>
            <View style={styles.searchBox}>
              <Search size={14} color={GRAY[400]} />
              <TextInput
                value={search}
                onChangeText={(t) => {
                  setSearch(t);
                  setPage(1);
                }}
                placeholder="Search by action, location, IP…"
                placeholderTextColor={GRAY[400]}
                style={styles.searchInput}
              />
            </View>
            <Select
              value={type}
              options={TYPE_OPTIONS}
              onChange={(v) => {
                setType(v as AuditLogType | 'all');
                setPage(1);
              }}
            />
            <Select
              value={status}
              options={STATUS_OPTIONS}
              onChange={(v) => {
                setStatus(v as AuditLogStatus | 'all');
                setPage(1);
              }}
            />
          </View>

          <Text style={styles.dateRangeLabel}>Date Range</Text>
          <View style={styles.presetRow}>
            {PRESETS.map((p) => (
              <Pressable
                key={p}
                onPress={() => {
                  setPreset(p);
                  setPage(1);
                }}
                style={[
                  styles.presetChip,
                  preset === p && styles.presetChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.presetText,
                    preset === p && styles.presetTextActive,
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
            {LOCKED_PRESETS.map((p) => (
              <View key={p} style={[styles.presetChip, styles.presetChipLocked]}>
                <Text style={styles.presetTextLocked}>{p}</Text>
                <Lock size={10} color={GRAY[500]} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <View>
              <Text style={styles.cardTitle}>Access History</Text>
              <Text style={styles.cardSubtitle}>
                {pagination.total} total records
              </Text>
            </View>
            <View style={[styles.outlineBtn, { opacity: 0.5 }]}>
              <Download size={14} color={PRIMARY[600]} />
              <Text style={styles.outlineBtnText}>Export CSV</Text>
              <Lock size={11} color={PRIMARY[600]} />
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={PRIMARY[600]} />
            </View>
          ) : logs.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyTitle}>No audit logs found</Text>
              <Text style={styles.emptyHint}>
                Try adjusting your filters or selecting a different date range.
              </Text>
            </View>
          ) : (
            <View>
              {logs.map((log) => (
                <LogRow key={log.id} log={log} />
              ))}
            </View>
          )}

          {pagination.totalPages > 1 && (
            <View style={styles.paginationRow}>
              <Text style={styles.paginationLabel}>
                Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
                {Math.min(page * PAGE_SIZE, pagination.total)} of{' '}
                {pagination.total} logs
              </Text>
              <View style={styles.paginationControls}>
                <Pressable
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  style={[
                    styles.pageBtn,
                    page <= 1 && { opacity: 0.4 },
                  ]}
                >
                  <ChevronUp
                    size={12}
                    color={PRIMARY[600]}
                    style={{ transform: [{ rotate: '-90deg' }] }}
                  />
                  <Text style={styles.pageBtnText}>Previous</Text>
                </Pressable>
                <View style={[styles.pageNumber, styles.pageNumberActive]}>
                  <Text style={styles.pageNumberActiveText}>{page}</Text>
                </View>
                {page < pagination.totalPages && (
                  <View style={styles.pageNumber}>
                    <Text style={styles.pageNumberText}>{page + 1}</Text>
                  </View>
                )}
                <Pressable
                  onPress={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page >= pagination.totalPages || isFetching}
                  style={[
                    styles.pageBtn,
                    page >= pagination.totalPages && { opacity: 0.4 },
                  ]}
                >
                  <Text style={styles.pageBtnText}>Next</Text>
                  <ChevronDown
                    size={12}
                    color={PRIMARY[600]}
                    style={{ transform: [{ rotate: '-90deg' }] }}
                  />
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={styles.privacyFooter}>
          <View style={styles.privacyHeaderRow}>
            <View style={styles.privacyDot}>
              <Lock size={11} color={PRIMARY[600]} />
            </View>
            <Text style={styles.privacyTitle}>Security &amp; Privacy</Text>
          </View>
          <Text style={styles.privacyText}>
            All access to your medical profile is logged and stored securely for
            7 days in compliance with PIPEDA regulations. Upgrade to export your
            audit logs. If you notice any suspicious activity, please contact
            our support team immediately.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function StatTile({
  value,
  label,
  Icon,
  tint,
}: {
  value: number;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  tint: { bg: string; fg: string };
}) {
  return (
    <View style={[styles.statTile, { borderColor: tint.bg }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: tint.fg }]}>{value}</Text>
      </View>
      <View style={[styles.statIcon, { backgroundColor: tint.bg }]}>
        <Icon size={18} color={tint.fg} />
      </View>
    </View>
  );
}

function LogRow({ log }: { log: AuditLog }) {
  const tint = typeTint(log.type);
  const loc = log.location;
  const locationText = loc
    ? [loc.city, loc.region, loc.countryCode].filter(Boolean).join(', ')
    : '—';
  return (
    <View style={styles.logRow}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <View style={styles.logCol}>
          <Text style={styles.logDate}>
            {new Date(log.timestamp || log.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.logTime}>
            {new Date(log.timestamp || log.createdAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </View>
        <View style={[styles.logCol, { flex: 2 }]}>
          <Text style={styles.logAction}>{log.action}</Text>
          {!!log.description && (
            <Text style={styles.logDescription} numberOfLines={1}>
              {log.description}
            </Text>
          )}
        </View>
        <View style={[styles.typeBadge, { backgroundColor: tint.bg }]}>
          <Text style={[styles.typeBadgeText, { color: tint.fg }]}>
            {prettyType(log.type)}
          </Text>
        </View>
      </View>
      <View style={styles.logRowBottom}>
        <Text style={styles.logMeta}>
          <Text style={styles.logMetaLabel}>Accessor: </Text>
          {log.actor.name}
        </Text>
        <Text style={styles.logMeta}>
          <Text style={styles.logMetaLabel}>Location: </Text>
          {locationText}
        </Text>
        {!!log.ipAddress && (
          <Text style={styles.logMeta}>
            <Text style={styles.logMetaLabel}>IP: </Text>
            {log.ipAddress}
          </Text>
        )}
        {!!log.device?.os && (
          <Text style={styles.logMeta}>
            <Text style={styles.logMetaLabel}>Device: </Text>
            {log.device.os}
          </Text>
        )}
      </View>
    </View>
  );
}

function prettyType(t: AuditLogType): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}
function typeTint(t: AuditLogType): { bg: string; fg: string } {
  if (t === 'login' || t === 'logout') return { bg: '#fee2e2', fg: '#b91c1c' };
  if (
    t === 'profile_update' ||
    t === 'settings_change' ||
    t === 'account_update'
  )
    return { bg: '#dcfce7', fg: '#15803d' };
  if (t === 'emergency_access' || t === 'bracelet_scan' || t === 'qr_scan')
    return { bg: '#fef3c7', fg: '#92400e' };
  return { bg: '#dbeafe', fg: '#1d4ed8' };
}

function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? options[0];
  return (
    <View style={{ flexBasis: '48%', flexGrow: 1 }}>
      <Pressable onPress={() => setOpen((s) => !s)} style={styles.selectInput}>
        <Text style={styles.selectText}>{selected.label}</Text>
        <ChevronDown size={14} color={GRAY[500]} />
      </Pressable>
      {open && (
        <View style={styles.dropdown}>
          {options.map((o) => (
            <Pressable
              key={o.value}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
              }}
              style={[
                styles.dropdownItem,
                value === o.value && styles.dropdownItemActive,
              ]}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  value === o.value && styles.dropdownItemTextActive,
                ]}
              >
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GRAY[50] },
  scroll: { padding: 16, gap: 14 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: GRAY[900],
    letterSpacing: -0.5,
  },
  headerSub: { marginTop: 6, fontSize: 13, color: GRAY[600], lineHeight: 18 },
  retentionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  retentionText: { color: '#854d0e', fontSize: 11, fontWeight: '700' },

  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: { fontSize: 11, color: GRAY[600], fontWeight: '600' },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GRAY[100],
    gap: 12,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  searchBox: {
    flexBasis: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: GRAY[300],
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: GRAY[900] },

  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: GRAY[300],
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  selectText: { fontSize: 13, color: GRAY[900] },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: GRAY[200],
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY[100],
  },
  dropdownItemActive: { backgroundColor: PRIMARY[50] },
  dropdownItemText: { fontSize: 13, color: GRAY[800] },
  dropdownItemTextActive: { color: PRIMARY[700], fontWeight: '600' },

  dateRangeLabel: { fontSize: 13, fontWeight: '700', color: GRAY[800], marginTop: 6 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: GRAY[200],
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetChipActive: { backgroundColor: PRIMARY[600], borderColor: PRIMARY[600] },
  presetText: { fontSize: 11, color: GRAY[700], fontWeight: '600' },
  presetTextActive: { color: '#fff' },
  presetChipLocked: { backgroundColor: GRAY[50] },
  presetTextLocked: { fontSize: 11, color: GRAY[500], fontWeight: '600' },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: GRAY[900] },
  cardSubtitle: { fontSize: 11, color: GRAY[500], marginTop: 2 },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY[300],
    backgroundColor: '#fff',
  },
  outlineBtnText: { color: PRIMARY[600], fontSize: 12, fontWeight: '700' },

  loadingBlock: { paddingVertical: 32, alignItems: 'center' },
  emptyBlock: { paddingVertical: 32, alignItems: 'center', gap: 4 },
  emptyTitle: { fontSize: 13, color: GRAY[700], fontWeight: '600' },
  emptyHint: { fontSize: 12, color: GRAY[500] },

  logRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: GRAY[100],
    gap: 6,
  },
  logCol: { flex: 1, gap: 2 },
  logDate: { fontSize: 12, fontWeight: '700', color: GRAY[900] },
  logTime: { fontSize: 11, color: GRAY[500] },
  logAction: { fontSize: 13, fontWeight: '700', color: GRAY[900] },
  logDescription: { fontSize: 11, color: GRAY[600] },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  logRowBottom: { gap: 2 },
  logMeta: { fontSize: 11, color: GRAY[600] },
  logMetaLabel: { fontWeight: '700', color: GRAY[700] },

  paginationRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: GRAY[100],
    gap: 10,
  },
  paginationLabel: { fontSize: 12, color: GRAY[600] },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PRIMARY[300],
  },
  pageBtnText: { color: PRIMARY[600], fontSize: 12, fontWeight: '700' },
  pageNumber: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GRAY[200],
  },
  pageNumberActive: { backgroundColor: PRIMARY[600], borderColor: PRIMARY[600] },
  pageNumberText: { color: GRAY[700], fontWeight: '700', fontSize: 12 },
  pageNumberActiveText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  privacyFooter: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  privacyHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  privacyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTitle: { fontSize: 14, fontWeight: '700', color: GRAY[900] },
  privacyText: { fontSize: 12, color: GRAY[700], lineHeight: 17 },
});
