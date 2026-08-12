import { Image } from 'expo-image';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
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
const FLY_OFF_DURATION = 280;
const CARD_SLOTS = [0, 1] as const;

export interface SwipeCardRef {
  swipe: (decision: 'keep' | 'delete') => void;
}

interface SwipeCardStackProps {
  currentItem: SwipeItem;
  nextItem: SwipeItem | null;
  onDecision: (decision: 'keep' | 'delete') => void;
  onSwipeStart?: (decision: 'keep' | 'delete') => void;
  swipeRef: RefObject<SwipeCardRef | null>;
  isInteractive?: boolean;
}

type CardSlots = [SwipeItem | null, SwipeItem | null];

export function SwipeCardStack({
  currentItem,
  nextItem,
  onDecision,
  onSwipeStart,
  swipeRef,
  isInteractive = true,
}: SwipeCardStackProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const overlayEnabled = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const [frontIndex, setFrontIndex] = useState(0);
  const [slots, setSlots] = useState<CardSlots>([currentItem, nextItem]);
  const frontIndexRef = useRef(frontIndex);
  frontIndexRef.current = frontIndex;

  // Reset gesture state only after the back card is promoted to front.
  useLayoutEffect(() => {
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    translateX.value = 0;
    translateY.value = 0;
    overlayEnabled.value = 0;
  }, [frontIndex, overlayEnabled, translateX, translateY]);

  useEffect(() => {
    setSlots((previous) => {
      const frontSlot = frontIndexRef.current;
      const frontItem = previous[frontSlot];
      const backItem = previous[1 - frontSlot];

      if (frontItem?.id === currentItem.id) {
        if (backItem?.id === nextItem?.id || (!nextItem && !backItem)) {
          return previous;
        }

        const updated: CardSlots = [previous[0], previous[1]];
        updated[1 - frontSlot] = nextItem;
        return updated;
      }

      if (backItem?.id === currentItem.id) {
        const updated: CardSlots = [previous[0], previous[1]];
        updated[frontSlot] = nextItem;
        return updated;
      }

      setFrontIndex(0);
      frontIndexRef.current = 0;
      return [currentItem, nextItem];
    });
  }, [currentItem, nextItem]);

  useEffect(() => {
    for (const item of slots) {
      if (item?.uri) {
        void Image.prefetch(item.uri);
      }
    }
  }, [slots]);

  const handleAdvance = useCallback(
    (decision: 'keep' | 'delete') => {
      const outgoingSlot = frontIndexRef.current;
      const nextFront = 1 - outgoingSlot;

      // Drop the swiped card immediately so it cannot reappear as the back card.
      setSlots((previous) => {
        const updated: CardSlots = [previous[0], previous[1]];
        updated[outgoingSlot] = null;
        return updated;
      });

      frontIndexRef.current = nextFront;
      setFrontIndex(nextFront);
      onDecision(decision);
    },
    [onDecision],
  );

  const completeFlyOff = useCallback(
    (decision: 'keep' | 'delete') => {
      overlayEnabled.value = 0;
      isAnimating.value = false;
      handleAdvance(decision);
    },
    [handleAdvance, isAnimating, overlayEnabled],
  );

  const flyOff = useCallback(
    (decision: 'keep' | 'delete') => {
      if (isAnimating.value) {
        return;
      }

      isAnimating.value = true;
      overlayEnabled.value = 1;

      if (onSwipeStart) {
        onSwipeStart(decision);
      }

      const direction = decision === 'keep' ? 1 : -1;

      translateX.value = withTiming(
        direction * OFFSCREEN_DISTANCE,
        { duration: FLY_OFF_DURATION },
        (finished) => {
          if (finished) {
            overlayEnabled.value = 0;
            runOnJS(completeFlyOff)(decision);
          }
        },
      );
    },
    [completeFlyOff, isAnimating, onSwipeStart, overlayEnabled, translateX],
  );

  useImperativeHandle(swipeRef, () => ({
    swipe: flyOff,
  }));

  const snapBack = useCallback(() => {
    overlayEnabled.value = withTiming(0, { duration: 120 });
    translateX.value = withSpring(0, { damping: 22, stiffness: 240 });
    translateY.value = withSpring(0, { damping: 22, stiffness: 240 });
  }, [overlayEnabled, translateX, translateY]);

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
    .onBegin(() => {
      if (isAnimating.value) {
        return;
      }

      overlayEnabled.value = 1;
    })
    .onUpdate((event) => {
      if (isAnimating.value) {
        return;
      }

      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1;
    })
    .onEnd((event) => {
      if (isAnimating.value) {
        return;
      }

      runOnJS(finalizeGesture)(event.translationX);
    });

  const frontCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-8, 0, 8],
      Extrapolation.CLAMP,
    );

    return {
      opacity: 1,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const backCardStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD, SCREEN_WIDTH * 0.5],
      [0, 0.5, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: interpolate(progress, [0, 0.15], [0.55, 1], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(progress, [0, 1], [0.95, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const disabledGesture = Gesture.Pan().enabled(false);

  return (
    <View style={styles.stack}>
      {CARD_SLOTS.map((slotIndex) => {
        const item = slots[slotIndex];
        if (!item) {
          return null;
        }

        const isFront = slotIndex === frontIndex;

        return (
          <GestureDetector gesture={isFront ? panGesture : disabledGesture} key={slotIndex}>
            <Animated.View
              pointerEvents={isFront ? 'auto' : 'none'}
              style={[
                styles.card,
                isFront ? styles.frontCard : styles.backCard,
                isFront ? frontCardStyle : backCardStyle,
              ]}
            >
              <PhotoCard item={item} />
              {isFront ? (
                <DecisionOverlay
                  key={item.id}
                  overlayEnabled={overlayEnabled}
                  translateX={translateX}
                />
              ) : null}
            </Animated.View>
          </GestureDetector>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  backCard: {
    position: 'absolute',
    zIndex: 0,
  },
  card: {
    borderRadius: theme.radius.lg,
    height: '100%',
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    width: '100%',
  },
  frontCard: {
    zIndex: 1,
  },
  stack: {
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
    width: '100%',
  },
});
