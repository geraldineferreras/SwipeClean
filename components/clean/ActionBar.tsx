import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

interface ActionBarProps {
  onDelete: () => void;
  onKeep: () => void;
  onUndo: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

export function ActionBar({
  onDelete,
  onKeep,
  onUndo,
  canUndo,
  disabled = false,
}: ActionBarProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onDelete}
        style={({ pressed }) => [
          styles.actionButton,
          styles.deleteButton,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text style={[styles.actionLabel, styles.deleteLabel]}>Delete</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={!canUndo || disabled}
        onPress={onUndo}
        style={({ pressed }) => [
          styles.undoButton,
          (!canUndo || disabled) && styles.disabled,
          pressed && canUndo && !disabled && styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.undoLabel,
            (!canUndo || disabled) && styles.undoLabelDisabled,
          ]}
        >
          Undo
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onKeep}
        style={({ pressed }) => [
          styles.actionButton,
          styles.keepButton,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text style={[styles.actionLabel, styles.keepLabel]}>Keep</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
  },
  actionLabel: {
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  deleteButton: {
    backgroundColor: theme.colors.deleteSoft,
  },
  deleteLabel: {
    color: theme.colors.delete,
  },
  disabled: {
    opacity: 0.45,
  },
  keepButton: {
    backgroundColor: theme.colors.keepSoft,
  },
  keepLabel: {
    color: theme.colors.keep,
  },
  pressed: {
    opacity: 0.85,
  },
  undoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 72,
    paddingHorizontal: theme.spacing.sm,
  },
  undoLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  undoLabelDisabled: {
    color: theme.colors.textMuted,
  },
});
