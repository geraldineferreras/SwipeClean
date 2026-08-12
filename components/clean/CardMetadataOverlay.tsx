import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { SwipeItem } from '@/types/media';
import { formatBytes } from '@/utils/formatBytes';
import { formatMediaDate } from '@/utils/formatDate';

interface CardMetadataOverlayProps {
  item: SwipeItem;
  onDetailsPress?: () => void;
}

export function CardMetadataOverlay({ item, onDetailsPress }: CardMetadataOverlayProps) {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View style={styles.gradient}>
        <Text numberOfLines={1} style={styles.filename}>
          {item.filename}
        </Text>
        <Text numberOfLines={1} style={styles.metaLine}>
          {formatBytes(item.fileSizeBytes)} · {formatMediaDate(item.creationTime)}
        </Text>
        <Text style={styles.dimensions}>
          {item.width} x {item.height}
        </Text>
      </View>

      {onDetailsPress ? (
        <Pressable
          hitSlop={8}
          onPress={onDetailsPress}
          style={({ pressed }) => [styles.detailsButton, pressed && styles.detailsPressed]}
        >
          <Text style={styles.detailsText}>Details</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    padding: theme.spacing.md,
    position: 'absolute',
    right: 0,
  },
  detailsButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: theme.radius.pill,
    marginBottom: 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  detailsPressed: {
    opacity: 0.85,
  },
  detailsText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  dimensions: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 11,
    marginTop: 2,
  },
  filename: {
    color: '#FFFFFF',
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  gradient: {
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    borderRadius: theme.radius.md,
    flex: 1,
    marginRight: theme.spacing.sm,
    minWidth: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  metaLine: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: theme.typography.caption,
    marginTop: 2,
  },
});
