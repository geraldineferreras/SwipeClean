import * as MediaLibrary from 'expo-media-library';

import type { LibrarySummary } from '@/types/cleanup';
import type { MediaAlbum, PhotoAccess, SwipeItem } from '@/types/media';
import {
  fetchAlbumAssets,
  fetchCleaningAssets,
  fetchLibraryCounts,
  fetchMediaAlbums,
  normalizePhotoAccess,
} from '@/utils/mediaHelpers';
import {
  MediaLibraryAccessError,
  runMediaLibraryCall,
} from '@/utils/mediaLibraryAvailability';

import { resolveMediaThumbnailUri } from '@/constants/demoVideo';
import { mockLibrarySummary } from '@/constants/mockLibraryStats';
import { mockAlbumAssetIds, mockAlbums } from '@/constants/mockAlbums';
import { mockSwipeItems } from '@/constants/mockMediaAssets';

export interface PhotoAccessResult {
  granted: boolean;
  access: PhotoAccess;
  blockedReason?: MediaLibraryAccessError['reason'];
}

export function getDemoCleaningAssets(): SwipeItem[] {
  return mockSwipeItems;
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

export function getDemoAlbumAssets(albumId: string): SwipeItem[] {
  const assetIds = mockAlbumAssetIds[albumId] ?? [];
  const assetsById = new Map(mockSwipeItems.map((item) => [item.id, item]));

  return assetIds
    .map((id) => assetsById.get(id))
    .filter((item): item is SwipeItem => item !== undefined);
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

export async function loadAssetsForCleaning(): Promise<SwipeItem[]> {
  return runMediaLibraryCall(() => fetchCleaningAssets());
}

export async function loadAssetsForAlbum(albumId: string): Promise<SwipeItem[]> {
  return runMediaLibraryCall(() => fetchAlbumAssets(albumId));
}

export async function fetchAlbums(): Promise<MediaAlbum[]> {
  return runMediaLibraryCall(() => fetchMediaAlbums());
}

export async function fetchLibrarySummary(): Promise<LibrarySummary | null> {
  const access = await getPhotoAccess();
  if (!access.granted) {
    return null;
  }

  const counts = await runMediaLibraryCall(() => fetchLibraryCounts());

  return {
    photoCount: counts.photoCount,
    videoCount: counts.videoCount,
    otherCount: mockLibrarySummary.otherCount,
    storageUsedBytes: mockLibrarySummary.storageUsedBytes,
    totalStorageBytes: mockLibrarySummary.totalStorageBytes,
    potentialSavingsBytes: mockLibrarySummary.potentialSavingsBytes,
    quickClean: mockLibrarySummary.quickClean,
  };
}

export { MediaLibraryAccessError };
