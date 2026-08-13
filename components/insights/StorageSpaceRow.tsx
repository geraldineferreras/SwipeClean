import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { formatBytes, formatCount } from '@/utils/formatBytes';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface StorageSpaceRowProps {
  label: string;
  bytes: number;
  percent: number;
  color: string;
  softColor: string;
  icon: IoniconName;
  count?: number;
  onPress?: () => void;
  showChevron?: boolean;
}

export function StorageSpaceRow({
  label,
  bytes,
  percent,
  color,
  softColor,
  icon,
  count,
  onPress,
  showChevron = true,
}: StorageSpaceRowProps) {
  const content = (
    <>
      <View style={[styles.icon, { backgroundColor: softColor }]}>
        <Ionicons color={color} name={icon} size={16} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.label}>
            {label}
          </Text>
          <Text style={styles.meta}>
            {count !== undefined ? `${formatCount(count)} · ` : ''}
            {formatBytes(bytes)} · {percent}%
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { backgroundColor: color, width: `${percent}%` }]} />
        </View>
      </View>
      {showChevron ? <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={16} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  fill: {
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  icon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  label: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    minWidth: 0,
  },
  meta: {
    color: theme.colors.textMuted,
    flexShrink: 0,
    fontSize: 10,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  track: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    height: 5,
    overflow: 'hidden',
  },
});
