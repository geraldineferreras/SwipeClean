import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/constants/theme';

interface SimilarPhotosChipProps {
  count: number;
  onPress?: () => void;
}

export function SimilarPhotosChip({ count, onPress }: SimilarPhotosChipProps) {
  if (count <= 0) {
    return null;
  }

  const label =
    count === 1 ? 'Similar to 1 other photo' : `Similar to ${count} other photos`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <Ionicons color={theme.colors.accent} name="sparkles-outline" size={16} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  label: {
    color: theme.colors.accent,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
