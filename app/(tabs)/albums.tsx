import { router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlbumGrid } from '@/components/albums/AlbumGrid';
import { ScreenFrame } from '@/components/layout/ScreenFrame';
import { theme } from '@/constants/theme';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { QuickCleanAlbum } from '@/types/cleanup';

export default function AlbumsTabScreen() {
  const { albums, isLoading } = useMediaLibrary();
  const { screenTitleSize } = useResponsiveLayout();

  const handleAlbumPress = useCallback((album: QuickCleanAlbum) => {
    router.push({
      pathname: '/clean',
      params: {
        albumId: album.id,
        albumTitle: album.label,
      },
    });
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScreenFrame>
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: screenTitleSize }]}>Albums</Text>
          <Text style={styles.subtitle}>Browse and clean by album</Text>
        </View>

        {isLoading && albums.length === 0 ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.accent} />
            <Text style={styles.loadingText}>Loading albums…</Text>
          </View>
        ) : (
          <AlbumGrid albums={albums} onAlbumPress={handleAlbumPress} />
        )}
      </ScreenFrame>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
