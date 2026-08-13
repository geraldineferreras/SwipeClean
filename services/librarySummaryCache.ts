import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LibrarySummary } from '@/types/cleanup';

const CACHE_KEY = 'swipeclean.library-summary.v4';

function normalizeLibrarySummary(raw: Partial<LibrarySummary>): LibrarySummary {
  return {
    photoCount: raw.photoCount ?? 0,
    videoCount: raw.videoCount ?? 0,
    otherCount: raw.otherCount ?? 0,
    storageUsedBytes: raw.storageUsedBytes ?? 0,
    photoStorageBytes: raw.photoStorageBytes ?? 0,
    videoStorageBytes: raw.videoStorageBytes ?? 0,
    totalStorageBytes: raw.totalStorageBytes ?? 64 * 1024 ** 3,
    deviceUsedBytes: raw.deviceUsedBytes ?? 0,
    deviceFreeBytes:
      raw.deviceFreeBytes ??
      Math.max((raw.totalStorageBytes ?? 0) - (raw.deviceUsedBytes ?? 0), 0),
    potentialSavingsBytes: raw.potentialSavingsBytes ?? 0,
    quickClean: raw.quickClean ?? {
      screenshots: 0,
      duplicates: 0,
      largeVideos: 0,
      blurryPhotos: 0,
      favorites: 0,
    },
    quickCleanBytes: raw.quickCleanBytes ?? {
      screenshots: 0,
      duplicates: 0,
      largeVideos: 0,
      blurryPhotos: 0,
      favorites: 0,
    },
    scannedAssetCount: raw.scannedAssetCount ?? 0,
    measuredAssetCount: raw.measuredAssetCount ?? 0,
    estimatedAssetCount: raw.estimatedAssetCount ?? 0,
    isPartialScan: raw.isPartialScan ?? false,
    oldestMediaTimestamp: raw.oldestMediaTimestamp ?? null,
    highestResolutionMegapixels: raw.highestResolutionMegapixels ?? 0,
    highestResolutionPhotoCount: raw.highestResolutionPhotoCount ?? 0,
    largestFiles: raw.largestFiles ?? [],
  };
}

export async function loadCachedLibrarySummary(
  skipHiddenItems: boolean,
): Promise<LibrarySummary | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_KEY}.${skipHiddenItems ? 'hidden' : 'all'}`);
    if (!raw) {
      return null;
    }

    return normalizeLibrarySummary(JSON.parse(raw) as Partial<LibrarySummary>);
  } catch {
    return null;
  }
}

export async function saveCachedLibrarySummary(
  summary: LibrarySummary,
  skipHiddenItems: boolean,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${CACHE_KEY}.${skipHiddenItems ? 'hidden' : 'all'}`,
      JSON.stringify(summary),
    );
  } catch {
    // Cache is best-effort.
  }
}

export async function clearCachedLibrarySummary(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      `${CACHE_KEY}.hidden`,
      `${CACHE_KEY}.all`,
      'swipeclean.library-summary.v1.hidden',
      'swipeclean.library-summary.v1.all',
      'swipeclean.library-summary.v2.hidden',
      'swipeclean.library-summary.v2.all',
      'swipeclean.library-summary.v3.hidden',
      'swipeclean.library-summary.v3.all',
    ]);
  } catch {
    // Cache is best-effort.
  }
}
