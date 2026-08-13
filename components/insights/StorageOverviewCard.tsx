import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { LargestFileCard } from '@/components/insights/LargestFileCard';
import { SegmentedStorageDonut } from '@/components/insights/SegmentedStorageDonut';
import {
  INSIGHTS_LARGEST_FILES_PREVIEW_COUNT,
} from '@/constants/insightsData';
import { LARGEST_FILES_ROUTE } from '@/constants/routes';
import type { LibrarySummary } from '@/types/cleanup';
import { theme } from '@/constants/theme';
import { formatBytes, formatCount, formatDeviceStorage, formatMediaLibraryBytes } from '@/utils/formatBytes';
import { buildInsightsCategoryDetailRows, buildStorageOverviewSegments } from '@/utils/insightsSummary';

interface StorageOverviewCardProps {
  donutInnerSize: number;
  donutSize: number;
  font: (size: number) => number;
  isTablet: boolean;
  summary: LibrarySummary;
}

const DETAILS_MAX_HEIGHT = 920;

export function StorageOverviewCard({
  donutInnerSize,
  donutSize,
  font,
  isTablet,
  summary,
}: StorageOverviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPercent, setShowPercent] = useState(false);
  const expansion = useSharedValue(0);

  const availableBytes = summary.deviceFreeBytes;
  const freePercent = Math.round(
    (availableBytes / Math.max(summary.totalStorageBytes, 1)) * 100,
  );
  const storageSegments = buildStorageOverviewSegments(summary);

  const toggleDetails = useCallback(() => {
    const next = !isExpanded;
    setIsExpanded(next);
    expansion.value = withTiming(next ? 1 : 0, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [expansion, isExpanded]);

  const closeDetails = useCallback(() => {
    setIsExpanded(false);
    expansion.value = withTiming(0, {
      duration: 280,
      easing: Easing.in(Easing.cubic),
    });
  }, [expansion]);

  const handleViewAllFiles = useCallback(() => {
    router.push(LARGEST_FILES_ROUTE);
  }, []);

  const previewFiles = summary.largestFiles.slice(0, INSIGHTS_LARGEST_FILES_PREVIEW_COUNT);
  const categoryRows = buildInsightsCategoryDetailRows(summary);

  const detailsStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(expansion.value, [0, 1], [0, DETAILS_MAX_HEIGHT]),
    opacity: interpolate(expansion.value, [0, 0.2, 1], [0, 1, 1]),
    overflow: 'hidden',
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${expansion.value * 180}deg` }],
  }));

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Storage Overview</Text>
        <Pressable
          hitSlop={8}
          onPress={toggleDetails}
          style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
        >
          <Text style={styles.cardLink}>{isExpanded ? 'Hide Details' : 'View Details'}</Text>
          <Animated.View style={chevronStyle}>
            <Ionicons color={theme.colors.accent} name="chevron-down" size={14} />
          </Animated.View>
        </Pressable>
      </View>

      <View style={[styles.storageRow, isTablet && styles.storageRowTablet]}>
        <View style={[styles.donutWrap, { height: donutSize, width: donutSize }]}>
          <SegmentedStorageDonut segments={storageSegments} size={donutSize} strokeWidth={10} />
          <View
            style={[
              styles.donutInner,
              { borderRadius: donutInnerSize / 2, height: donutInnerSize, width: donutInnerSize },
            ]}
          >
            <Text style={[styles.donutValue, { fontSize: font(13) }]}>
              {formatDeviceStorage(summary.deviceUsedBytes)}
            </Text>
            <Text style={styles.donutCaption}>
              used of {formatDeviceStorage(summary.totalStorageBytes)}
            </Text>
            <Text style={styles.donutMediaCaption}>
              {formatMediaLibraryBytes(summary)} photos & videos
            </Text>
          </View>
        </View>

        <View style={styles.legendColumn}>
          {storageSegments.map((segment) => (
            <View key={segment.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <View style={styles.legendTextBlock}>
                <Text numberOfLines={1} style={styles.legendLabel}>
                  {segment.label}
                </Text>
                <Text style={styles.legendValue}>
                  {formatBytes(segment.bytes)} · {segment.percent}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.availableRow}>
        <Ionicons color={theme.colors.textMuted} name="phone-portrait-outline" size={16} />
        <Text style={styles.availableText}>{formatDeviceStorage(availableBytes)} available</Text>
        <View style={styles.availableTrack}>
          <View style={[styles.availableFill, { width: `${freePercent}%` }]} />
        </View>
      </View>

      <Animated.View style={detailsStyle}>
        <View style={styles.detailsContent}>
          <View style={styles.detailsDivider} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>By Category</Text>
            <View style={styles.unitToggle}>
              <Pressable
                onPress={() => setShowPercent(false)}
                style={[styles.unitOption, !showPercent && styles.unitOptionActive]}
              >
                <Text style={[styles.unitLabel, !showPercent && styles.unitLabelActive]}>GB</Text>
              </Pressable>
              <Text style={styles.unitSeparator}>|</Text>
              <Pressable
                onPress={() => setShowPercent(true)}
                style={[styles.unitOption, showPercent && styles.unitOptionActive]}
              >
                <Text style={[styles.unitLabel, showPercent && styles.unitLabelActive]}>%</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.categoryList}>
            {categoryRows.map((row) => (
              <View key={row.label} style={styles.categoryRow}>
                <View style={[styles.categoryIcon, { backgroundColor: row.softColor }]}>
                  <Ionicons color={row.color} name={row.icon} size={16} />
                </View>
                <View style={styles.categoryContent}>
                  <View style={styles.categoryTopRow}>
                    <Text numberOfLines={1} style={styles.categoryLabel}>
                      {row.label}
                      {row.count > 0 ? `, ${formatCount(row.count)} items` : ''}
                    </Text>
                    <Text style={styles.categoryMeta}>
                      {showPercent ? `${row.percent}%` : formatBytes(row.bytes)}
                    </Text>
                  </View>
                  <View style={styles.categoryTrack}>
                    <View
                      style={[
                        styles.categoryFill,
                        { backgroundColor: row.color, width: `${row.percent}%` },
                      ]}
                    />
                  </View>
                </View>
                <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={16} />
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Largest Files</Text>
            <Pressable
              hitSlop={8}
              onPress={handleViewAllFiles}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={styles.cardLink}>View All</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.fileRail}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {previewFiles.map((file) => (
              <View key={file.filename} style={styles.fileCard}>
                <LargestFileCard file={file} width={132} />
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={closeDetails}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <Ionicons color={theme.colors.textSecondary} name="chevron-up" size={18} />
            <Text style={styles.closeLabel}>Close</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  availableFill: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  availableRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  availableText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  availableTrack: {
    backgroundColor: '#E5E7EB',
    borderRadius: theme.radius.pill,
    flex: 1,
    height: 6,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: theme.spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  cardLink: {
    color: theme.colors.accent,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  categoryContent: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  categoryFill: {
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  categoryLabel: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    minWidth: 0,
  },
  categoryList: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  categoryMeta: {
    color: theme.colors.textMuted,
    flexShrink: 0,
    fontSize: 10,
    fontWeight: '600',
  },
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  categoryTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  categoryTrack: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    height: 5,
    overflow: 'hidden',
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  closeLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  detailsContent: {
    paddingBottom: theme.spacing.xs,
  },
  detailsDivider: {
    backgroundColor: theme.colors.border,
    height: 1,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  donutCaption: {
    color: theme.colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  donutMediaCaption: {
    color: theme.colors.textMuted,
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  donutInner: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
    position: 'absolute',
  },
  donutValue: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    textAlign: 'center',
  },
  donutWrap: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
    position: 'relative',
  },
  fileCard: {
    width: 132,
  },
  fileRail: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  legendColumn: {
    flex: 1,
    gap: theme.spacing.sm,
    minWidth: 0,
    paddingLeft: theme.spacing.md,
  },
  legendDot: {
    borderRadius: theme.radius.pill,
    height: 8,
    width: 8,
  },
  legendLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  legendRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  legendTextBlock: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  legendValue: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  linkButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  pressed: {
    opacity: 0.75,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  storageRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  storageRowTablet: {
    alignItems: 'flex-start',
  },
  unitLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  unitLabelActive: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  unitOption: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  unitOptionActive: {},
  unitSeparator: {
    color: theme.colors.border,
    fontSize: theme.typography.caption,
  },
  unitToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
});
