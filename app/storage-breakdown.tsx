import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StorageSpaceRow } from '@/components/insights/StorageSpaceRow';
import { ScreenFrame } from '@/components/layout/ScreenFrame';
import { theme } from '@/constants/theme';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { mockLibrarySummary } from '@/constants/mockLibraryStats';
import { formatBytes, formatDeviceStorage, formatMediaLibraryBytes } from '@/utils/formatBytes';
import { buildInsightsCategoryDetailRows } from '@/utils/insightsSummary';

export default function StorageBreakdownScreen() {
  const { contentPadding, scale, settingsButtonSize } = useResponsiveLayout();
  const { summary } = useMediaLibrary();
  const displaySummary = summary ?? mockLibrarySummary;
  const categoryRows = buildInsightsCategoryDetailRows(displaySummary);
  const miniDonutSize = scale(72);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScreenFrame>
        <View style={styles.shell}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                { height: settingsButtonSize, width: settingsButtonSize },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={22} />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={styles.title}>What&apos;s taking up space?</Text>
              <Text style={styles.subtitle}>
                {formatDeviceStorage(displaySummary.deviceUsedBytes)} used on device ·{' '}
                {formatMediaLibraryBytes(displaySummary)} in photos & videos
              </Text>
            </View>
            <View style={{ width: settingsButtonSize }} />
          </View>

          <ScrollView
            contentContainerStyle={[styles.content, { paddingHorizontal: contentPadding }]}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            <View style={styles.summaryCard}>
              <View
                style={[
                  styles.miniDonut,
                  { borderRadius: miniDonutSize / 2, height: miniDonutSize, width: miniDonutSize },
                ]}
              >
                <Ionicons color={theme.colors.accent} name="folder-open-outline" size={scale(24)} />
              </View>
              <Text style={styles.summaryTitle}>Storage by category</Text>
              <Text style={styles.summaryText}>
                See how photos, videos, and other media types use your device storage.
              </Text>
            </View>

            <View style={styles.listCard}>
              {categoryRows.map((row) => (
                <StorageSpaceRow
                  bytes={row.bytes}
                  color={row.color}
                  count={row.count}
                  icon={row.icon}
                  key={row.label}
                  label={row.label}
                  percent={row.percent}
                  showChevron={false}
                  softColor={row.softColor}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </ScreenFrame>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  content: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
  },
  headerText: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  listCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  miniDonut: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accentRing,
    borderWidth: 8,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  shell: {
    flex: 1,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  summaryText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    lineHeight: 18,
    textAlign: 'center',
  },
  summaryTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    textAlign: 'center',
  },
});
