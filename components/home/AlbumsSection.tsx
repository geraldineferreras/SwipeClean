import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HOME_ALBUM_PREVIEW_COUNT } from '@/constants/mockAlbums';
import { theme } from '@/constants/theme';
import type { QuickCleanAlbum } from '@/types/cleanup';
import { formatCount } from '@/utils/formatBytes';

interface AlbumsSectionProps {
  albums: QuickCleanAlbum[];
  onAlbumPress: (album: QuickCleanAlbum) => void;
  onViewAllPress: () => void;
}

export function AlbumsSection({
  albums,
  onAlbumPress,
  onViewAllPress,
}: AlbumsSectionProps) {
  if (albums.length === 0) {
    return null;
  }

  const previewAlbums = albums.slice(0, HOME_ALBUM_PREVIEW_COUNT);
  const hasMoreAlbums = albums.length > HOME_ALBUM_PREVIEW_COUNT;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Albums</Text>
        {hasMoreAlbums ? (
          <Pressable
            hitSlop={8}
            onPress={onViewAllPress}
            style={({ pressed }) => [pressed && styles.viewAllPressed]}
          >
            <Text style={styles.viewAll}>All albums</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.card}>
        {previewAlbums.map((album, index) => (
          <Pressable
            key={album.id}
            onPress={() => onAlbumPress(album)}
            style={({ pressed }) => [
              styles.row,
              index < previewAlbums.length - 1 && styles.rowBorder,
              pressed && styles.rowPressed,
            ]}
          >
            <Text numberOfLines={1} style={styles.label}>
              {album.label}
            </Text>
            <View style={styles.trailing}>
              <Text style={styles.count}>{formatCount(album.count)}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chevron: {
    color: theme.colors.textMuted,
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 22,
  },
  container: {
    gap: theme.spacing.md,
  },
  count: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '600',
  },
  label: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: theme.typography.body,
    marginRight: theme.spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 2,
  },
  rowBorder: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  rowPressed: {
    backgroundColor: theme.colors.background,
  },
  trailing: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  viewAll: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  viewAllPressed: {
    opacity: 0.7,
  },
});
