import * as MediaLibrary from 'expo-media-library';

import { getDeviceStorageInfo } from '@/services/deviceStorageService';
import {
  loadCachedLibrarySummary,
  saveCachedLibrarySummary,
} from '@/services/librarySummaryCache';
import type { LibrarySummary } from '@/types/cleanup';
import type { SwipeItem } from '@/types/media';
import { estimateAssetSizeBytes } from '@/utils/assetSizeEstimation';
import { isHiddenAlbumTitle } from '@/utils/assetFilters';
import {
  analyzeAssets,
  calculatePotentialSavingsFromBytes,
  createEmptyQuickCleanCounts,
} from '@/utils/libraryAnalysis';
import { computeLibraryInsightStats } from '@/utils/libraryInsights';
import {
  mapAssetToSwipeItem,
  resolveFileSizeBytesWithSource,
} from '@/utils/mediaHelpers';

const SCAN_PAGE_SIZE = 500;
const SIZE_LOOKUP_CONCURRENCY = 12;
const SIZE_SAMPLE_PHOTOS = 80;
const SIZE_SAMPLE_VIDEOS = 30;
const LARGEST_FILE_LOOKUP_COUNT = 12;
const SCAN_CACHE_TTL_MS = 5 * 60_000;

interface ScanCacheEntry {
  key: string;
  summary: LibrarySummary;
  timestamp: number;
}

interface SizedScanResult {
  items: SwipeItem[];
  measuredAssetCount: number;
  estimatedAssetCount: number;
}

let scanCache: ScanCacheEntry | null = null;

function mapAssetsWithEstimates(assets: MediaLibrary.Asset[]): SwipeItem[] {
  return assets.map((asset) =>
    mapAssetToSwipeItem(asset, estimateAssetSizeBytes(asset)),
  );
}

function pickSampleIndices(
  items: SwipeItem[],
  mediaType: 'photo' | 'video',
  maxSamples: number,
): number[] {
  const indices: number[] = [];

  for (let index = 0; index < items.length; index += 1) {
    if (items[index].mediaType === mediaType) {
      indices.push(index);
    }
  }

  if (indices.length <= maxSamples) {
    return indices;
  }

  const picked: number[] = [];
  const step = indices.length / maxSamples;

  for (let index = 0; index < maxSamples; index += 1) {
    picked.push(indices[Math.floor(index * step)]);
  }

  return picked;
}

async function measureSampleSizes(
  rawAssets: MediaLibrary.Asset[],
  sampleIndices: number[],
): Promise<Map<number, number>> {
  const measuredByIndex = new Map<number, number>();

  for (let start = 0; start < sampleIndices.length; start += SIZE_LOOKUP_CONCURRENCY) {
    const batch = sampleIndices.slice(start, start + SIZE_LOOKUP_CONCURRENCY);
    await Promise.all(
      batch.map(async (index) => {
        const resolved = await resolveFileSizeBytesWithSource(rawAssets[index]);
        measuredByIndex.set(index, resolved.bytes);
      }),
    );
  }

  return measuredByIndex;
}

function computeCalibrationFactor(
  indices: number[],
  estimatedItems: SwipeItem[],
  measuredByIndex: Map<number, number>,
): number {
  let measuredTotal = 0;
  let estimatedTotal = 0;

  for (const index of indices) {
    measuredTotal += measuredByIndex.get(index) ?? estimatedItems[index].fileSizeBytes;
    estimatedTotal += estimatedItems[index].fileSizeBytes;
  }

  return estimatedTotal > 0 ? measuredTotal / estimatedTotal : 1;
}

