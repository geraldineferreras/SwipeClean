import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { theme } from '@/constants/theme';

type ParticleShape = 'circle' | 'strip';

interface ParticleConfig {
  angle: number;
  color: string;
  delay: number;
  distance: number;
  drift: number;
  fallDistance: number;
  rotation: number;
  scatter: number;
  shape: ParticleShape;
  size: number;
}

const BURST_PHASE = 0.22;

const CONFETTI_COLORS = [
  '#FBBF24',
  '#60A5FA',
  '#34D399',
  '#F472B6',
  '#A78BFA',
  '#FB7185',
  '#38BDF8',
  '#FACC15',
  '#4ADE80',
  '#C084FC',
  '#F97316',
  '#2DD4BF',
] as const;

function buildParticles(): ParticleConfig[] {
  const particles: ParticleConfig[] = [];
  const count = 22;

  for (let index = 0; index < count; index += 1) {
    const angleJitter = index % 2 === 0 ? 10 : -10;
    const angle = -180 + (360 / count) * index + angleJitter;

    particles.push({
      angle,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      delay: (index % 6) * 10,
      distance: 108 + (index % 5) * 22,
      drift: (index % 2 === 0 ? 1 : -1) * (28 + (index % 4) * 14),
      fallDistance: 88 + (index % 6) * 16,
      rotation: (index % 2 === 0 ? 1 : -1) * (40 + index * 9),
      scatter: (index % 2 === 0 ? 1 : -1) * (18 + (index % 3) * 8),
      shape: index % 3 === 0 ? 'strip' : 'circle',
      size: 7 + (index % 4) * 2,
    });
  }

  return particles;
}

function ConfettiParticle({ particle }: { particle: ParticleConfig }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      particle.delay,
      withTiming(1, {
        duration: 2100,
        easing: Easing.linear,
      }),
    );
  }, [particle.delay, progress]);

  const style = useAnimatedStyle(() => {
    const radians = (particle.angle * Math.PI) / 180;
    const burstPhase = Math.min(progress.value / BURST_PHASE, 1);
    const burstEase = 1 - (1 - burstPhase) ** 2.2;
    const burstOvershoot = burstEase * (1 + 0.14 * burstPhase);
    const fallPhase = interpolate(progress.value, [BURST_PHASE, 1], [0, 1], Extrapolation.CLAMP);
    const fallEase = fallPhase * fallPhase;

    const burstX = Math.cos(radians) * particle.distance * burstOvershoot;
    const burstY = Math.sin(radians) * particle.distance * burstOvershoot;
    const translateX =
      burstX + particle.drift * fallPhase + particle.scatter * fallEase;
    const translateY = burstY + particle.fallDistance * fallEase;

    return {
      opacity: interpolate(progress.value, [0, 0.06, 0.5, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX },
        { translateY },
        { rotate: `${particle.rotation * (burstEase + fallPhase * 2.8)}deg` },
        {
          scale: interpolate(progress.value, [0, 0.14, 0.65, 1], [0.15, 1.2, 1, 0.85], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const isStrip = particle.shape === 'strip';

  return (
    <Animated.View
      style={[
        isStrip ? styles.strip : styles.dot,
        {
          backgroundColor: particle.color,
          height: isStrip ? particle.size * 0.45 : particle.size,
          width: isStrip ? particle.size * 1.75 : particle.size,
        },
        style,
      ]}
    />
  );
}

export function PartyPopperHero() {
  const particles = useMemo(() => buildParticles(), []);
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.4);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    checkScale.value = 0;
    checkOpacity.value = 0;
    ringScale.value = 0.4;
    ringOpacity.value = 0;

    ringOpacity.value = withTiming(1, { duration: 200 });
    ringScale.value = withSpring(1, { damping: 14, stiffness: 220 });

    checkOpacity.value = withDelay(80, withTiming(1, { duration: 180 }));
    checkScale.value = withDelay(
      80,
      withSpring(1, {
        damping: 11,
        stiffness: 260,
      }),
    );
  }, [checkOpacity, checkScale, ringOpacity, ringScale]);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value * interpolate(ringScale.value, [0.4, 1], [0.6, 0]),
    transform: [{ scale: ringScale.value * 1.5 }],
  }));

  return (
    <View style={styles.hero}>
      {particles.map((particle) => (
        <ConfettiParticle key={`${particle.color}-${particle.angle}`} particle={particle} />
      ))}

      <Animated.View pointerEvents="none" style={[styles.burstRing, ringStyle]} />

      <Animated.View style={[styles.checkCircle, checkStyle]}>
        <Ionicons color="#FFFFFF" name="checkmark" size={42} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  burstRing: {
    backgroundColor: theme.colors.keep,
    borderRadius: 999,
    height: 96,
    position: 'absolute',
    width: 96,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: theme.colors.keep,
    borderRadius: 999,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  dot: {
    borderRadius: 999,
    position: 'absolute',
  },
  hero: {
    alignItems: 'center',
    height: 260,
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    overflow: 'visible',
    width: 340,
  },
  strip: {
    borderRadius: 2,
    position: 'absolute',
  },
});
