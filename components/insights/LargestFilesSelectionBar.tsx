import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormattedBytes } from '@/components/shared/FormattedBytes';
import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatCount } from '@/utils/formatBytes';

interface LargestFilesSelectionBarProps {
  onRemove: () => void;
  selectedBytes: number;
  selectedCount: number;
}

export function LargestFilesSelectionBar({
  onRemove,
  selectedBytes,
  selectedCount,
}: LargestFilesSelectionBarProps) {
  const { contentPadding, isCompact } = useResponsiveLayout();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <View style={[styles.footer, { paddingHorizontal: contentPadding }]}>
      <View style={[styles.bar, isCompact && styles.barCompact]}>
        <View style={styles.summary}>
          <Ionicons color={theme.colors.delete} name="checkmark-circle" size={18} />
          <View style={styles.summaryText}>
            <Text numberOfLines={1} style={styles.summaryTitle}>
              {formatCount(selectedCount)} selected
            </Text>
            <FormattedBytes bytes={selectedBytes} style={styles.summaryMeta} />
          </View>
        </View>

        <Pressable
          onPress={onRemove}
          style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
        >
          <Ionicons color="#FFFFFF" name="trash-outline" size={16} />
          <Text style={styles.removeLabel}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  barCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  footer: {
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.delete,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  removeLabel: {
    color: '#FFFFFF',
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  summary: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minWidth: 0,
  },
  summaryMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
});
