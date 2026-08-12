import { useCallback, useEffect } from 'react';

import {
  playSwipeSound,
  preloadSwipeSounds,
  unloadSwipeSounds,
} from '@/services/swipeSoundService';

export function useSwipeSounds() {
  useEffect(() => {
    void preloadSwipeSounds();

    return () => {
      void unloadSwipeSounds();
    };
  }, []);

  const playKeepSound = useCallback(async () => {
    await playSwipeSound('keep');
  }, []);

  const playDeleteSound = useCallback(async () => {
    await playSwipeSound('delete');
  }, []);

  const playDecisionSound = useCallback(async (decision: 'keep' | 'delete') => {
    await playSwipeSound(decision);
  }, []);

  return {
    playKeepSound,
    playDeleteSound,
    playDecisionSound,
  };
}
