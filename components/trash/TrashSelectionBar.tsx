import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormattedBytes } from '@/components/shared/FormattedBytes';
import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatCount } from '@/utils/formatBytes';

interface TrashSelectionBarProps {
  selectedCount: number;
  selectedBytes: number;
  onDelete: () => void;
  onRestore: () => void;
}

export function TrashSelectionBar({
  selectedCount,
  selectedBytes,
  onDelete,
  onRestore,
}: TrashSelectionBarProps) {
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
              {formatCount(selectedCount)} items selected
            </Text>
            <FormattedBytes bytes={selectedBytes} style={styles.summaryMeta} />
          </View>
        </View>

        <View style={[styles.actions, isCompact && styles.actionsCompact]}>
          <Pressable
            onPress={onRestore}
            style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}
          >
            <Ionicons color={theme.colors.accent} name="arrow-undo-outline" size={16} />
            <Text style={styles.restoreLabel}>Restore</Text>
          </Pressable>

          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <Ionicons color="#FFFFFF" name="trash-outline" size={16} />
            <Text style={styles.deleteLabel}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexShrink: 0,
    gap: theme.spacing.sm,
  },
  actionsCompact: {
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
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
  deleteButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.delete,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  deleteLabel: {
    color: '#FFFFFF',
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  restoreButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accentRing,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  restoreLabel: {
    color: theme.colors.accent,
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
