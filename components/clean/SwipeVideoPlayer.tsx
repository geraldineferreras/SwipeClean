import Ionicons from '@expo/vector-icons/Ionicons';
import { useVideoPlayer, VideoView, type VideoPlayer } from 'expo-video';
import { useEffect, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { resolveVideoSource } from '@/constants/demoVideo';
import { theme } from '@/constants/theme';
import { formatDuration } from '@/utils/formatDuration';

interface SwipeVideoPlayerProps {
  duration: number;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  playRequestId?: number;
  uri: string;
}

function safePlay(player: VideoPlayer) {
  try {
    player.play();
  } catch {
    // Player may already be released during card transitions.
  }
}

function safePause(player: VideoPlayer) {
  try {
    player.pause();
  } catch {
    // Player may already be released during card transitions.
  }
}

export function SwipeVideoPlayer({
  uri,
  duration,
  isActive,
  isMuted,
  onToggleMute,
  playRequestId = 0,
}: SwipeVideoPlayerProps) {
  const source = useMemo(() => resolveVideoSource(uri), [uri]);

  const player = useVideoPlayer(source, (instance) => {
    instance.loop = true;
    instance.muted = true;
  });

  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    if (isActive) {
      safePlay(player);
      return;
    }

    safePause(player);
  }, [isActive, playRequestId, player]);

  return (
    <View collapsable={false} style={styles.container}>
      <VideoView
        allowsPictureInPicture={false}
        contentFit="cover"
        fullscreenOptions={{ enable: false }}
        nativeControls={false}
        player={player}
        pointerEvents="none"
        style={styles.video}
        {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : {})}
      />

      <View pointerEvents="none" style={styles.durationBadge}>
        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
      </View>

      <Pressable
        accessibilityLabel={isMuted ? 'Unmute video' : 'Mute video'}
        accessibilityRole="button"
        hitSlop={12}
        onPress={onToggleMute}
        style={({ pressed }) => [styles.muteButton, pressed ? styles.muteButtonPressed : null]}
      >
        <Ionicons
          color="#FFFFFF"
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={22}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
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
    zIndex: 2,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: theme.typography.label,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  muteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    borderRadius: theme.radius.pill,
    bottom: theme.spacing.md,
    elevation: 10,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: theme.spacing.md,
    width: 44,
    zIndex: 2,
  },
  muteButtonPressed: {
    opacity: 0.82,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
});
