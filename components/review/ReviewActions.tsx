import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { formatCount } from '@/utils/formatBytes';

interface ReviewActionsProps {
  onDeleteSelected: () => void;
  isDeleting?: boolean;
  deleteDisabled?: boolean;
  selectedCount: number;
}

export function ReviewActions({
  onDeleteSelected,
  isDeleting = false,
  deleteDisabled = false,
  selectedCount,
}: ReviewActionsProps) {
  const itemLabel = selectedCount === 1 ? 'Item' : 'Items';

  return (
    <View style={styles.container}>
      <Pressable
        disabled={isDeleting || deleteDisabled}
        onPress={onDeleteSelected}
        style={({ pressed }) => [
          styles.deleteButton,
          (isDeleting || deleteDisabled) && styles.disabled,
          pressed && !isDeleting && !deleteDisabled && styles.pressed,
        ]}
      >
        {isDeleting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons color="#FFFFFF" name="trash-outline" size={18} />
            <Text style={styles.deleteLabel}>
              Remove {formatCount(selectedCount)} {itemLabel}
            </Text>
          </>
        )}
      </Pressable>

      <View style={styles.footerNote}>
        <Ionicons color={theme.colors.textMuted} name="shield-checkmark-outline" size={16} />
        <Text style={styles.footerText}>Items will be moved to Trash</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.delete,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: theme.spacing.lg,
  },
  deleteLabel: {
    color: '#FFFFFF',
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  footerNote: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
});
