import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

interface ActionBarProps {
  onDelete: () => void;
  onKeep: () => void;
  onUndo: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

function ActionButton({
  backgroundColor,
  borderColor,
  disabled,
  icon,
  iconColor,
  label,
  onPress,
}: {
  backgroundColor: string;
  borderColor?: string;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.actionItem}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.circleButton,
          { backgroundColor, borderColor: borderColor ?? 'transparent' },
          borderColor ? styles.circleBorder : null,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Ionicons color={iconColor} name={icon} size={24} />
      </Pressable>
      <Text style={[styles.actionLabel, disabled && styles.labelDisabled]}>{label}</Text>
    </View>
  );
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
      <ActionButton
        backgroundColor={theme.colors.delete}
        disabled={disabled}
        icon="trash-outline"
        iconColor="#FFFFFF"
        label="Remove"
        onPress={onDelete}
      />

      <ActionButton
        backgroundColor={theme.colors.surface}
        borderColor={theme.colors.border}
        disabled={!canUndo || disabled}
        icon="arrow-undo-outline"
        iconColor={theme.colors.textPrimary}
        label="Undo"
        onPress={onUndo}
      />

      <ActionButton
        backgroundColor={theme.colors.keep}
        disabled={disabled}
        icon="checkmark"
        iconColor="#FFFFFF"
        label="Keep"
        onPress={onKeep}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionItem: {
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm,
  },
  actionLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  circleBorder: {
    borderWidth: 1,
  },
  circleButton: {
    alignItems: 'center',
    borderRadius: 999,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  disabled: {
    opacity: 0.45,
  },
  labelDisabled: {
    color: theme.colors.textMuted,
  },
  pressed: {
    opacity: 0.88,
  },
});
