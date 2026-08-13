import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { InsightsLargestFile } from '@/constants/insightsData';
import { theme } from '@/constants/theme';
import { formatBytes } from '@/utils/formatBytes';

const PREVIEW_IMAGE_RADIUS = 24;
const HORIZONTAL_INSET = theme.spacing.md;

interface LargestFilePreviewOverlayProps {
  file: InsightsLargestFile | null;
  onClose: () => void;
  visible: boolean;
}

export function LargestFilePreviewOverlay({ file, visible, onClose }: LargestFilePreviewOverlayProps) {
  const { width, height } = useWindowDimensions();
  const previewWidth = width - HORIZONTAL_INSET * 2;
  const previewHeight = height * 0.78;

  if (!file) {
    return null;
  }

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={onClose} style={styles.dismissArea}>
          <Text style={styles.headerTitle}>Preview</Text>

          <View style={styles.previewGroup}>
            <View style={[styles.previewFrame, { height: previewHeight, width: previewWidth }]}>
              <Image
                contentFit="contain"
                source={{ uri: file.thumbnailUri }}
                style={styles.media}
                transition={150}
              />
              {file.mediaType === 'video' ? (
                <View style={styles.videoBadge}>
                  <Text style={styles.videoBadgeText}>
                    {file.is4k ? '4K VIDEO' : 'VIDEO'}
                    {file.duration ? ` · ${file.duration}` : ''}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text numberOfLines={2} style={styles.filename}>
              {file.filename}
            </Text>
            <Text style={styles.meta}>{formatBytes(file.bytes)}</Text>
          </View>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dismissArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_INSET,
  },
  filename: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: theme.typography.body,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
    maxWidth: '100%',
    paddingHorizontal: theme.spacing.sm,
    textAlign: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: theme.typography.body,
    fontWeight: '700',
    marginTop: theme.spacing.lg,
    position: 'absolute',
    textAlign: 'center',
    top: theme.spacing.sm,
    width: '100%',
  },
  media: {
    borderRadius: PREVIEW_IMAGE_RADIUS,
    height: '100%',
    width: '100%',
  },
  meta: {
    color: 'rgba(255, 255, 255, 0.62)',
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  previewFrame: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: PREVIEW_IMAGE_RADIUS,
    overflow: 'hidden',
  },
  previewGroup: {
    alignItems: 'center',
  },
  safeArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    flex: 1,
  },
  videoBadge: {
    backgroundColor: 'rgba(17, 24, 39, 0.82)',
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
    letterSpacing: 0.6,
  },
});
