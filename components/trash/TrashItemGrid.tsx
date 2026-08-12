import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getTrashThumbnailUri, type TrashItem } from '@/constants/mockTrash';
import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes } from '@/utils/formatBytes';

interface TrashItemGridProps {
  items: TrashItem[];
  selectedIds: Set<string>;
  onToggleItem: (id: string) => void;
}

function TrashGridCell({
  checkboxSize,
  iconSize,
  inset,
  item,
  isSelected,
  onToggleItem,
}: {
  checkboxSize: number;
  iconSize: number;
  inset: number;
  item: TrashItem;
  isSelected: boolean;
  onToggleItem: (id: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onToggleItem(item.id)}
      style={[styles.cell, isSelected && styles.cellSelected]}
    >
      <Image
        contentFit="cover"
        source={{ uri: getTrashThumbnailUri(item) }}
        style={styles.thumbnail}
      />

      <View style={styles.overlay}>
        <View style={styles.overlayMeta}>
          <Ionicons
            color="#FFFFFF"
            name={item.mediaType === 'video' ? 'videocam' : 'image'}
            size={iconSize}
          />
          <Text numberOfLines={1} style={styles.filename}>
            {item.filename}
          </Text>
        </View>
        <Text style={styles.metaLine}>
          {formatBytes(item.fileSizeBytes)} · {item.daysLeft} days left
        </Text>
      </View>

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
    </Pressable>
  );
}

export function TrashItemGrid({ items, selectedIds, onToggleItem }: TrashItemGridProps) {
  const { scale, trashColumns } = useResponsiveLayout();
  const cellWidth = `${100 / trashColumns}%` as `${number}%`;
  const checkboxSize = scale(20, 0.2);
  const iconSize = scale(11, 0.15);
  const inset = scale(6, 0.15);

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.id} style={[styles.cellWrapper, { width: cellWidth }]}>
          <TrashGridCell
            checkboxSize={checkboxSize}
            iconSize={iconSize}
            inset={inset}
            isSelected={selectedIds.has(item.id)}
            item={item}
            onToggleItem={onToggleItem}
          />
        </View>
      ))}
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
    overflow: 'hidden',
    width: '100%',
  },
  cellSelected: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  cellWrapper: {
    padding: 6,
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
  filename: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    minWidth: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaLine: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 10,
    marginTop: 2,
  },
  overlay: {
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    bottom: 0,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'absolute',
    right: 0,
  },
  overlayMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    minWidth: 0,
  },
  thumbnail: {
    height: '100%',
    width: '100%',
  },
});
