import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { QuickCleanAlbum } from '@/types/cleanup';
import { formatCount } from '@/utils/formatBytes';

interface AlbumGridProps {
  albums: QuickCleanAlbum[];
  onAlbumPress: (album: QuickCleanAlbum) => void;
}

const NUM_COLUMNS = 2;

export function AlbumGrid({ albums, onAlbumPress }: AlbumGridProps) {
  return (
    <FlatList
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      data={albums}
      keyExtractor={(album) => album.id}
      numColumns={NUM_COLUMNS}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onAlbumPress(item)}
          style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
        >
          <View style={styles.coverFrame}>
            {item.coverUri ? (
              <Image
                contentFit="cover"
                source={{ uri: item.coverUri }}
                style={styles.cover}
                transition={150}
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text style={styles.coverPlaceholderText}>
                  {item.label.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{formatCount(item.count)}</Text>
            </View>
          </View>
          <Text numberOfLines={2} style={styles.title}>
            {item.label}
          </Text>
        </Pressable>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  countBadge: {
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    borderRadius: theme.radius.pill,
    bottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    position: 'absolute',
    right: theme.spacing.sm,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: theme.typography.label,
    fontWeight: '700',
  },
  cover: {
    height: '100%',
    width: '100%',
  },
  coverFrame: {
    aspectRatio: 1,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    width: '100%',
  },
  coverPlaceholder: {
    alignItems: 'center',
    backgroundColor: theme.colors.accentSoft,
    flex: 1,
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    color: theme.colors.accent,
    fontSize: 32,
    fontWeight: '700',
  },
  row: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tile: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  tilePressed: {
    opacity: 0.85,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '600',
    lineHeight: 20,
  },
});
