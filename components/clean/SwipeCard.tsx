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
const HIDE_CARD_DISTANCE = SCREEN_WIDTH * 0.55;
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
  const [advanceGeneration, setAdvanceGeneration] = useState(0);
  const [isFlyingOff, setIsFlyingOff] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [playRequestId, setPlayRequestId] = useState(0);

  const frontIndexRef = useRef(frontIndex);
  frontIndexRef.current = frontIndex;

  const pendingDecisionRef = useRef<'keep' | 'delete' | null>(null);
  const isAdvancingRef = useRef(false);

  const requestVideoPlayback = useCallback(() => {
    setPlayRequestId((previous) => previous + 1);
  }, []);

  const toggleVideoMute = useCallback(() => {
    setIsVideoMuted((previous) => !previous);
    requestVideoPlayback();
  }, [requestVideoPlayback]);

  // Keep slot data in sync when not mid-advance (undo, initial load, etc.).
  useEffect(() => {
    if (isAdvancingRef.current) {
      return;
    }

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

      frontIndexRef.current = 0;
      setFrontIndex(0);
      return [currentItem, nextItem];
    });
  }, [currentItem, nextItem]);

  // After fly-off: unmount swiped card, reset position, promote back card, advance session.
  useLayoutEffect(() => {
    if (pendingDecisionRef.current === null) {
      return;
    }

    const decision = pendingDecisionRef.current;
    pendingDecisionRef.current = null;

    cancelAnimation(translateX);
    cancelAnimation(translateY);
    overlayEnabled.value = 0;

    // Reset while the swiped card is already gone — it cannot snap back to center.
    translateX.value = 0;
    translateY.value = 0;
    isAnimating.value = false;
    setIsFlyingOff(false);

    const nextFront = 1 - frontIndexRef.current;
    frontIndexRef.current = nextFront;
    setFrontIndex(nextFront);

    isAdvancingRef.current = true;
    onDecision(decision);
    setPlayRequestId((previous) => previous + 1);
    isAdvancingRef.current = false;
  }, [advanceGeneration, isAnimating, onDecision, overlayEnabled, translateX, translateY]);

  useEffect(() => {
    if (currentItem.mediaType !== 'video') {
      return;
    }

    const timer = setTimeout(() => {
      requestVideoPlayback();
    }, 200);

    return () => clearTimeout(timer);
  }, [currentItem.id, currentItem.mediaType, requestVideoPlayback]);

  useEffect(() => {
    for (const item of slots) {
      if (item?.uri?.startsWith('http')) {
        void Image.prefetch(item.uri);
      }
    }
  }, [slots]);

  const beginAdvance = useCallback((decision: 'keep' | 'delete') => {
    pendingDecisionRef.current = decision;

    const outgoingSlot = frontIndexRef.current;
    setSlots((previous) => {
      const updated: CardSlots = [previous[0], previous[1]];
      updated[outgoingSlot] = null;
      return updated;
    });

    setAdvanceGeneration((previous) => previous + 1);
  }, []);

  const completeFlyOff = useCallback(
    (decision: 'keep' | 'delete') => {
      overlayEnabled.value = 0;
      beginAdvance(decision);
    },
    [beginAdvance, overlayEnabled],
  );

  const snapBack = useCallback(() => {
    overlayEnabled.value = withTiming(0, { duration: 120 });
    translateX.value = withSpring(0, { damping: 22, stiffness: 240 });
    translateY.value = withSpring(0, { damping: 22, stiffness: 240 });
    setIsFlyingOff(false);
  }, [overlayEnabled, translateX, translateY]);

  const flyOff = useCallback(
    (decision: 'keep' | 'delete') => {
      if (isAnimating.value) {
        return;
      }

      isAnimating.value = true;
      setIsFlyingOff(true);
      overlayEnabled.value = 1;

      if (onSwipeStart) {
        onSwipeStart(decision);
      }

      const direction = decision === 'keep' ? 1 : -1;

      translateX.value = withTiming(
        direction * OFFSCREEN_DISTANCE,
        { duration: FLY_OFF_DURATION },
        (finished) => {
          overlayEnabled.value = 0;
          if (finished) {
            runOnJS(completeFlyOff)(decision);
            return;
          }

          isAnimating.value = false;
          runOnJS(snapBack)();
        },
      );
    },
    [completeFlyOff, isAnimating, onSwipeStart, overlayEnabled, snapBack, translateX],
  );

  useImperativeHandle(swipeRef, () => ({
    swipe: flyOff,
  }));

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
    .activeOffsetX([-10, 10])
    .onBegin(() => {
      if (isAnimating.value) {
        return;
      }

      overlayEnabled.value = 1;
      runOnJS(requestVideoPlayback)();
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
    const distance = Math.abs(translateX.value);
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-8, 0, 8],
      Extrapolation.CLAMP,
    );

    return {
      opacity: isAnimating.value && distance > HIDE_CARD_DISTANCE ? 0 : 1,
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
        const isVideoActive =
          isFront &&
          item.mediaType === 'video' &&
          item.id === currentItem.id &&
          !isFlyingOff;

        return (
          <GestureDetector gesture={isFront ? panGesture : disabledGesture} key={slotIndex}>
            <Animated.View
              pointerEvents={isFront ? 'auto' : 'none'}
              style={[
                styles.cardShell,
                isFront ? styles.frontShell : styles.backShell,
                isFront ? frontCardStyle : backCardStyle,
              ]}
            >
              <View style={styles.cardClip}>
                <PhotoCard
                  activeItemId={currentItem.id}
                  isFront={isFront}
                  isPlaybackActive={isVideoActive}
                  isVideoMuted={isVideoMuted}
                  item={item}
                  onToggleVideoMute={isFront ? toggleVideoMute : undefined}
                  playRequestId={playRequestId}
                />
                {isFront ? (
                  <DecisionOverlay
                    overlayEnabled={overlayEnabled}
                    translateX={translateX}
                  />
                ) : null}
              </View>
            </Animated.View>
          </GestureDetector>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  backShell: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 0,
  },
  cardClip: {
    borderRadius: theme.radius.lg,
    flex: 1,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    width: '100%',
  },
  cardShell: {
    flex: 1,
  },
  frontShell: {
    zIndex: 1,
  },
  stack: {
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
    width: '100%',
  },
});
