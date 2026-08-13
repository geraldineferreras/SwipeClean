import type { InsightsLargestFile } from '@/constants/insightsData';
import type { SwipeItem } from '@/types/media';
import { formatDuration } from '@/utils/formatDuration';

export interface LibraryInsightStats {
  oldestMediaTimestamp: number | null;
  highestResolutionMegapixels: number;
  highestResolutionPhotoCount: number;
  largestFiles: InsightsLargestFile[];
}

export function computeLibraryInsightStats(assets: SwipeItem[]): LibraryInsightStats {
  let oldestMediaTimestamp: number | null = null;
  let highestResolutionMegapixels = 0;
  let highestResolutionPhotoCount = 0;

  for (const asset of assets) {
    if (oldestMediaTimestamp === null || asset.creationTime < oldestMediaTimestamp) {
      oldestMediaTimestamp = asset.creationTime;
    }

    if (asset.mediaType === 'photo') {
      const megapixels = (asset.width * asset.height) / 1_000_000;
      if (megapixels > highestResolutionMegapixels) {
        highestResolutionMegapixels = megapixels;
        highestResolutionPhotoCount = 1;
      } else if (Math.abs(megapixels - highestResolutionMegapixels) < 0.05) {
        highestResolutionPhotoCount += 1;
      }
    }
  }

  return {
    oldestMediaTimestamp,
    highestResolutionMegapixels,
    highestResolutionPhotoCount,
    largestFiles: buildLargestFilesFromAssets(assets),
  };
}

export function buildLargestFilesFromAssets(
  assets: SwipeItem[],
  limit = 10,
): InsightsLargestFile[] {
  return [...assets]
    .sort((left, right) => right.fileSizeBytes - left.fileSizeBytes)
    .slice(0, limit)
    .map((asset) => ({
      filename: asset.filename,
      bytes: asset.fileSizeBytes,
      mediaType: asset.mediaType === 'video' ? 'video' : 'photo',
      thumbnailUri: asset.uri,
      duration:
        asset.mediaType === 'video' && asset.duration > 0
          ? formatDuration(asset.duration)
          : undefined,
      is4k: asset.width >= 3840 || asset.height >= 2160,
    }));
}

export function formatLibraryAge(timestamp: number | null): string {
  if (timestamp === null) {
    return '—';
  }

  const ageMs = Date.now() - timestamp;
  const years = ageMs / (365.25 * 24 * 60 * 60 * 1000);

  if (years >= 1) {
    return `${years.toFixed(1)} yrs`;
  }

  const months = years * 12;
  if (months >= 1) {
    return `${Math.round(months)} mo`;
  }

  const days = ageMs / (24 * 60 * 60 * 1000);
  return `${Math.max(1, Math.round(days))} d`;
}
