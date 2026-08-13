import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes, formatCount } from '@/utils/formatBytes';

interface TrashSummaryCardProps {
  daysLeft: number;
  itemCount: number;
  totalBytes: number;
}

export function TrashSummaryCard({ daysLeft, itemCount, totalBytes }: TrashSummaryCardProps) {
  const { font, heroValueSize, isCompact, scale } = useResponsiveLayout();
  const ringSize = scale(isCompact ? 70 : 78);
  const innerSize = scale(isCompact ? 52 : 58);
  const progress = Math.min(itemCount / 40, 1);
  const sizeLabel = formatBytes(totalBytes).replace('\u00A0', ' ');

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.ringWrap, { height: ringSize, width: ringSize }]}>
          <View
            style={[
              styles.ringTrack,
              { borderRadius: ringSize / 2, height: ringSize, width: ringSize },
            ]}
          />
          <View
            style={[
              styles.ringFill,
              {
                borderRadius: ringSize / 2,
                height: ringSize,
                transform: [{ rotate: `${progress * 360 - 90}deg` }],
                width: ringSize,
              },
            ]}
          />
          <View style={[styles.ringInner, { height: innerSize, width: innerSize }]}>
            <Ionicons color={theme.colors.delete} name="trash-outline" size={scale(26)} />
          </View>
        </View>

        <View style={styles.statsColumn}>
          <View style={styles.sizeHeaderRow}>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              style={[styles.sizeValue, { fontSize: heroValueSize }]}
            >
              {sizeLabel}
            </Text>

            <View style={styles.daysBadge}>
              <Ionicons color={theme.colors.delete} name="time-outline" size={14} />
              <Text numberOfLines={1} style={styles.daysBadgeText}>
                {daysLeft} days left
              </Text>
            </View>
          </View>

          <Text style={styles.countLabel}>{formatCount(itemCount)} items</Text>
          <Text style={[styles.expiryText, { fontSize: font(13) }]}>
            Will be permanently deleted in{' '}
            <Text style={styles.expiryHighlight}>{daysLeft} days</Text>
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(progress * 100, 8)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  countLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '500',
    marginTop: 2,
  },
  daysBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#FECDD3',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  daysBadgeText: {
    color: theme.colors.delete,
    fontSize: 10,
    fontWeight: '700',
  },
  expiryHighlight: {
    color: theme.colors.delete,
    fontWeight: '700',
  },
  expiryText: {
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginTop: theme.spacing.xs,
  },
  progressFill: {
    backgroundColor: theme.colors.delete,
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  progressTrack: {
    backgroundColor: '#FECDD3',
    borderRadius: theme.radius.pill,
    height: 6,
    overflow: 'hidden',
  },
  ringFill: {
    borderColor: theme.colors.delete,
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.delete,
    borderWidth: 6,
    position: 'absolute',
  },
  ringInner: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    justifyContent: 'center',
  },
  ringTrack: {
    borderColor: '#FECDD3',
    borderWidth: 6,
    position: 'absolute',
  },
  ringWrap: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  sizeHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sizeValue: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontWeight: '800',
    letterSpacing: -0.5,
    minWidth: 0,
  },
  statsColumn: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: theme.spacing.sm,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
