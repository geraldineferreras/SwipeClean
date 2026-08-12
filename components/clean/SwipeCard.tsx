import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  type RefObject,
} from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DecisionOverlay } from '@/components/clean/DecisionOverlay';
import { PhotoCard } from '@/components/clean/PhotoCard';
import { theme } from '@/constants/theme';
import type { SwipeItem } from '@/types/media';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const OFFSCREEN_DISTANCE = SCREEN_WIDTH * 1.4;

export interface SwipeCardRef {
  swipe: (decision: 'keep' | 'delete') => void;
}

interface SwipeCardProps {
  item: SwipeItem;
  onDecision: (decision: 'keep' | 'delete') => void;
  onSwipeStart?: (decision: 'keep' | 'delete') => void;
  isInteractive?: boolean;
}

export const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(
  function SwipeCard({ item, onDecision, onSwipeStart, isInteractive = true }, ref) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isAnimating = useSharedValue(false);

    const resetPosition = useCallback(() => {
      translateX.value = 0;
      translateY.value = 0;
      isAnimating.value = false;
    }, [isAnimating, translateX, translateY]);

    useEffect(() => {
      resetPosition();
    }, [item.id, resetPosition]);

    const completeDecision = useCallback(
      (decision: 'keep' | 'delete') => {
        onDecision(decision);
      },
      [onDecision],
    );

    const flyOff = useCallback(
      (decision: 'keep' | 'delete') => {
        if (isAnimating.value) {
          return;
        }

        isAnimating.value = true;

        if (onSwipeStart) {
          runOnJS(onSwipeStart)(decision);
        }

        const direction = decision === 'keep' ? 1 : -1;

        translateX.value = withTiming(
          direction * OFFSCREEN_DISTANCE,
          { duration: 260 },
          (finished) => {
            if (finished) {
              runOnJS(completeDecision)(decision);
            }
          },
        );
      },
      [completeDecision, isAnimating, onSwipeStart, translateX],
    );

    useImperativeHandle(ref, () => ({
      swipe: flyOff,
    }));

    const snapBack = useCallback(() => {
      translateX.value = withSpring(0, { damping: 20, stiffness: 220 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 220 });
    }, [translateX, translateY]);

    const finalizeGesture = useCallback(
      (offsetX: number) => {
        if (offsetX <= -SWIPE_THRESHOLD) {
          flyOff('delete');
          return;
        }

        if (offsetX >= SWIPE_THRESHOLD) {
          flyOff('keep');
          return;
        }

        snapBack();
      },
      [flyOff, snapBack],
    );

    const panGesture = Gesture.Pan()
      .enabled(isInteractive)
      .onUpdate((event) => {
        if (isAnimating.value) {
          return;
        }

        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.15;
      })
      .onEnd((event) => {
        if (isAnimating.value) {
          return;
        }

        runOnJS(finalizeGesture)(event.translationX);
      });

    const cardStyle = useAnimatedStyle(() => {
      const rotate = interpolate(
        translateX.value,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-12, 0, 12],
        Extrapolation.CLAMP,
      );

      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotate: `${rotate}deg` },
        ],
      };
    });

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <PhotoCard item={item} />
          <DecisionOverlay translateX={translateX} />
        </Animated.View>
      </GestureDetector>
    );
  },
);

interface SwipeCardStackProps {
  currentItem: SwipeItem;
  nextItem: SwipeItem | null;
  onDecision: (decision: 'keep' | 'delete') => void;
  onSwipeStart?: (decision: 'keep' | 'delete') => void;
  swipeRef: RefObject<SwipeCardRef | null>;
  isInteractive?: boolean;
}

export function SwipeCardStack({
  currentItem,
  nextItem,
  onDecision,
  onSwipeStart,
  swipeRef,
  isInteractive = true,
}: SwipeCardStackProps) {
  return (
    <View style={styles.stack}>
      {nextItem ? (
        <View pointerEvents="none" style={[styles.card, styles.nextCard]}>
          <PhotoCard item={nextItem} />
        </View>
      ) : null}
      <SwipeCard
        ref={swipeRef}
        isInteractive={isInteractive}
        item={currentItem}
        onDecision={onDecision}
        onSwipeStart={onSwipeStart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    height: '100%',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    width: '100%',
  },
  nextCard: {
    opacity: 0.55,
    position: 'absolute',
    transform: [{ scale: 0.96 }],
  },
  stack: {
    flex: 1,
    width: '100%',
  },
});
