import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenScrollView } from '@/components/layout/ScreenScrollView';
import { SavingsSparkline } from '@/components/home/SavingsSparkline';
import { StorageOverviewCard } from '@/components/insights/StorageOverviewCard';
import { StorageSpaceRow } from '@/components/insights/StorageSpaceRow';
import {
  INSIGHTS_RECOVERED_BYTES,
  INSIGHTS_SESSION_COUNT,
  INSIGHTS_SPACE_ROWS,
} from '@/constants/insightsData';
import { mockLibrarySummary } from '@/constants/mockLibraryStats';
import { SETTINGS_ROUTE, STORAGE_BREAKDOWN_ROUTE } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes, formatCount } from '@/utils/formatBytes';

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
                  {formatBytes(INSIGHTS_RECOVERED_BYTES)}
                </Text>
                <Text style={styles.recoveredMeta}>From {INSIGHTS_SESSION_COUNT} cleanup sessions</Text>
              </View>
            </View>
            <View style={styles.sparklineWrap}>
              <SavingsSparkline height={scale(44)} width={scale(76)} />
            </View>
          </View>
          <Text style={styles.recoveredDelta}>↑ +{formatBytes(INSIGHTS_RECOVERED_BYTES)} vs last 7 days</Text>
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
              {INSIGHTS_SPACE_ROWS.map((row) => (
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