async function calibrateAssetSizes(
  rawAssets: MediaLibrary.Asset[],
  estimatedItems: SwipeItem[],
): Promise<SizedScanResult> {
  const photoSampleIndices = pickSampleIndices(estimatedItems, 'photo', SIZE_SAMPLE_PHOTOS);
  const videoSampleIndices = pickSampleIndices(estimatedItems, 'video', SIZE_SAMPLE_VIDEOS);
  const sampleIndices = [...new Set([...photoSampleIndices, ...videoSampleIndices])];
  const measuredByIndex = await measureSampleSizes(rawAssets, sampleIndices);

  const photoFactor = computeCalibrationFactor(
    photoSampleIndices,
    estimatedItems,
    measuredByIndex,
  );
  const videoFactor = computeCalibrationFactor(
    videoSampleIndices,
    estimatedItems,
    measuredByIndex,
  );

  const items = estimatedItems.map((item, index) => {
    const measured = measuredByIndex.get(index);
    if (measured !== undefined) {
      return { ...item, fileSizeBytes: measured };
    }

    const factor = item.mediaType === 'video' ? videoFactor : photoFactor;
    return {
      ...item,
      fileSizeBytes: Math.round(item.fileSizeBytes * factor),
    };
  });

  const topCandidateIndices = [...items.keys()]
    .sort((left, right) => items[right].fileSizeBytes - items[left].fileSizeBytes)
    .slice(0, LARGEST_FILE_LOOKUP_COUNT);

  const unresolvedTopIndices = topCandidateIndices.filter((index) => !measuredByIndex.has(index));
  const topMeasured = await measureSampleSizes(rawAssets, unresolvedTopIndices);
  topMeasured.forEach((bytes, index) => {
    measuredByIndex.set(index, bytes);
    items[index] = { ...items[index], fileSizeBytes: bytes };
  });

  return {
    items,
    measuredAssetCount: measuredByIndex.size,
    estimatedAssetCount: Math.max(items.length - measuredByIndex.size, 0),
  };
}

async function fetchFavoriteAssetIds(): Promise<Set<string>> {
  try {
    const albums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });
    const favoritesAlbum = albums.find((album) => {
      const title = album.title.trim().toLowerCase();
      return title === 'favorites' || title === 'favourites';
    });

    if (!favoritesAlbum) {
      return new Set();
    }

    const favoriteIds = new Set<string>();
    let after: string | undefined;
    let hasNextPage = true;

    while (hasNextPage) {
      const page = await MediaLibrary.getAssetsAsync({
        album: favoritesAlbum.id,
        first: SCAN_PAGE_SIZE,
        after,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      });

      page.assets.forEach((asset) => favoriteIds.add(asset.id));
      after = page.endCursor;
      hasNextPage = page.hasNextPage;
    }

    return favoriteIds;
  } catch {
    return new Set();
  }
}

async function fetchHiddenAssetIds(): Promise<Set<string>> {
  try {
    const albums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });
    const hiddenAlbum = albums.find((album) => isHiddenAlbumTitle(album.title));

    if (!hiddenAlbum) {
      return new Set();
    }

    const hiddenIds = new Set<string>();
    let after: string | undefined;
    let hasNextPage = true;

    while (hasNextPage) {
      const page = await MediaLibrary.getAssetsAsync({
        album: hiddenAlbum.id,
        first: SCAN_PAGE_SIZE,
        after,
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      });

      page.assets.forEach((asset) => hiddenIds.add(asset.id));
      after = page.endCursor;
      hasNextPage = page.hasNextPage;
    }

    return hiddenIds;
  } catch {
    return new Set();
  }
}

