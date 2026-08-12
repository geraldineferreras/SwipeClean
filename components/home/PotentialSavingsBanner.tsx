import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { formatBytes } from '@/utils/formatBytes';

interface PotentialSavingsBannerProps {
  potentialSavingsBytes: number;
}

export function PotentialSavingsBanner({
  potentialSavingsBytes,
}: PotentialSavingsBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.textGroup}>
        <Text style={styles.label}>Potential savings</Text>
        <Text style={styles.value}>{formatBytes(potentialSavingsBytes)}</Text>
      </View>
      <Text style={styles.hint}>From quick-clean categories</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.savingsSoft,
    borderColor: '#99F6E4',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  label: {
    color: theme.colors.savings,
    fontSize: theme.typography.label,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  textGroup: {
    gap: theme.spacing.xs,
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
