import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

interface CleanScreenHeaderProps {
  doneDisabled?: boolean;
  onBack: () => void;
  onDone: () => void;
  title: string;
}

export function CleanScreenHeader({
  doneDisabled,
  onBack,
  onDone,
  title,
}: CleanScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={24} />
      </Pressable>

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <Pressable
        disabled={doneDisabled}
        hitSlop={8}
        onPress={onDone}
        style={({ pressed }) => [
          styles.doneButton,
          doneDisabled && styles.doneDisabled,
          pressed && !doneDisabled && styles.pressed,
        ]}
      >
        <Text style={styles.doneText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  doneButton: {
    minWidth: 52,
    paddingVertical: theme.spacing.xs,
  },
  doneDisabled: {
    opacity: 0.4,
  },
  doneText: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
    textAlign: 'right',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
});
