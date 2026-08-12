import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ReviewPreviewOverlay } from '@/components/review/ReviewPreviewOverlay';
import { resolveMediaThumbnailUri } from '@/constants/demoVideo';
import { theme } from '@/constants/theme';
import type { CleanupSessionItem } from '@/types/cleanup';

const PREVIEW_HOLD_MS = 300;

interface ReviewGridProps {
  items: CleanupSessionItem[];
  selectedIds: Set<string>;
  onToggleItem: (assetId: string) => void;
}

export function ReviewGrid({ items, selectedIds, onToggleItem }: ReviewGridProps) {
  const [previewItem, setPreviewItem] = useState<CleanupSessionItem | null>(null);

  const closePreview = useCallback(() => {
    setPreviewItem(null);
  }, []);

  const openPreview = useCallback((item: CleanupSessionItem) => {
    setPreviewItem(item);
  }, []);

  return (
    <View style={styles.wrapper}>
      <FlatList
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        data={items}
        keyExtractor={(item) => item.assetId}
        numColumns={3}
        renderItem={({ item }) => {
          const isSelected = selectedIds.has(item.assetId);

          return (
            <Pressable
              delayLongPress={PREVIEW_HOLD_MS}
              onLongPress={() => openPreview(item)}
              onPress={() => onToggleItem(item.assetId)}
              style={[styles.cell, isSelected && styles.cellSelected]}
            >
              <Image
                contentFit="cover"
                source={{ uri: resolveMediaThumbnailUri(item.uri) }}
                style={[styles.thumbnail, !isSelected && styles.thumbnailDimmed]}
              />
              <View
                style={[
                  styles.checkbox,
                  isSelected ? styles.checkboxSelected : styles.checkboxUnselected,
                ]}
              >
                {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              {item.mediaType === 'video' ? (
                <View style={styles.videoBadge}>
                  <Text style={styles.videoBadgeText}>VID</Text>
                </View>
              ) : null}
            </Pressable>
          );
        }}
        showsVerticalScrollIndicator={false}
      />

      <ReviewPreviewOverlay
        item={previewItem}
        onClose={closePreview}
        visible={previewItem !== null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    aspectRatio: 1,
    backgroundColor: theme.colors.border,
    borderColor: 'transparent',
    borderRadius: theme.radius.sm,
    borderWidth: 1.5,
    flex: 1,
    margin: 4,
    overflow: 'hidden',
  },
  cellSelected: {
    borderColor: 'rgba(239, 68, 68, 0.55)',
    borderWidth: 1.5,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    elevation: 2,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    top: 5,
    width: 18,
  },
  checkboxSelected: {
    backgroundColor: theme.colors.delete,
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  checkboxUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 11,
    marginTop: -0.5,
  },
  content: {
    paddingBottom: theme.spacing.md,
  },
  row: {
    gap: 0,
  },
  thumbnail: {
    height: '100%',
    width: '100%',
  },
  thumbnailDimmed: {
    opacity: 0.45,
  },
  videoBadge: {
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    borderRadius: theme.radius.pill,
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  wrapper: {
    flex: 1,
  },
});
