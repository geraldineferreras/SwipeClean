import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenScrollView } from '@/components/layout/ScreenScrollView';
import {
  INSIGHTS_RECOVERED_BYTES,
  INSIGHTS_SESSION_COUNT,
  INSIGHTS_SPACE_ROWS,
  INSIGHTS_STORAGE_SEGMENTS,
} from '@/constants/insightsData';
import { mockLibrarySummary } from '@/constants/mockLibraryStats';
import { SETTINGS_ROUTE } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes, formatCount } from '@/utils/formatBytes';

const SPARKLINE = [10, 14, 12, 18, 16, 22, 20, 28];

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

  const donutSize = scale(isTablet ? 120 : 112);
  const donutInnerSize = scale(isTablet ? 96 : 88);
  const miniDonutSize = scale(72);

  const availableBytes =
    mockLibrarySummary.totalStorageBytes - mockLibrarySummary.storageUsedBytes;
  const availablePercent = Math.round(
    (availableBytes / mockLibrarySummary.totalStorageBytes) * 100,
  );

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

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Storage Overview</Text>
            <Text style={styles.cardLink}>View Details</Text>
          </View>

          <View style={[styles.storageRow, isTablet && styles.storageRowTablet]}>
            <View style={[styles.donutWrap, { height: donutSize, width: donutSize }]}>
              <View
                style={[
                  styles.donutTrack,
                  { borderRadius: donutSize / 2, height: donutSize, width: donutSize },
                ]}
              />
              <View
                style={[
                  styles.donutInner,
                  { borderRadius: donutInnerSize / 2, height: donutInnerSize, width: donutInnerSize },
                ]}
              >
                <Text style={[styles.donutValue, { fontSize: font(13) }]}>
                  {formatBytes(mockLibrarySummary.storageUsedBytes)}
                </Text>
                <Text style={styles.donutCaption}>
                  used of {formatBytes(mockLibrarySummary.totalStorageBytes)}
                </Text>
              </View>
            </View>

            <View style={styles.legendColumn}>
              {INSIGHTS_STORAGE_SEGMENTS.map((segment) => (
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
            <Text style={styles.availableText}>{formatBytes(availableBytes)} available</Text>
            <View style={styles.availableTrack}>
              <View style={[styles.availableFill, { width: `${availablePercent}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.recoveredCard}>
          <View style={styles.recoveredTop}>
            <View style={styles.recoveredLeft}>
              <View style={styles.recoveredIcon}>
                <Ionicons color={theme.colors.savings} name="sparkles" size={20} />
              </View>
              <View style={styles.recoveredText}>
                <Text style={styles.recoveredLabel}>Total Space Recovered</Text>
                <Text style={[styles.recoveredValue, { fontSize: heroValueSize }]}>
                  {formatBytes(INSIGHTS_RECOVERED_BYTES)}
                </Text>
                <Text style={styles.recoveredMeta}>From {INSIGHTS_SESSION_COUNT} cleanup sessions</Text>
              </View>
            </View>
            <View style={styles.sparkline}>
              {SPARKLINE.map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.sparkBar,
                    {
                      backgroundColor: index >= SPARKLINE.length - 2 ? theme.colors.savings : '#86EFAC',
                      height,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
          <Text style={styles.recoveredDelta}>↑ +{formatBytes(INSIGHTS_RECOVERED_BYTES)} vs last 7 days</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>What&apos;s taking up space?</Text>
            <Text style={styles.cardLink}>View All</Text>
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
              {INSIGHTS_SPACE_ROWS.map((row) => (
                <View key={row.label} style={styles.spaceRow}>
                  <View style={[styles.spaceIcon, { backgroundColor: row.softColor }]}>
                    <Ionicons color={row.color} name={row.icon} size={16} />
                  </View>
                  <View style={styles.spaceContent}>
                    <View style={styles.spaceTopRow}>
                      <Text numberOfLines={1} style={styles.spaceLabel}>
                        {row.label}
                      </Text>
                      <Text style={styles.spaceMeta}>
                        {formatBytes(row.bytes)} · {row.percent}%
                      </Text>
                    </View>
                    <View style={styles.spaceTrack}>
                      <View
                        style={[styles.spaceFill, { backgroundColor: row.color, width: `${row.percent}%` }]}
                      />
                    </View>
                  </View>
                  <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={16} />
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatTile
            color={theme.colors.accent}
            icon="image-outline"
            softColor={theme.colors.accentSoft}
            subtitle="+142 this week"
            title={formatCount(mockLibrarySummary.photoCount)}
            valueLabel="Photos"
            width={statTileWidth}
          />
          <StatTile
            color={theme.colors.categoryPurple}
            icon="videocam-outline"
            softColor={theme.colors.categoryPurpleSoft}
            subtitle="+8 this week"
            title={formatCount(mockLibrarySummary.videoCount)}
            valueLabel="Videos"
            width={statTileWidth}
          />
          <StatTile
            color={theme.colors.categoryOrange}
            icon="calendar-outline"
            softColor={theme.colors.categoryOrangeSoft}
            subtitle="Jul 23, 2021"
            title="2.6 yrs"
            valueLabel="Oldest media"
            width={statTileWidth}
          />
          <StatTile
            color={theme.colors.keep}
            icon="camera-outline"
            softColor={theme.colors.keepSoft}
            subtitle="5 photos"
            title="108 MP"
            valueLabel="Highest resolution"
            width={statTileWidth}
          />
        </View>

        <View style={styles.tipCard}>
          <View style={[styles.tipIcon, { backgroundColor: theme.colors.categoryPurpleSoft }]}>
            <Ionicons color={theme.colors.categoryPurple} name="bulb-outline" size={20} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>You have 487 screenshots</Text>
            <Text style={styles.tipBody}>
              Screenshots usually aren&apos;t memories. Review and clean them to free up 1.2 GB.
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
  donutCaption: {
    color: theme.colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  donutInner: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  donutTrack: {
    borderColor: theme.colors.accentRing,
    borderWidth: 10,
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
  spaceFill: {
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  spaceIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  spaceLabel: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    minWidth: 0,
  },
  spaceContent: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  spaceLayout: {
    gap: theme.spacing.sm,
  },
  spaceList: {
    gap: theme.spacing.sm,
  },
  spaceMeta: {
    color: theme.colors.textMuted,
    flexShrink: 0,
    fontSize: 10,
    fontWeight: '600',
  },
  spaceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  spaceTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  spaceTrack: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    height: 5,
    overflow: 'hidden',
  },
  sparkBar: {
    borderRadius: 4,
    width: 5,
  },
  sparkline: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 3,
    height: 32,
    justifyContent: 'flex-end',
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
  storageRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  storageRowTablet: {
    alignItems: 'flex-start',
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
