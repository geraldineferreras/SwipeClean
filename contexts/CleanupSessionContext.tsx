import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { CleanupResult, CleanupSessionItem } from '@/types/cleanup';
import type { SwipeItem } from '@/types/media';

type SessionDecision = Extract<CleanupSessionItem['decision'], 'keep' | 'delete'>;

interface UndoEntry {
  decision: CleanupSessionItem;
  previousIndex: number;
}

interface CleanupSessionContextValue {
  items: SwipeItem[];
  currentItem: SwipeItem | null;
  nextItem: SwipeItem | null;
  isComplete: boolean;
  progressCurrent: number;
  progressTotal: number;
  canUndo: boolean;
  markedForDeletion: CleanupSessionItem[];
  keptCount: number;
  lastCleanupResult: CleanupResult | null;
  initializeSession: (items: SwipeItem[]) => void;
  recordDecision: (decision: SessionDecision) => void;
  finishSession: () => void;
  undoLastDecision: () => void;
  resetSession: () => void;
  setLastCleanupResult: (result: CleanupResult) => void;
}

const CleanupSessionContext = createContext<CleanupSessionContextValue | null>(
  null,
);

export function CleanupSessionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SwipeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<CleanupSessionItem[]>([]);
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const [lastCleanupResult, setLastCleanupResult] = useState<CleanupResult | null>(
    null,
  );

  const initializeSession = useCallback((nextItems: SwipeItem[]) => {
    setItems(nextItems);
    setIndex(0);
    setDecisions([]);
    setUndoStack([]);
  }, []);

  const resetSession = useCallback(() => {
    setItems([]);
    setIndex(0);
    setDecisions([]);
    setUndoStack([]);
  }, []);

  const currentItem = items[index] ?? null;
  const nextItem = items[index + 1] ?? null;
  const isComplete = items.length > 0 && index >= items.length;

  const recordDecision = useCallback(
    (decision: SessionDecision) => {
      if (!currentItem) {
        return;
      }

      const entry: CleanupSessionItem = {
        assetId: currentItem.id,
        uri: currentItem.uri,
        filename: currentItem.filename,
        mediaType: currentItem.mediaType === 'video' ? 'video' : 'photo',
        fileSizeBytes: currentItem.fileSizeBytes,
        decision,
        decidedAt: Date.now(),
      };

      setDecisions((prev) => [...prev, entry]);
      setUndoStack((prev) => [...prev, { decision: entry, previousIndex: index }]);
      setIndex((prev) => prev + 1);
    },
    [currentItem, index],
  );

  const finishSession = useCallback(() => {
    setIndex((prev) => (items.length > 0 ? items.length : prev));
  }, [items.length]);

  const undoLastDecision = useCallback(() => {
    setUndoStack((prevStack) => {
      const last = prevStack[prevStack.length - 1];
      if (!last) {
        return prevStack;
      }

      setDecisions((prevDecisions) =>
        prevDecisions.filter((item) => item.assetId !== last.decision.assetId),
      );
      setIndex(last.previousIndex);

      return prevStack.slice(0, -1);
    });
  }, []);

  const markedForDeletion = useMemo(
    () => decisions.filter((item) => item.decision === 'delete'),
    [decisions],
  );

  const keptCount = useMemo(
    () => decisions.filter((item) => item.decision === 'keep').length,
    [decisions],
  );

  const value = useMemo(
    () => ({
      items,
      currentItem,
      nextItem,
      isComplete,
      progressCurrent: items.length > 0
        ? isComplete
          ? decisions.length
          : index + 1
        : 0,
      progressTotal: items.length,
      canUndo: undoStack.length > 0,
      markedForDeletion,
      keptCount,
      lastCleanupResult,
      initializeSession,
      recordDecision,
      finishSession,
      undoLastDecision,
      resetSession,
      setLastCleanupResult,
    }),
    [
      items,
      currentItem,
      nextItem,
      isComplete,
      index,
      undoStack.length,
      decisions.length,
      markedForDeletion,
      keptCount,
      lastCleanupResult,
      initializeSession,
      recordDecision,
      finishSession,
      undoLastDecision,
      resetSession,
    ],
  );

  return (
    <CleanupSessionContext.Provider value={value}>
      {children}
    </CleanupSessionContext.Provider>
  );
}

export function useCleanupSessionContext(): CleanupSessionContextValue {
  const context = useContext(CleanupSessionContext);
  if (!context) {
    throw new Error('useCleanupSessionContext must be used within CleanupSessionProvider');
  }
  return context;
}
