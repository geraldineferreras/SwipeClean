import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlbumGrid } from '@/components/albums/AlbumGrid';
import { theme } from '@/constants/theme';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import type { QuickCleanAlbum } from '@/types/cleanup';

export default function AlbumsScreen() {
  const { albums } = useMediaLibrary();

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>All albums</Text>
        <View style={styles.headerSpacer} />
      </View>

      <AlbumGrid albums={albums} onAlbumPress={handleAlbumPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    minWidth: 56,
    paddingVertical: theme.spacing.xs,
  },
  backButtonText: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  headerSpacer: {
    minWidth: 56,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  title: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
    textAlign: 'center',
  },
});
