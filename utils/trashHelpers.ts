import type { InsightsLargestFile } from '@/constants/insightsData';
import type { CleanupSessionItem } from '@/types/cleanup';
import type { TrashItem } from '@/types/trash';
import type { SwipeItem } from '@/types/media';

export function createTrashItemFromLargestFile(
  file: InsightsLargestFile,
  daysLeft: number,
): TrashItem {
  return {
    id: `largest-${file.filename}`,
    assetId: file.filename,
    uri: file.thumbnailUri,
    thumbnailUri: file.thumbnailUri,
    filename: file.filename,
    mediaType: file.mediaType,
    fileSizeBytes: file.bytes,
    daysLeft,
  };
}

export function createTrashItemFromSwipeItem(
  item: SwipeItem,
  thumbnailUri: string,
  daysLeft: number,
): TrashItem {
  return {
    id: `session-${item.id}`,
    assetId: item.id,
    uri: item.uri,
    thumbnailUri,
    filename: item.filename,
    mediaType: item.mediaType === 'video' ? 'video' : 'photo',
    fileSizeBytes: item.fileSizeBytes,
    daysLeft,
  };
}

export function createTrashItemFromSessionItem(
  item: CleanupSessionItem,
  thumbnailUri: string,
  daysLeft: number,
): TrashItem {
  return {
    id: `session-${item.assetId}`,
    assetId: item.assetId,
    uri: item.uri,
    thumbnailUri,
    filename: item.filename,
    mediaType: item.mediaType,
    fileSizeBytes: item.fileSizeBytes,
    daysLeft,
  };
}

export function mergeTrashItems(existing: TrashItem[], incoming: TrashItem[]): TrashItem[] {
  const seen = new Set(existing.map((item) => item.id));
  const uniqueIncoming = incoming.filter((item) => !seen.has(item.id));
  return [...uniqueIncoming, ...existing];
}

export function getTrashedAssetIds(items: TrashItem[]): Set<string> {
  return new Set(items.map((item) => item.assetId));
}
