import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { SwipeItem } from '@/types/media';

interface PhotoCardProps {
  item: SwipeItem;
}

export function PhotoCard({ item }: PhotoCardProps) {
  return (
    <View style={styles.container}>
      <Image
        contentFit="cover"
        source={{ uri: item.uri }}
        style={styles.image}
        transition={200}
      />
      {item.mediaType === 'video' ? (
        <View style={styles.videoBadge}>
          <Text style={styles.videoBadgeText}>VIDEO</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  videoBadge: {
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    borderRadius: theme.radius.pill,
    left: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    position: 'absolute',
    top: theme.spacing.md,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: theme.typography.label,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
