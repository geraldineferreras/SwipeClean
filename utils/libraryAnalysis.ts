import type { QuickCleanCounts } from '@/types/cleanup';
import type { SwipeItem } from '@/types/media';

import {
  isBlurryPhotoCandidate,
  isDuplicateCandidate,
  isLargeVideo,
  isScreenshot,
} from '@/utils/quickCleanFilters';

export interface CategoryAnalysis {
  counts: QuickCleanCounts;
  bytes: QuickCleanCounts;
}

export function createEmptyQuickCleanCounts(): QuickCleanCounts {
  return {
    screenshots: 0,
    duplicates: 0,
    largeVideos: 0,
    blurryPhotos: 0,
    favorites: 0,
  };
}

export function analyzeAssets(
  assets: SwipeItem[],
  favoriteAssetIds: Set<string> = new Set(),
): CategoryAnalysis {
  const counts = createEmptyQuickCleanCounts();
  const bytes = createEmptyQuickCleanCounts();

  for (const asset of assets) {
    if (isScreenshot(asset)) {
      counts.screenshots += 1;
      bytes.screenshots += asset.fileSizeBytes;
    }

    if (isDuplicateCandidate(asset)) {
      counts.duplicates += 1;
      bytes.duplicates += asset.fileSizeBytes;
    }

    if (isLargeVideo(asset)) {
      counts.largeVideos += 1;
      bytes.largeVideos += asset.fileSizeBytes;
    }

    if (isBlurryPhotoCandidate(asset)) {
      counts.blurryPhotos += 1;
      bytes.blurryPhotos += asset.fileSizeBytes;
    }

    if (favoriteAssetIds.has(asset.id)) {
      counts.favorites += 1;
      bytes.favorites += asset.fileSizeBytes;
    }
  }

  return { counts, bytes };
}

export function calculatePotentialSavingsFromBytes(bytes: QuickCleanCounts): number {
  return bytes.screenshots + bytes.duplicates + bytes.largeVideos;
}
