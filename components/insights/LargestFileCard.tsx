import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { InsightsLargestFile } from '@/constants/insightsData';
import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes } from '@/utils/formatBytes';

interface LargestFileCardProps {
  file: InsightsLargestFile;
  isSelected?: boolean;
  isSelecting?: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
  width?: number | `${number}%`;
}

export function LargestFileCard({
  file,
  isSelected = false,
  isSelecting = false,
  onLongPress,
  onPress,
  width = '100%',
}: LargestFileCardProps) {
  const { scale } = useResponsiveLayout();
  const checkboxSize = scale(20, 0.2);
  const inset = scale(6, 0.15);

  const content = (
    <>
      <View style={[styles.thumbWrap, isSelecting && isSelected && styles.thumbSelected]}>
        <Image contentFit="cover" source={{ uri: file.thumbnailUri }} style={styles.thumb} />
        {file.is4k ? (
          <View style={styles.badge4k}>
            <Text style={styles.badge4kText}>4K</Text>
          </View>
        ) : null}
        <View style={styles.overlay}>
          <Ionicons
            color="#FFFFFF"
            name={file.mediaType === 'video' ? 'videocam' : 'images'}
            size={12}
          />
          {file.duration ? <Text style={styles.duration}>{file.duration}</Text> : null}
        </View>
        {isSelecting ? (
          <View
            style={[
              styles.checkbox,
              {
                height: checkboxSize,
                right: inset,
                top: inset,
                width: checkboxSize,
              },
              isSelected && styles.checkboxSelected,
            ]}
          >
            {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
        ) : null}
      </View>
      <Text numberOfLines={1} style={styles.filename}>
        {file.filename}
      </Text>
      <Text style={styles.fileSize}>{formatBytes(file.bytes)}</Text>
    </>
  );

  if (onPress || onLongPress) {
    return (
      <Pressable
        delayLongPress={320}
        onLongPress={onLongPress}
        onPress={onPress}
        style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.card, { width }]}>{content}</View>;
}

const styles = StyleSheet.create({
  badge4k: {
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    borderRadius: 4,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    top: 8,
  },
  badge4kText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    minWidth: 0,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#FFFFFF',
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
    position: 'absolute',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.delete,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  duration: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  fileSize: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  filename: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },
  overlay: {
    alignItems: 'center',
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 8,
    position: 'absolute',
    right: 8,
  },
  pressed: {
    opacity: 0.88,
  },
  thumb: {
    height: '100%',
    width: '100%',
  },
  thumbSelected: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  thumbWrap: {
    aspectRatio: 0.78,
    backgroundColor: theme.colors.border,
    borderColor: 'transparent',
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
    overflow: 'hidden',
    width: '100%',
  },
});
