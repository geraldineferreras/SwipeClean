import type { SwipeItem } from '@/types/media';

/** Demo helper — deterministic similar-photo count for UI mockups. */
export function getSimilarPhotoCount(item: SwipeItem): number {
  const hash = item.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

  if (hash % 4 === 0) {
    return 3;
  }

  if (hash % 7 === 0) {
    return 2;
  }

  return 0;
}
