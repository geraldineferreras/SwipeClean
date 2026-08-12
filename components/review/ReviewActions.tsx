import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/constants/theme';

interface ReviewActionsProps {
  onDeleteSelected: () => void;
  onKeepEverything: () => void;
  isDeleting?: boolean;
  deleteDisabled?: boolean;
}

export function ReviewActions({
  onDeleteSelected,
  onKeepEverything,
  isDeleting = false,
  deleteDisabled = false,
}: ReviewActionsProps) {
  return (
    <View style={styles.container}>
      <PrimaryButton
        disabled={isDeleting || deleteDisabled}
        label={isDeleting ? 'Deleting…' : 'Delete selected'}
        onPress={onDeleteSelected}
        style={styles.deleteButton}
      />
      <Pressable
        disabled={isDeleting}
        onPress={onKeepEverything}
        style={({ pressed }) => [
          styles.keepButton,
          pressed && !isDeleting && styles.pressed,
          isDeleting && styles.disabledButton,
        ]}
      >
        {isDeleting ? (
          <ActivityIndicator color={theme.colors.textSecondary} />
        ) : (
          <Text style={styles.keepLabel}>Keep everything</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  deleteButton: {
    backgroundColor: theme.colors.delete,
  },
  disabledButton: {
    opacity: 0.5,
  },
  keepButton: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
  },
  keepLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
