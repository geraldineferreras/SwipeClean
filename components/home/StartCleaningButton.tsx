import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

interface StartCleaningButtonProps {
  disabled?: boolean;
  onPress: () => void;
}

export function StartCleaningButton({ onPress, disabled = false }: StartCleaningButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Ionicons color="#FFFFFF" name="sparkles" size={20} />
      <Text style={styles.label}>Start Cleaning</Text>
      <Ionicons color="rgba(255,255,255,0.85)" name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: theme.spacing.lg,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.92,
  },
});
