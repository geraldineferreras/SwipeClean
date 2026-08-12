import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { theme } from '@/constants/theme';

interface DecisionOverlayProps {
  translateX: SharedValue<number>;
}

export function DecisionOverlay({ translateX }: DecisionOverlayProps) {
  const deleteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-160, -60, 0],
      [1, 0.4, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const keepStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 60, 160],
      [0, 0.4, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, styles.deleteOverlay, deleteStyle]}
      >
        <Text style={styles.deleteLabel}>DELETE</Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, styles.keepOverlay, keepStyle]}
      >
        <Text style={styles.keepLabel}>KEEP</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  deleteLabel: {
    borderColor: theme.colors.delete,
    borderRadius: theme.radius.sm,
    borderWidth: 3,
    color: theme.colors.delete,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    letterSpacing: 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  deleteOverlay: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: theme.spacing.lg,
  },
  keepLabel: {
    borderColor: theme.colors.keep,
    borderRadius: theme.radius.sm,
    borderWidth: 3,
    color: theme.colors.keep,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    letterSpacing: 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  keepOverlay: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: theme.spacing.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.lg,
  },
});
