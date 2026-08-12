import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes } from '@/utils/formatBytes';

interface PotentialSavingsCardProps {
  potentialSavingsBytes: number;
}

const SPARKLINE_HEIGHTS = [10, 16, 12, 22, 18, 28, 24, 32];

export function PotentialSavingsCard({
  potentialSavingsBytes,
}: PotentialSavingsCardProps) {
  const { heroValueSize, isCompact } = useResponsiveLayout();

  return (
    <View style={[styles.card, isCompact && styles.cardCompact]}>
      <View style={styles.leftColumn}>
        <View style={styles.iconBadge}>
          <Ionicons color={theme.colors.savings} name="sparkles" size={20} />
        </View>

        <View style={styles.textGroup}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Potential</Text>
          </View>
          <Text style={[styles.value, { fontSize: heroValueSize }]}>
            {formatBytes(potentialSavingsBytes)}
          </Text>
          <Text style={styles.subtitle}>can be recovered</Text>
          <Text style={styles.hint}>Clean up and free valuable space</Text>
        </View>
      </View>

      {!isCompact ? (
        <View style={styles.sparkline}>
          {SPARKLINE_HEIGHTS.map((height, index) => (
            <View
              key={index}
              style={[
                styles.sparkBar,
                {
                  backgroundColor:
                    index >= SPARKLINE_HEIGHTS.length - 2
                      ? theme.colors.savings
                      : '#86EFAC',
                  height,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.savingsSoft,
    borderColor: theme.colors.savingsBorder,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  cardCompact: {
    alignItems: 'flex-start',
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    marginTop: 2,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    flexShrink: 0,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  leftColumn: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    minWidth: 0,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: theme.radius.pill,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  pillText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sparkBar: {
    borderRadius: 4,
    width: 6,
  },
  sparkline: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
    height: 36,
    marginLeft: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '500',
  },
  textGroup: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  value: {
    color: theme.colors.savings,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