export async function scanMediaLibrarySummary(options: {
  skipHiddenItems?: boolean;
  force?: boolean;
}): Promise<LibrarySummary> {
  const cacheKey = options.skipHiddenItems ? 'skip-hidden' : 'include-hidden';
  const now = Date.now();

  if (
    !options.force &&
    scanCache &&
    scanCache.key === cacheKey &&
    now - scanCache.timestamp < SCAN_CACHE_TTL_MS
  ) {
    return scanCache.summary;
  }

  const [photoPage, videoPage, deviceStorage, favoriteAssetIds, hiddenAssetIds] =
    await Promise.all([
      MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: MediaLibrary.MediaType.photo,
      }),
      MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: MediaLibrary.MediaType.video,
      }),
      getDeviceStorageInfo(),
      fetchFavoriteAssetIds(),
      options.skipHiddenItems ? fetchHiddenAssetIds() : Promise.resolve(new Set<string>()),
    ]);

  const rawAssets: MediaLibrary.Asset[] = [];
  const estimatedItems: SwipeItem[] = [];
  let after: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const page = await MediaLibrary.getAssetsAsync({
      first: SCAN_PAGE_SIZE,
      after,
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });

    const visibleAssets = page.assets.filter((asset) => !hiddenAssetIds.has(asset.id));
    rawAssets.push(...visibleAssets);
    estimatedItems.push(...mapAssetsWithEstimates(visibleAssets));

    after = page.endCursor;
    hasNextPage = page.hasNextPage;
  }

  const sizedScan = await calibrateAssetSizes(rawAssets, estimatedItems);
  const scannedAssets = sizedScan.items;
  const analysis = analyzeAssets(scannedAssets, favoriteAssetIds);
  const storageUsedBytes = scannedAssets.reduce((sum, asset) => sum + asset.fileSizeBytes, 0);
  const photoStorageBytes = scannedAssets.reduce(
    (sum, asset) => sum + (asset.mediaType === 'photo' ? asset.fileSizeBytes : 0),
    0,
  );
  const videoStorageBytes = scannedAssets.reduce(
    (sum, asset) => sum + (asset.mediaType === 'video' ? asset.fileSizeBytes : 0),
    0,
  );
  const insightStats = computeLibraryInsightStats(scannedAssets);
  const expectedAssetCount = photoPage.totalCount + videoPage.totalCount;

  const summary: LibrarySummary = {
    photoCount: photoPage.totalCount,
    videoCount: videoPage.totalCount,
    otherCount: 0,
    storageUsedBytes,
    photoStorageBytes,
    videoStorageBytes,
    totalStorageBytes: deviceStorage.totalBytes,
    deviceUsedBytes: deviceStorage.usedBytes,
    deviceFreeBytes: deviceStorage.freeBytes,
    potentialSavingsBytes: calculatePotentialSavingsFromBytes(analysis.bytes),
    quickClean: analysis.counts,
    quickCleanBytes: analysis.bytes,
    scannedAssetCount: scannedAssets.length,
    measuredAssetCount: sizedScan.measuredAssetCount,
    estimatedAssetCount: sizedScan.estimatedAssetCount,
    isPartialScan: scannedAssets.length < expectedAssetCount,
    oldestMediaTimestamp: insightStats.oldestMediaTimestamp,
    highestResolutionMegapixels: insightStats.highestResolutionMegapixels,
    highestResolutionPhotoCount: insightStats.highestResolutionPhotoCount,
    largestFiles: insightStats.largestFiles,
  };

  scanCache = {
    key: cacheKey,
    summary,
    timestamp: now,
  };

  void saveCachedLibrarySummary(summary, options.skipHiddenItems ?? false);

  return summary;
}

export function invalidateLibraryScanCache(): void {
  scanCache = null;
}

export async function getCachedLibrarySummary(
  skipHiddenItems = false,
): Promise<LibrarySummary | null> {
  const cacheKey = skipHiddenItems ? 'skip-hidden' : 'include-hidden';
  const now = Date.now();

  if (
    scanCache &&
    scanCache.key === cacheKey &&
    now - scanCache.timestamp < SCAN_CACHE_TTL_MS
  ) {
    return scanCache.summary;
  }

  return loadCachedLibrarySummary(skipHiddenItems);
}

export async function calculateStorageUsedBytes(skipHiddenItems = false): Promise<number> {
  const summary = await scanMediaLibrarySummary({ skipHiddenItems });
  return summary.storageUsedBytes;
}

export async function calculatePotentialSavingsBytes(
  skipHiddenItems = false,
): Promise<number> {
  const summary = await scanMediaLibrarySummary({ skipHiddenItems });
  return summary.potentialSavingsBytes;
}
