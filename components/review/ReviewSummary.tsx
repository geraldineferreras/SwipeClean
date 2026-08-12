import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { formatBytes, formatCount } from '@/utils/formatBytes';

interface ReviewSummaryProps {
  photoCount: number;
  videoCount: number;
  totalBytes: number;
}

function StatColumn({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statValueSlot}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          numberOfLines={1}
          style={styles.statValue}
        >
          {value}
        </Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ReviewSummary({
  photoCount,
  videoCount,
  totalBytes,
}: ReviewSummaryProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Selected for deletion</Text>
      <View style={styles.statsRow}>
        <StatColumn label="Photos" value={formatCount(photoCount)} />
        <View style={styles.divider} />
        <StatColumn label="Videos" value={formatCount(videoCount)} />
        <View style={styles.divider} />
        <StatColumn label="To free" value={formatBytes(totalBytes)} />
      </View>
    </View>
  );
}

const STAT_VALUE_HEIGHT = 28;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  divider: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.border,
    width: 1,
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.label,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    includeFontPadding: false,
    textAlign: 'center',
    width: '100%',
  },
  statValueSlot: {
    alignItems: 'center',
    height: STAT_VALUE_HEIGHT,
    justifyContent: 'center',
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
});
