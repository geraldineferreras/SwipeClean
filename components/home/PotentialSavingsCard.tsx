import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { SavingsSparkline } from '@/components/home/SavingsSparkline';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes } from '@/utils/formatBytes';

interface PotentialSavingsCardProps {
  potentialSavingsBytes: number;
}

const CARD_COLORS = {
  background: '#F0F9F4',
  border: '#D5F2E3',
  value: '#065F46',
  subtitle: '#64748B',
  hint: '#94A3B8',
  icon: '#34A853',
  pillBackground: '#FFEDD5',
  pillText: '#9A3412',
} as const;

export function PotentialSavingsCard({
  potentialSavingsBytes,
}: PotentialSavingsCardProps) {
  const { font, scale, isCompact } = useResponsiveLayout();
  const sparklineWidth = scale(isCompact ? 58 : 64, 0.1);
  const sparklineHeight = scale(isCompact ? 38 : 44, 0.1);

  return (
    <View style={styles.card}>
      <View style={styles.iconColumn}>
        <View style={[styles.iconBadge, { height: scale(38), width: scale(38) }]}>
          <Ionicons color={CARD_COLORS.icon} name="sparkles" size={scale(18, 0.1)} />
        </View>
        <View style={styles.pill}>
          <Text numberOfLines={1} style={[styles.pillText, { fontSize: font(10) }]}>
            Potential
          </Text>
        </View>
      </View>

      <View style={styles.textGroup}>
        <Text style={[styles.value, { fontSize: font(24), lineHeight: font(28) }]}>
          {formatBytes(potentialSavingsBytes)}
        </Text>
        <Text style={[styles.subtitle, { fontSize: font(12), lineHeight: font(16) }]}>
          can be recovered
        </Text>
        <View style={styles.hintWrap}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.9}
            numberOfLines={1}
            style={[styles.hint, { fontSize: font(13), lineHeight: font(17) }]}
          >
            Clean up and free space
          </Text>
        </View>
      </View>

      <View style={styles.sparklineWrap}>
        <SavingsSparkline height={sparklineHeight} width={sparklineWidth} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: CARD_COLORS.background,
    borderColor: CARD_COLORS.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 112,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  hint: {
    color: CARD_COLORS.hint,
    width: '100%',
  },
  hintWrap: {
    alignSelf: 'stretch',
    marginTop: 3,
    width: '100%',
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    justifyContent: 'center',
  },
  iconColumn: {
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
  },
  pill: {
    alignSelf: 'center',
    backgroundColor: CARD_COLORS.pillBackground,
    borderRadius: 999,
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  pillText: {
    color: CARD_COLORS.pillText,
    fontWeight: '700',
    letterSpacing: 0,
  },
  sparklineWrap: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  subtitle: {
    color: CARD_COLORS.subtitle,
    fontWeight: '500',
    marginTop: 1,
  },
  textGroup: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  value: {
    color: CARD_COLORS.value,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
});
