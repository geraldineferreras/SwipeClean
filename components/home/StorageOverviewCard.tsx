import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes, formatCount, formatDeviceStorage, formatMediaLibraryBytes } from '@/utils/formatBytes';

interface StorageOverviewCardProps {
  photoCount: number;
  videoCount: number;
  otherCount: number;
  mediaLibraryBytes: number;
  measuredAssetCount: number;
  scannedAssetCount: number;
  deviceUsedBytes: number;
  totalStorageBytes: number;
}

function StorageRing({ ratio, size }: { ratio: number; size: number }) {
  const clamped = Math.min(Math.max(ratio, 0), 1);
  const accentDegrees = clamped * 360;
  const innerSize = size - 24;
  const borderWidth = Math.max(6, Math.round(size * 0.076));

  return (
    <View style={[styles.ringOuter, { height: size, width: size }]}>
      <View
        style={[
          styles.ringTrack,
          { borderRadius: size / 2, borderWidth, height: size, width: size },
        ]}
      />
      <View
        style={[
          styles.ringProgress,
          {
            borderBottomColor: accentDegrees > 180 ? theme.colors.accent : 'transparent',
            borderLeftColor: accentDegrees > 270 ? theme.colors.accent : 'transparent',
            borderRadius: size / 2,
            borderRightColor: accentDegrees > 90 ? theme.colors.accent : 'transparent',
            borderTopColor: accentDegrees > 0 ? theme.colors.accent : 'transparent',
            borderWidth,
            height: size,
            transform: [{ rotate: '-90deg' }],
            width: size,
          },
        ]}
      />
      <View style={[styles.ringInner, { height: innerSize, width: innerSize }]}>
        <Ionicons color={theme.colors.accent} name="images-outline" size={Math.round(size * 0.3)} />
      </View>
    </View>
  );
}

export function StorageOverviewCard({
  photoCount,
  videoCount,
  otherCount,
  mediaLibraryBytes,
  measuredAssetCount,
  scannedAssetCount,
  deviceUsedBytes,
  totalStorageBytes,
}: StorageOverviewCardProps) {
  const { font, heroValueSize, isTablet, scale } = useResponsiveLayout();
  const ringSize = scale(isTablet ? 104 : 92);
  const usageRatio =
    totalStorageBytes > 0 ? deviceUsedBytes / totalStorageBytes : 0;
  const usagePercent = Math.round(usageRatio * 100);

  return (
    <View style={styles.card}>
      <View style={[styles.topRow, isTablet && styles.topRowTablet]}>
        <StorageRing ratio={usageRatio} size={ringSize} />

        <View style={styles.summaryColumn}>
          <Text style={[styles.usedValue, { fontSize: heroValueSize }]}>
            {formatDeviceStorage(deviceUsedBytes)}
          </Text>
          <Text style={styles.usedCaption}>
            of {formatDeviceStorage(totalStorageBytes)} used
          </Text>
          <Text style={styles.mediaCaption}>
            {formatMediaLibraryBytes({
              storageUsedBytes: mediaLibraryBytes,
              measuredAssetCount,
              scannedAssetCount,
            })}{' '}
            in photos & videos
          </Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${usagePercent}%` }]} />
          </View>
          <Text style={styles.percentLabel}>{usagePercent}% used</Text>
        </View>
      </View>

      <View style={styles.breakdownRow}>
        <BreakdownItem
          color={theme.colors.accent}
          icon="image-outline"
          label="Photos"
          softColor={theme.colors.accentSoft}
          value={formatCount(photoCount)}
          valueSize={font(18)}
        />
        <BreakdownItem
          color={theme.colors.categoryPurple}
          icon="videocam-outline"
          label="Videos"
          softColor={theme.colors.categoryPurpleSoft}
          value={formatCount(videoCount)}
          valueSize={font(18)}
        />
        <BreakdownItem
          color={theme.colors.keep}
          icon="folder-outline"
          label="Other"
          softColor={theme.colors.keepSoft}
          value={formatCount(otherCount)}
          valueSize={font(18)}
        />
      </View>
    </View>
  );
}

function BreakdownItem({
  color,
  icon,
  label,
  softColor,
  value,
  valueSize,
}: {
  color: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  softColor: string;
  value: string;
  valueSize: number;
}) {
  return (
    <View style={styles.breakdownItem}>
      <View style={[styles.breakdownIconWrap, { backgroundColor: softColor }]}>
        <Ionicons color={color} name={icon} size={18} />
      </View>
      <Text numberOfLines={1} style={[styles.breakdownValue, { color, fontSize: valueSize }]}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.breakdownLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  breakdownIconWrap: {
    alignItems: 'center',
    borderRadius: 12,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  breakdownLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '500',
    textAlign: 'center',
  },
  breakdownRow: {
    borderTopColor: theme.colors.accentRing,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  breakdownValue: {
    fontWeight: '800',
  },
  card: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accentRing,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  percentLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '500',
  },
  progressFill: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  progressTrack: {
    backgroundColor: theme.colors.accentRing,
    borderRadius: theme.radius.pill,
    height: 8,
    marginTop: theme.spacing.sm,
    overflow: 'hidden',
    width: '100%',
  },
  ringInner: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    justifyContent: 'center',
  },
  ringOuter: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  ringProgress: {
    position: 'absolute',
  },
  ringTrack: {
    borderColor: theme.colors.accentRing,
    position: 'absolute',
  },
  summaryColumn: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingLeft: theme.spacing.md,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  topRowTablet: {
    gap: theme.spacing.md,
  },
  usedCaption: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    marginTop: 2,
  },
  mediaCaption: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  usedValue: {
    color: theme.colors.accent,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
