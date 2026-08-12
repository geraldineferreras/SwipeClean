import { Dimensions, StyleSheet, Text } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { theme } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const LABEL_FADE_START = 60;
const LABEL_FADE_END = 160;
const LABEL_HIDE_DISTANCE = SCREEN_WIDTH * 0.45;

interface DecisionOverlayProps {
  translateX: SharedValue<number>;
  overlayEnabled: SharedValue<number>;
}

export function DecisionOverlay({ translateX, overlayEnabled }: DecisionOverlayProps) {
  const deleteStyle = useAnimatedStyle(() => {
    if (overlayEnabled.value <= 0) {
      return { opacity: 0 };
    }

    const distance = Math.abs(translateX.value);

    if (distance > LABEL_HIDE_DISTANCE) {
      return { opacity: 0 };
    }

    return {
      opacity:
        overlayEnabled.value *
        interpolate(
          translateX.value,
          [-LABEL_FADE_END, -LABEL_FADE_START, 0],
          [1, 0.4, 0],
          Extrapolation.CLAMP,
        ),
    };
  });

  const keepStyle = useAnimatedStyle(() => {
    if (overlayEnabled.value <= 0) {
      return { opacity: 0 };
    }

    const distance = Math.abs(translateX.value);

    if (distance > LABEL_HIDE_DISTANCE) {
      return { opacity: 0 };
    }

    return {
      opacity:
        overlayEnabled.value *
        interpolate(
          translateX.value,
          [0, LABEL_FADE_START, LABEL_FADE_END],
          [0, 0.4, 1],
          Extrapolation.CLAMP,
        ),
    };
  });

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
