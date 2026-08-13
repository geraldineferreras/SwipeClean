import type { InsightsLargestFile } from '@/constants/insightsData';
import type { TrashItem } from '@/constants/mockTrash';
import type { CleanupSessionItem } from '@/types/cleanup';

export function createTrashItemFromLargestFile(
  file: InsightsLargestFile,
  daysLeft: number,
): TrashItem {
  return {
    id: `largest-${file.filename}`,
    uri: file.thumbnailUri,
    filename: file.filename,
    mediaType: file.mediaType,
    fileSizeBytes: file.bytes,
    daysLeft,
  };
}

export function createTrashItemFromSessionItem(
  item: CleanupSessionItem,
  daysLeft: number,
): TrashItem {
  return {
    id: `session-${item.assetId}`,
    uri: item.uri,
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
