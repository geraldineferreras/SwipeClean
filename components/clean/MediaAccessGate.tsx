import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/constants/theme';

interface MediaAccessGateProps {
  title: string;
  message: string;
  isLoading?: boolean;
  primaryLabel?: string;
  onPrimaryPress?: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}

export function MediaAccessGate({
  title,
  message,
  isLoading = false,
  primaryLabel = 'Allow access',
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: MediaAccessGateProps) {
  return (
    <View style={styles.container}>
      {isLoading ? <ActivityIndicator color={theme.colors.accent} size="large" /> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onPrimaryPress ? (
        <PrimaryButton label={primaryLabel} onPress={onPrimaryPress} style={styles.button} />
      ) : null}
      {secondaryLabel && onSecondaryPress ? (
        <Pressable onPress={onSecondaryPress} style={styles.secondaryButton}>
          <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.lg,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  secondaryLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
});
