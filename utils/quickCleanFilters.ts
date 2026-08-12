import type { QuickCleanCategoryKey } from '@/types/cleanup';
import type { SwipeItem } from '@/types/media';

export const LARGE_VIDEO_BYTES = 20 * 1024 ** 2;

const QUICK_CLEAN_CATEGORY_KEYS: QuickCleanCategoryKey[] = [
  'screenshots',
  'duplicates',
  'largeVideos',
];

export function isQuickCleanCategory(value: string): value is QuickCleanCategoryKey {
  return QUICK_CLEAN_CATEGORY_KEYS.includes(value as QuickCleanCategoryKey);
}

export function getQuickCleanCategoryLabel(category: QuickCleanCategoryKey): string {
  switch (category) {
    case 'screenshots':
      return 'Screenshots';
    case 'duplicates':
      return 'Duplicates';
    case 'largeVideos':
      return 'Large Videos';
  }
}

function isScreenshot(item: SwipeItem): boolean {
  return /screenshot|screen shot|\.png$/i.test(item.filename);
}

function isLargeVideo(item: SwipeItem): boolean {
  return item.mediaType === 'video' && item.fileSizeBytes >= LARGE_VIDEO_BYTES;
}

function isDuplicateCandidate(item: SwipeItem): boolean {
  return (
    /\(1\)|\(2\)|copy|duplicate/i.test(item.filename) || item.id.includes('dup')
  );
}

export function filterAssetsByCategory(
  items: SwipeItem[],
  category: QuickCleanCategoryKey,
): SwipeItem[] {
  switch (category) {
    case 'screenshots':
      return items.filter(isScreenshot);
    case 'largeVideos':
      return items.filter(isLargeVideo);
    case 'duplicates':
      return items.filter(isDuplicateCandidate);
  }
}

export function countAssetsByCategory(
  items: SwipeItem[],
  category: QuickCleanCategoryKey,
): number {
  return filterAssetsByCategory(items, category).length;
}
