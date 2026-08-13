import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenScrollView } from '@/components/layout/ScreenScrollView';
import { SavingsSparkline } from '@/components/home/SavingsSparkline';
import { StorageOverviewCard } from '@/components/insights/StorageOverviewCard';
import { StorageSpaceRow } from '@/components/insights/StorageSpaceRow';
import { SETTINGS_ROUTE, STORAGE_BREAKDOWN_ROUTE } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useTrash } from '@/contexts/TrashContext';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatMediaDate } from '@/utils/formatDate';
import { formatBytes, formatCount } from '@/utils/formatBytes';
import { INSIGHTS_SEGMENT_COLORS, buildInsightsSpaceRows } from '@/utils/insightsSummary';
import { formatLibraryAge } from '@/utils/libraryInsights';

export default function InsightsTabScreen() {
  const {
    font,
    heroValueSize,
    isTablet,
    scale,
    screenTitleSize,
    settingsButtonSize,
    statTileWidth,
  } = useResponsiveLayout();
  const { summary, isLoading, isDemoMode } = useMediaLibrary();
  const { items: trashItems } = useTrash();
  if (!summary && !isDemoMode) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScreenScrollView innerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { fontSize: screenTitleSize }]}>Insights</Text>
              <Text style={styles.subtitle}>Understand your library and free up more space.</Text>
            </View>
          </View>
          <View style={styles.loadingRow}>
            <Text style={styles.loadingText}>
              {isLoading ? 'Loading your library…' : 'Photo access needed for insights.'}
            </Text>
          </View>
        </ScreenScrollView>
      </SafeAreaView>
    );
  }

  const displaySummary = summary!;
  const spaceRows = buildInsightsSpaceRows(displaySummary);
  const screenshotCount = displaySummary.quickClean.screenshots;
  const screenshotBytes = displaySummary.quickCleanBytes.screenshots;
  const recoverableBytes = displaySummary.potentialSavingsBytes;
  const recoveredBytes = trashItems.reduce((sum, item) => sum + item.fileSizeBytes, 0);
  const photoSubtitle = formatBytes(displaySummary.photoStorageBytes);
  const videoSubtitle = formatBytes(displaySummary.videoStorageBytes);
  const oldestMediaLabel = formatLibraryAge(displaySummary.oldestMediaTimestamp);
  const oldestMediaSubtitle =
    displaySummary.oldestMediaTimestamp === null
      ? 'Scanning library'
      : formatMediaDate(displaySummary.oldestMediaTimestamp);
  const highestResolutionLabel =
    displaySummary.highestResolutionMegapixels > 0
      ? `${Math.round(displaySummary.highestResolutionMegapixels)} MP`
      : '—';
  const highestResolutionSubtitle =
    displaySummary.highestResolutionPhotoCount > 0
      ? `${formatCount(displaySummary.highestResolutionPhotoCount)} photo${
          displaySummary.highestResolutionPhotoCount === 1 ? '' : 's'
        }`
      : 'No photos scanned';

  const donutSize = scale(isTablet ? 120 : 112);
  const donutInnerSize = scale(isTablet ? 96 : 88);
  const miniDonutSize = scale(72);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScreenScrollView innerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { fontSize: screenTitleSize }]}>Insights</Text>
            <Text style={styles.subtitle}>Understand your library and free up more space.</Text>
          </View>
          <Pressable
            onPress={() => router.push(SETTINGS_ROUTE)}
            style={[
              styles.settingsButton,
              { height: settingsButtonSize, width: settingsButtonSize },
            ]}
          >
            <Ionicons color={theme.colors.textSecondary} name="settings-outline" size={22} />
          </Pressable>
        </View>

        <StorageOverviewCard
          donutInnerSize={donutInnerSize}
          donutSize={donutSize}
          font={font}
          isTablet={isTablet}
          summary={displaySummary}
        />

        <View style={styles.recoveredCard}>
          <View style={styles.recoveredTop}>
            <View style={styles.recoveredLeft}>
              <View style={styles.recoveredIcon}>
                <Ionicons color={theme.colors.savings} name="sparkles" size={20} />
              </View>
              <View style={styles.recoveredText}>
                <Text style={styles.recoveredLabel}>Total Space Recovered</Text>
                <Text style={[styles.recoveredValue, { fontSize: heroValueSize }]}>
                  {formatBytes(recoveredBytes)}
                </Text>
                <Text style={styles.recoveredMeta}>
                  {trashItems.length === 0
                    ? 'No items moved to trash yet'
                    : `${formatCount(trashItems.length)} item${
                        trashItems.length === 1 ? '' : 's'
                      } in trash`}
                </Text>
              </View>
            </View>
            {recoveredBytes > 0 ? (
              <View style={styles.sparklineWrap}>
                <SavingsSparkline height={scale(44)} width={scale(76)} />
              </View>
            ) : null}
          </View>
          {recoveredBytes > 0 ? (
            <Text style={styles.recoveredDelta}>
              {formatBytes(recoverableBytes)} more recoverable from quick clean
            </Text>
          ) : (
            <Text style={styles.recoveredDeltaMuted}>
              {recoverableBytes > 0
                ? `${formatBytes(recoverableBytes)} recoverable from quick clean`
                : 'Start cleaning to recover space'}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>What&apos;s taking up space?</Text>
            <Pressable
              hitSlop={8}
              onPress={() => router.push(STORAGE_BREAKDOWN_ROUTE)}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
            >
              <Text style={styles.cardLink}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.spaceLayout}>
            <View
              style={[
                styles.miniDonut,
                { borderRadius: miniDonutSize / 2, height: miniDonutSize, width: miniDonutSize },
              ]}
            >
              <Ionicons color={theme.colors.accent} name="folder-open-outline" size={scale(24)} />
            </View>

            <View style={styles.spaceList}>
              {spaceRows.map((row) => (
                <StorageSpaceRow
                  bytes={row.bytes}
                  color={row.color}
                  icon={row.icon}
                  key={row.label}
                  label={row.label}
                  percent={row.percent}
                  softColor={row.softColor}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatTile
            color={INSIGHTS_SEGMENT_COLORS.photos.color}
            icon="image-outline"
            softColor={INSIGHTS_SEGMENT_COLORS.photos.softColor}
            subtitle={photoSubtitle}
            title={formatCount(displaySummary.photoCount)}
            valueLabel="Photos"
            width={statTileWidth}
          />
          <StatTile
            color={INSIGHTS_SEGMENT_COLORS.videos.color}
            icon="videocam-outline"
            softColor={INSIGHTS_SEGMENT_COLORS.videos.softColor}
            subtitle={videoSubtitle}
            title={formatCount(displaySummary.videoCount)}
            valueLabel="Videos"
            width={statTileWidth}
          />
          <StatTile
            color={theme.colors.categoryOrange}
            icon="calendar-outline"
            softColor={theme.colors.categoryOrangeSoft}
            subtitle={oldestMediaSubtitle}
            title={oldestMediaLabel}
            valueLabel="Oldest media"
            width={statTileWidth}
          />
          <StatTile
            color={theme.colors.keep}
            icon="camera-outline"
            softColor={theme.colors.keepSoft}
            subtitle={highestResolutionSubtitle}
            title={highestResolutionLabel}
            valueLabel="Highest resolution"
            width={statTileWidth}
          />
        </View>

        <View style={styles.tipCard}>
          <View style={[styles.tipIcon, { backgroundColor: theme.colors.categoryPurpleSoft }]}>
            <Ionicons color={theme.colors.categoryPurple} name="bulb-outline" size={20} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              You have {formatCount(screenshotCount)} screenshots
            </Text>
            <Text style={styles.tipBody}>
              Screenshots usually aren&apos;t memories. Review and clean them to free up{' '}
              {formatBytes(screenshotBytes)}.
            </Text>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/clean', params: { category: 'screenshots' } })}
            style={styles.tipAction}
          >
            <Text style={styles.tipActionText}>Review Screenshots</Text>
          </Pressable>
        </View>
      </ScreenScrollView>
    </SafeAreaView>
  );
}

function StatTile({
  color,
  icon,
  softColor,
  subtitle,
  title,
  valueLabel,
  width,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  softColor: string;
  subtitle: string;
  title: string;
  valueLabel: string;
  width: number;
}) {
  return (
    <View style={[styles.statTile, { width }]}>
      <View style={[styles.statIcon, { backgroundColor: softColor }]}>
        <Ionicons color={color} name={icon} size={18} />
      </View>
      <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={[styles.statValue, { color }]}>
        {title}
      </Text>
      <Text numberOfLines={1} style={styles.statLabel}>
        {valueLabel}
      </Text>
      <Text numberOfLines={1} style={[styles.statSub, { color }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
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
  content: {
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  linkButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  miniDonut: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accentRing,
    borderWidth: 8,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  recoveredCard: {
    backgroundColor: theme.colors.savingsSoft,
    borderColor: theme.colors.savingsBorder,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  recoveredDelta: {
    color: theme.colors.savings,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  recoveredDeltaMuted: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  loadingRow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    textAlign: 'center',
  },
  recoveredIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  recoveredLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  recoveredLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    minWidth: 0,
  },
  recoveredText: {
    flex: 1,
    minWidth: 0,
  },
  recoveredTop: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recoveredMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  recoveredValue: {
    color: theme.colors.savings,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexShrink: 0,
    justifyContent: 'center',
  },
  sparklineWrap: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  spaceLayout: {
    gap: theme.spacing.sm,
  },
  spaceList: {
    gap: theme.spacing.sm,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  statSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  statTile: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 4,
    padding: theme.spacing.md,
  },
  statValue: {
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  tipAction: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.categoryPurpleSoft,
    borderRadius: theme.radius.pill,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  tipActionText: {
    color: theme.colors.categoryPurple,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  tipBody: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    lineHeight: 18,
    marginTop: 4,
  },
  tipCard: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
  tipContent: {
    marginTop: theme.spacing.sm,
  },
  tipIcon: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  tipTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
