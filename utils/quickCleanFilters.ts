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
    case 'blurryPhotos':
      return 'Blurry Photos';
    case 'favorites':
      return 'Favorites';
  }
}

function isScreenshot(item: SwipeItem): boolean {
  return /screenshot|screen shot|screen_shot|\.png$/i.test(item.filename);
}

export function isLargeVideo(item: SwipeItem): boolean {
  return item.mediaType === 'video' && item.fileSizeBytes >= LARGE_VIDEO_BYTES;
}

export function isDuplicateCandidate(item: SwipeItem): boolean {
  return (
    /\(1\)|\(2\)|copy|duplicate/i.test(item.filename) || item.id.includes('dup')
  );
}

export function isBlurryPhotoCandidate(item: SwipeItem): boolean {
  if (item.mediaType !== 'photo') {
    return false;
  }

  if (item.width <= 0 || item.height <= 0) {
    return false;
  }

  return item.width * item.height < 400_000;
}

export { isScreenshot };

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
    default:
      return items;
  }
}

export function countAssetsByCategory(
  items: SwipeItem[],
  category: QuickCleanCategoryKey,
): number {
  return filterAssetsByCategory(items, category).length;
}
