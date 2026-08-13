import * as MediaLibrary from 'expo-media-library';

import type { LibrarySummary } from '@/types/cleanup';
import type { MediaAlbum, PhotoAccess, SwipeItem } from '@/types/media';
import {
  fetchAlbumAssets,
  fetchCleaningAssets,
  fetchHiddenAssetIds,
  fetchMediaAlbums,
  normalizePhotoAccess,
  sortSwipeItemsByRecency,
} from '@/utils/mediaHelpers';
import {
  MediaLibraryAccessError,
  runMediaLibraryCall,
} from '@/utils/mediaLibraryAvailability';

import { resolveMediaThumbnailUri } from '@/constants/demoVideo';
import { mockLibrarySummary } from '@/constants/mockLibraryStats';
import { mockAlbumAssetIds, mockAlbums } from '@/constants/mockAlbums';
import { mockSwipeItems } from '@/constants/mockMediaAssets';
import { scanMediaLibrarySummary } from '@/services/libraryScanService';
import { filterHiddenAssets } from '@/utils/assetFilters';

export interface PhotoAccessResult {
  granted: boolean;
  access: PhotoAccess;
  blockedReason?: MediaLibraryAccessError['reason'];
}

export function getDemoCleaningAssets(skipHiddenItems = false): SwipeItem[] {
  return sortSwipeItemsByRecency(filterHiddenAssets(mockSwipeItems, skipHiddenItems));
}

export function getDemoAlbums(): MediaAlbum[] {
  const assetsById = new Map(mockSwipeItems.map((item) => [item.id, item]));

  return mockAlbums.map((album) => {
    const firstAssetId = mockAlbumAssetIds[album.id]?.[0];
    const coverAsset = firstAssetId ? assetsById.get(firstAssetId) : undefined;

    return {
      ...album,
      coverUri: coverAsset?.uri
        ? resolveMediaThumbnailUri(coverAsset.uri)
        : null,
    };
  });
}

export function getDemoAlbumAssets(albumId: string, skipHiddenItems = false): SwipeItem[] {
  const assetIds = mockAlbumAssetIds[albumId] ?? [];
  const assetsById = new Map(mockSwipeItems.map((item) => [item.id, item]));

  return filterHiddenAssets(
    assetIds
      .map((id) => assetsById.get(id))
      .filter((item): item is SwipeItem => item !== undefined),
    skipHiddenItems,
  );
}

export function getDemoLibrarySummary(): LibrarySummary {
  return mockLibrarySummary;
}

export async function getPhotoAccess(): Promise<PhotoAccessResult> {
  try {
    const response = await runMediaLibraryCall(() =>
      MediaLibrary.getPermissionsAsync(false, ['photo', 'video']),
    );
    const access = normalizePhotoAccess(response);

    return {
      granted: access !== 'denied',
      access,
    };
  } catch (error) {
    if (error instanceof MediaLibraryAccessError) {
      return {
        granted: false,
        access: 'denied',
        blockedReason: error.reason,
      };
    }

    throw error;
  }
}

export async function requestPhotoAccess(): Promise<PhotoAccessResult> {
  try {
    const response = await runMediaLibraryCall(() =>
      MediaLibrary.requestPermissionsAsync(false, ['photo', 'video']),
    );
    const access = normalizePhotoAccess(response);

    return {
      granted: access !== 'denied',
      access,
    };
  } catch (error) {
    if (error instanceof MediaLibraryAccessError) {
      return {
        granted: false,
        access: 'denied',
        blockedReason: error.reason,
      };
    }

    throw error;
  }
}

export async function presentLimitedLibraryPicker(): Promise<void> {
  await runMediaLibraryCall(() =>
    MediaLibrary.presentPermissionsPickerAsync(['photo', 'video']),
  );
}

export async function loadAssetsForCleaning(skipHiddenItems = false): Promise<SwipeItem[]> {
  const assets = await runMediaLibraryCall(() => fetchCleaningAssets());

  if (!skipHiddenItems) {
    return assets;
  }

  const hiddenIds = await runMediaLibraryCall(() => fetchHiddenAssetIds());
  return assets.filter((asset) => !hiddenIds.has(asset.id));
}

export async function loadAssetsForAlbum(
  albumId: string,
  skipHiddenItems = false,
): Promise<SwipeItem[]> {
  const assets = await runMediaLibraryCall(() => fetchAlbumAssets(albumId));

  if (!skipHiddenItems) {
    return assets;
  }

  const hiddenIds = await runMediaLibraryCall(() => fetchHiddenAssetIds());
  return assets.filter((asset) => !hiddenIds.has(asset.id));
}

export async function fetchAlbums(skipHiddenAlbums = false): Promise<MediaAlbum[]> {
  return runMediaLibraryCall(() => fetchMediaAlbums(skipHiddenAlbums));
}

export async function fetchLibrarySummary(
  skipHiddenItems = false,
): Promise<LibrarySummary | null> {
  const access = await getPhotoAccess();
  if (!access.granted) {
    return null;
  }

  return scanMediaLibrarySummary({ skipHiddenItems });
}

export { MediaLibraryAccessError };
