import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  INSIGHTS_LARGEST_FILES,
  type InsightsLargestFile,
} from '@/constants/insightsData';
import { useSettings } from '@/contexts/SettingsContext';
import { deleteMarkedAssets } from '@/services/deletionService';
import { invalidateLibraryScanCache } from '@/services/libraryScanService';
import { loadCachedTrashItems, saveCachedTrashItems } from '@/services/trashCache';
import type { CleanupSessionItem } from '@/types/cleanup';
import type { TrashItem } from '@/types/trash';
import type { SwipeItem } from '@/types/media';
import { resolveAssetDisplayUri } from '@/utils/mediaHelpers';
import {
  createTrashItemFromLargestFile,
  createTrashItemFromSessionItem,
  createTrashItemFromSwipeItem,
  getTrashedAssetIds,
  mergeTrashItems,
} from '@/utils/trashHelpers';

interface TrashContextValue {
  items: TrashItem[];
  trashedAssetIds: Set<string>;
  largestFiles: InsightsLargestFile[];
  moveItemsToTrash: (items: SwipeItem[]) => Promise<{ movedCount: number; errors: string[] }>;
  addSessionItemsToTrash: (
    items: CleanupSessionItem[],
    thumbnailUris?: Record<string, string>,
  ) => void;
  moveLargestFilesToTrash: (files: InsightsLargestFile[]) => void;
  permanentlyDelete: (ids: string[]) => Promise<void>;
  restoreFromTrash: (ids: string[]) => number;
  restoreAllFromTrash: () => number;
}

const TrashContext = createContext<TrashContextValue | null>(null);

export function TrashProvider({ children }: { children: ReactNode }) {
  const { recoveryRetentionDays } = useSettings();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [removedLargestFilenames, setRemovedLargestFilenames] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    void loadCachedTrashItems().then((cached) => {
      if (cached) {
        setItems(cached);
      }
    });
  }, []);

  useEffect(() => {
    void saveCachedTrashItems(items);
  }, [items]);

  const trashedAssetIds = useMemo(() => getTrashedAssetIds(items), [items]);

  const largestFiles = useMemo(
    () => INSIGHTS_LARGEST_FILES.filter((file) => !removedLargestFilenames.has(file.filename)),
    [removedLargestFilenames],
  );

  useEffect(() => {
    setItems((previous) =>
      previous.map((item) => ({
        ...item,
        daysLeft: recoveryRetentionDays,
      })),
    );
  }, [recoveryRetentionDays]);

  const moveItemsToTrash = useCallback(
    async (swipeItems: SwipeItem[]) => {
      if (swipeItems.length === 0) {
        return { movedCount: 0, errors: [] };
      }

      const thumbnailEntries = await Promise.all(
        swipeItems.map(async (item) => ({
          item,
          thumbnailUri: await resolveAssetDisplayUri(item),
        })),
      );

      const incoming = thumbnailEntries.map(({ item, thumbnailUri }) =>
        createTrashItemFromSwipeItem(item, thumbnailUri, recoveryRetentionDays),
      );

      setItems((previous) => mergeTrashItems(previous, incoming));
      invalidateLibraryScanCache();

      return { movedCount: incoming.length, errors: [] };
    },
    [recoveryRetentionDays],
  );

  const addSessionItemsToTrash = useCallback(
    (sessionItems: CleanupSessionItem[], thumbnailUris: Record<string, string> = {}) => {
      if (sessionItems.length === 0) {
        return;
      }

      const incoming = sessionItems.map((item) =>
        createTrashItemFromSessionItem(
          item,
          thumbnailUris[item.assetId] ?? item.uri,
          recoveryRetentionDays,
        ),
      );

      setItems((previous) => mergeTrashItems(previous, incoming));
      invalidateLibraryScanCache();
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

  const permanentlyDelete = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    const idSet = new Set(ids);
    const itemsToDelete = items.filter((item) => idSet.has(item.id));
    const assetIds = itemsToDelete.map((item) => item.assetId).filter(Boolean);

    if (assetIds.length > 0) {
      await deleteMarkedAssets(assetIds);
    }

    setItems((previous) => previous.filter((item) => !idSet.has(item.id)));
    invalidateLibraryScanCache();
  }, [items]);

  const restoreFromTrash = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      return 0;
    }

    const idSet = new Set(ids);
    const largestFilenames = new Set(INSIGHTS_LARGEST_FILES.map((file) => file.filename));
    let restoredCount = 0;
    let filenamesToRestore: string[] = [];

    setItems((previous) => {
      const removed = previous.filter((item) => idSet.has(item.id));
      restoredCount = removed.length;
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

    if (restoredCount > 0) {
      invalidateLibraryScanCache();
    }

    return restoredCount;
  }, []);

  const restoreAllFromTrash = useCallback(() => {
    let restoredCount = 0;

    setItems((previous) => {
      restoredCount = previous.length;
      return [];
    });

    setRemovedLargestFilenames(new Set());

    if (restoredCount > 0) {
      invalidateLibraryScanCache();
    }

    return restoredCount;
  }, []);

  const value = useMemo<TrashContextValue>(
    () => ({
      items,
      trashedAssetIds,
      largestFiles,
      moveItemsToTrash,
      addSessionItemsToTrash,
      moveLargestFilesToTrash,
      permanentlyDelete,
      restoreFromTrash,
      restoreAllFromTrash,
    }),
    [
      items,
      trashedAssetIds,
      largestFiles,
      moveItemsToTrash,
      addSessionItemsToTrash,
      moveLargestFilesToTrash,
      permanentlyDelete,
      restoreFromTrash,
      restoreAllFromTrash,
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
