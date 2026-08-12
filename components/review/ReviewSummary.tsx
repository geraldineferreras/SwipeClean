import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { FormattedBytes } from '@/components/shared/FormattedBytes';
import { theme } from '@/constants/theme';
import { formatCount } from '@/utils/formatBytes';

interface ReviewSummaryProps {
  itemCount: number;
  totalBytes: number;
}

export function ReviewSummary({ itemCount, totalBytes }: ReviewSummaryProps) {
  const itemLabel = itemCount === 1 ? 'Item' : 'Items';

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons color={theme.colors.delete} name="trash-outline" size={24} />
      </View>

      <Text style={styles.heading}>
        {formatCount(itemCount)} {itemLabel} Selected
      </Text>
      <Text style={styles.subheading}>Ready to clean</Text>

      <View style={styles.sizeCard}>
        <FormattedBytes bytes={totalBytes} style={styles.sizeValue} />
        <Text style={styles.sizeCaption}>Estimated space to free</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    textAlign: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.deleteSoft,
    borderRadius: theme.radius.pill,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  sizeCaption: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    marginTop: 2,
  },
  sizeCard: {
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    width: '100%',
  },
  sizeValue: {
    color: theme.colors.delete,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subheading: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
});
