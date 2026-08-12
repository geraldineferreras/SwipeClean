import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { SwipeItem } from '@/types/media';
import { formatBytes } from '@/utils/formatBytes';
import { formatMediaDate } from '@/utils/formatDate';

interface MediaMetadataProps {
  item: SwipeItem;
}

export function MediaMetadata({ item }: MediaMetadataProps) {
  const dimensions = `${item.width} × ${item.height}`;

  return (
    <View style={styles.container}>
      <Text style={styles.filename} numberOfLines={1}>
        {item.filename}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{formatBytes(item.fileSizeBytes)}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaText}>{formatMediaDate(item.creationTime)}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaText}>{dimensions}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  filename: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  metaDot: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
});
