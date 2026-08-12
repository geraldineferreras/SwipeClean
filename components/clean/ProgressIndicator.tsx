import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { formatCount } from '@/utils/formatBytes';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const progress = total > 0 ? current / total : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {formatCount(current)} of {formatCount(total)}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  fill: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  track: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    height: 5,
    overflow: 'hidden',
  },
});
