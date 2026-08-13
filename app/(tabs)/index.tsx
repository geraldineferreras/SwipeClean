import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenScrollView } from '@/components/layout/ScreenScrollView';
import { GreetingHeader } from '@/components/home/GreetingHeader';
import { HomeQuickCleanSection } from '@/components/home/HomeQuickCleanSection';
import { PotentialSavingsCard } from '@/components/home/PotentialSavingsCard';
import { StartCleaningButton } from '@/components/home/StartCleaningButton';
import { StorageOverviewCard } from '@/components/home/StorageOverviewCard';
import { mockLibrarySummary } from '@/constants/mockLibraryStats';
import { theme } from '@/constants/theme';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';

export default function HomeScreen() {
  const { summary, isLoading, isSupported, isDemoMode } = useMediaLibrary();

  const displaySummary = summary ?? mockLibrarySummary;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScreenScrollView showsVerticalScrollIndicator={false}>
        <GreetingHeader />

        {isDemoMode ? (
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerText}>Demo mode — sample stats and photos</Text>
          </View>
        ) : null}

        {isLoading && isSupported && !isDemoMode ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.accent} />
            <Text style={styles.loadingText}>Loading your library…</Text>
          </View>
        ) : null}

        <StorageOverviewCard
          deviceUsedBytes={displaySummary.deviceUsedBytes}
          measuredAssetCount={displaySummary.measuredAssetCount}
          mediaLibraryBytes={displaySummary.storageUsedBytes}
          otherCount={displaySummary.otherCount}
          photoCount={displaySummary.photoCount}
          scannedAssetCount={displaySummary.scannedAssetCount}
          totalStorageBytes={displaySummary.totalStorageBytes}
          videoCount={displaySummary.videoCount}
        />

        <PotentialSavingsCard
          potentialSavingsBytes={displaySummary.potentialSavingsBytes}
        />

        <StartCleaningButton onPress={() => router.push('/clean')} />

        <HomeQuickCleanSection summary={displaySummary} />
      </ScreenScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  demoBanner: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  demoBannerText: {
    color: theme.colors.accent,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
});
