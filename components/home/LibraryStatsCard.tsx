import { StyleSheet, Text, View } from 'react-native';

import { StatBlock } from '@/components/ui/StatBlock';
import { theme } from '@/constants/theme';
import { formatBytes, formatCount } from '@/utils/formatBytes';

interface LibraryStatsCardProps {
  photoCount: number;
  videoCount: number;
  storageUsedBytes: number;
}

export function LibraryStatsCard({
  photoCount,
  videoCount,
  storageUsedBytes,
}: LibraryStatsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.statsRow}>
        <StatBlock label="Photos" value={formatCount(photoCount)} />
        <View style={styles.divider} />
        <StatBlock label="Videos" value={formatCount(videoCount)} />
      </View>
      <View style={styles.storageRow}>
        <Text style={styles.storageLabel}>Storage used</Text>
        <Text style={styles.storageValue}>{formatBytes(storageUsedBytes)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  divider: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
    width: 1,
  },
  statsRow: {
    flexDirection: 'row',
  },
  storageLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  storageRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
  },
  storageValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
});
