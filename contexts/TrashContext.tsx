import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  INSIGHTS_LARGEST_FILES,
  type InsightsLargestFile,
} from '@/constants/insightsData';
import { mockTrashItems, type TrashItem } from '@/constants/mockTrash';
import { useSettings } from '@/contexts/SettingsContext';
import type { CleanupSessionItem } from '@/types/cleanup';
import {
  createTrashItemFromLargestFile,
  createTrashItemFromSessionItem,
  mergeTrashItems,
} from '@/utils/trashHelpers';

interface TrashContextValue {
  items: TrashItem[];
  largestFiles: InsightsLargestFile[];
  addSessionItemsToTrash: (items: CleanupSessionItem[]) => void;
  moveLargestFilesToTrash: (files: InsightsLargestFile[]) => void;
  permanentlyDelete: (ids: string[]) => void;
  restoreFromTrash: (ids: string[]) => void;
}

const TrashContext = createContext<TrashContextValue | null>(null);

export function TrashProvider({ children }: { children: ReactNode }) {
  const { recoveryRetentionDays } = useSettings();
  const [items, setItems] = useState<TrashItem[]>(mockTrashItems);
  const [removedLargestFilenames, setRemovedLargestFilenames] = useState<Set<string>>(
    () => new Set(),
  );

  const largestFiles = useMemo(
    () => INSIGHTS_LARGEST_FILES.filter((file) => !removedLargestFilenames.has(file.filename)),
    [removedLargestFilenames],
  );

  const addSessionItemsToTrash = useCallback(
    (sessionItems: CleanupSessionItem[]) => {
      if (sessionItems.length === 0) {
        return;
      }

      const incoming = sessionItems.map((item) =>
        createTrashItemFromSessionItem(item, recoveryRetentionDays),
      );

      setItems((previous) => mergeTrashItems(previous, incoming));
    },
    [recoveryRetentionDays],
  );

  const moveLargestFilesToTrash = useCallback(
    (files: InsightsLargestFile[]) => {
      if (files.length === 0) {
        return;
      }

      const incoming = files.map((file) =>
        createTrashItemFromLargestFile(file, recoveryRetentionDays),
      );

      setItems((previous) => mergeTrashItems(previous, incoming));
      setRemovedLargestFilenames((previous) => {
        const next = new Set(previous);
        files.forEach((file) => next.add(file.filename));
        return next;
      });
    },
    [recoveryRetentionDays],
  );

  const permanentlyDelete = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    const idSet = new Set(ids);
    setItems((previous) => previous.filter((item) => !idSet.has(item.id)));
  }, []);

  const restoreFromTrash = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    const idSet = new Set(ids);
    const largestFilenames = new Set(INSIGHTS_LARGEST_FILES.map((file) => file.filename));
    let filenamesToRestore: string[] = [];

    setItems((previous) => {
      const removed = previous.filter((item) => idSet.has(item.id));
      filenamesToRestore = removed
        .map((item) => item.filename)
        .filter((filename) => largestFilenames.has(filename));

      return previous.filter((item) => !idSet.has(item.id));
    });

    if (filenamesToRestore.length > 0) {
      setRemovedLargestFilenames((previous) => {
        const next = new Set(previous);
        filenamesToRestore.forEach((filename) => next.delete(filename));
        return next;
      });
    }
  }, []);

  const value = useMemo<TrashContextValue>(
    () => ({
      items,
      largestFiles,
      addSessionItemsToTrash,
      moveLargestFilesToTrash,
      permanentlyDelete,
      restoreFromTrash,
    }),
    [
      items,
      largestFiles,
      addSessionItemsToTrash,
      moveLargestFilesToTrash,
      permanentlyDelete,
      restoreFromTrash,
    ],
  );

  return <TrashContext.Provider value={value}>{children}</TrashContext.Provider>;
}

export function useTrash() {
  const context = useContext(TrashContext);
  if (!context) {
    throw new Error('useTrash must be used within TrashProvider');
  }
  return context;
}
