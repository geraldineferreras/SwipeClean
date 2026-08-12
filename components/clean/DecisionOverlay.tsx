import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SPREAD_START = 10;
const SPREAD_MID = 72;
const SPREAD_FULL = SCREEN_WIDTH * 0.52;
const HIDE_DISTANCE = SCREEN_WIDTH * 0.55;

interface DecisionOverlayProps {
  translateX: SharedValue<number>;
  overlayEnabled: SharedValue<number>;
}

export function DecisionOverlay({ translateX, overlayEnabled }: DecisionOverlayProps) {
  const removePanelStyle = useAnimatedStyle(() => {
    const distance = Math.max(0, -translateX.value);

    if (overlayEnabled.value <= 0 || translateX.value >= 0 || distance > HIDE_DISTANCE) {
      return { opacity: 0, width: 0 };
    }

    const width = interpolate(
      distance,
      [0, SPREAD_START, SPREAD_MID, SPREAD_FULL],
      [0, 36, 120, SCREEN_WIDTH],
      Extrapolation.CLAMP,
    );

    const opacity =
      overlayEnabled.value *
      interpolate(distance, [0, 24, 90, SPREAD_FULL], [0, 0.45, 0.82, 1], Extrapolation.CLAMP);

    return { opacity, width };
  });

  const keepPanelStyle = useAnimatedStyle(() => {
    const distance = Math.max(0, translateX.value);

    if (overlayEnabled.value <= 0 || translateX.value <= 0 || distance > HIDE_DISTANCE) {
      return { opacity: 0, width: 0 };
    }

    const width = interpolate(
      distance,
      [0, SPREAD_START, SPREAD_MID, SPREAD_FULL],
      [0, 36, 120, SCREEN_WIDTH],
      Extrapolation.CLAMP,
    );

    const opacity =
      overlayEnabled.value *
      interpolate(distance, [0, 24, 90, SPREAD_FULL], [0, 0.45, 0.82, 1], Extrapolation.CLAMP);

    return { opacity, width };
  });

  const removeContentStyle = useAnimatedStyle(() => {
    const distance = Math.max(0, -translateX.value);

    return {
      opacity: interpolate(distance, [0, 40, 110], [0, 0.55, 1], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(distance, [0, 40, SPREAD_FULL], [0.88, 0.95, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const keepContentStyle = useAnimatedStyle(() => {
    const distance = Math.max(0, translateX.value);

    return {
      opacity: interpolate(distance, [0, 40, 110], [0, 0.55, 1], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(distance, [0, 40, SPREAD_FULL], [0.88, 0.95, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.removePanel, removePanelStyle]}>
        <LinearGradient
          colors={[
            'rgba(239, 68, 68, 0.78)',
            'rgba(239, 68, 68, 0.42)',
            'rgba(239, 68, 68, 0)',
          ]}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.58, 1]}
          start={{ x: 0, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.content, removeContentStyle]}>
          <Ionicons color="#FFFFFF" name="trash-outline" size={38} />
          <Text style={styles.label}>REMOVE</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.keepPanel, keepPanelStyle]}>
        <LinearGradient
          colors={[
            'rgba(16, 185, 129, 0)',
            'rgba(16, 185, 129, 0.42)',
            'rgba(16, 185, 129, 0.78)',
          ]}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.42, 1]}
          start={{ x: 0, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.content, keepContentStyle]}>
          <View style={styles.keepIconRing}>
            <Ionicons color="#FFFFFF" name="checkmark" size={28} />
          </View>
          <Text style={styles.label}>KEEP</Text>
        </Animated.View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: 14,
    justifyContent: 'center',
  },
  keepIconRing: {
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 2.5,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  keepPanel: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  removePanel: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
  },
});
