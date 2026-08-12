import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlbumsSection } from '@/components/home/AlbumsSection';
import { GreetingHeader } from '@/components/home/GreetingHeader';
import { LibraryStatsCard } from '@/components/home/LibraryStatsCard';
import { PotentialSavingsBanner } from '@/components/home/PotentialSavingsBanner';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { mockLibrarySummary } from '@/constants/mockLibraryStats';
import { theme } from '@/constants/theme';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import type { QuickCleanAlbum } from '@/types/cleanup';

export default function HomeScreen() {
  const { summary, isLoading, isSupported, isDemoMode, albums, refresh } =
    useMediaLibrary();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const displaySummary = summary ?? mockLibrarySummary;

  const handleAlbumPress = useCallback((album: QuickCleanAlbum) => {
    router.push({
      pathname: '/clean',
      params: {
        albumId: album.id,
        albumTitle: album.label,
      },
    });
  }, []);

  const handleViewAllAlbums = useCallback(() => {
    router.push('/albums');
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GreetingHeader />

        {isDemoMode ? (
          <View style={styles.demoBanner}>
            <Text style={styles.demoBannerTitle}>Demo mode</Text>
            <Text style={styles.demoBannerText}>
              Sample photos and stats for now. Real camera roll support comes later.
            </Text>
          </View>
        ) : null}

        {isLoading && isSupported && !isDemoMode ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.accent} />
            <Text style={styles.loadingText}>Reading your library…</Text>
          </View>
        ) : null}

        <LibraryStatsCard
          photoCount={displaySummary.photoCount}
          storageUsedBytes={displaySummary.storageUsedBytes}
          videoCount={displaySummary.videoCount}
        />

        <PrimaryButton label="Start Cleaning" onPress={() => router.push('/clean')} />

        <AlbumsSection
          albums={albums}
          onAlbumPress={handleAlbumPress}
          onViewAllPress={handleViewAllAlbums}
        />

        <PotentialSavingsBanner
          potentialSavingsBytes={displaySummary.potentialSavingsBytes}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  demoBanner: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: '#BFDBFE',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  demoBannerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    lineHeight: 20,
  },
  demoBannerTitle: {
    color: theme.colors.accent,
    fontSize: theme.typography.label,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
