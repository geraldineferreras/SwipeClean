import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

interface StatBlockProps {
  label: string;
  value: string;
}

export function StatBlock({ label, value }: StatBlockProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.label,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.hero,
    fontWeight: '700',
    letterSpacing: -1,
  },
});
