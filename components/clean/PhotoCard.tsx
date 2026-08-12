import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SwipeVideoPlayer } from '@/components/clean/SwipeVideoPlayer';
import { isDemoVideoUri } from '@/constants/demoVideo';
import { theme } from '@/constants/theme';
import type { SwipeItem } from '@/types/media';
import { formatDuration } from '@/utils/formatDuration';

interface PhotoCardProps {
  activeItemId?: string;
  isFront?: boolean;
  isPlaybackActive?: boolean;
  isVideoMuted?: boolean;
  item: SwipeItem;
  onToggleVideoMute?: () => void;
  playRequestId?: number;
}

export const PhotoCard = memo(function PhotoCard({
  item,
  activeItemId,
  isFront = false,
  isPlaybackActive = false,
  isVideoMuted = true,
  onToggleVideoMute,
  playRequestId = 0,
}: PhotoCardProps) {
  const isVideo = item.mediaType === 'video';
  const isActiveVideo =
    isVideo && isFront && item.id === activeItemId && isPlaybackActive;

  if (isActiveVideo && onToggleVideoMute) {
    return (
      <SwipeVideoPlayer
        key={item.id}
        duration={item.duration}
        isActive={isPlaybackActive}
        isMuted={isVideoMuted}
        onToggleMute={onToggleVideoMute}
        playRequestId={playRequestId}
        uri={item.uri}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        placeholder={theme.colors.border}
        placeholderContentFit="cover"
        priority="high"
        recyclingKey={item.id}
        source={{ uri: isDemoVideoUri(item.uri) ? 'https://picsum.photos/seed/swipeclean5/900/1200' : item.uri }}
        style={styles.image}
        transition={0}
      />
      {isVideo ? (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.border,
    flex: 1,
    overflow: 'hidden',
  },
  durationBadge: {
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    borderRadius: theme.radius.pill,
    left: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    position: 'absolute',
    top: theme.spacing.md,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: theme.typography.label,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
