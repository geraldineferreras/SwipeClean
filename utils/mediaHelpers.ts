import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

import type { MediaAlbum, MediaType, PhotoAccess, SwipeItem } from '@/types/media';

const CLEANING_BATCH_SIZE = 100;

export function normalizePhotoAccess(
  response: MediaLibrary.PermissionResponse,
): PhotoAccess {
  if (response.status !== 'granted') {
    return 'denied';
  }

  if (response.accessPrivileges === 'limited') {
    return 'limited';
  }

  return 'all';
}

export async function resolveFileSizeBytes(
  asset: MediaLibrary.Asset,
): Promise<number> {
  try {
    const info = await MediaLibrary.getAssetInfoAsync(asset);
    const exifSize = info.exif?.FileSize;

    if (typeof exifSize === 'number' && exifSize > 0) {
      return exifSize;
    }

    if (info.localUri) {
      const fileInfo = await FileSystem.getInfoAsync(info.localUri);
      if (fileInfo.exists && 'size' in fileInfo && typeof fileInfo.size === 'number') {
        return fileInfo.size;
      }
    }
  } catch {
    // Size is optional for display; fall back to zero.
  }

  return 0;
}

function mapMediaType(mediaType: MediaLibrary.MediaTypeValue): MediaType {
  if (mediaType === 'photo') {
    return 'photo';
  }

  if (mediaType === 'video') {
    return 'video';
  }

  if (mediaType === 'audio') {
    return 'audio';
  }

  return 'unknown';
}

export function mapAssetToSwipeItem(
  asset: MediaLibrary.Asset,
  fileSizeBytes = 0,
): SwipeItem {
  return {
    id: asset.id,
    uri: asset.uri,
    filename: asset.filename,
    mediaType: mapMediaType(asset.mediaType),
    width: asset.width,
    height: asset.height,
    creationTime: asset.creationTime,
    modificationTime: asset.modificationTime,
    duration: asset.duration,
    fileSizeBytes,
  };
}

export async function mapAssetsWithSizes(
  assets: MediaLibrary.Asset[],
): Promise<SwipeItem[]> {
  return Promise.all(
    assets.map(async (asset) => {
      const fileSizeBytes = await resolveFileSizeBytes(asset);
      return mapAssetToSwipeItem(asset, fileSizeBytes);
    }),
  );
}

export async function fetchCleaningAssets(): Promise<SwipeItem[]> {
  const page = await MediaLibrary.getAssetsAsync({
    first: CLEANING_BATCH_SIZE,
    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
  });

  return mapAssetsWithSizes(page.assets);
}

export async function fetchAlbumAssets(albumId: string): Promise<SwipeItem[]> {
  const page = await MediaLibrary.getAssetsAsync({
    album: albumId,
    first: CLEANING_BATCH_SIZE,
    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
  });

  return mapAssetsWithSizes(page.assets);
}

export async function fetchMediaAlbums(): Promise<MediaAlbum[]> {
  const albums = await MediaLibrary.getAlbumsAsync({
    includeSmartAlbums: true,
  });

  const filtered = albums
    .filter((album) => album.assetCount > 0)
    .sort((left, right) => right.assetCount - left.assetCount);

  return Promise.all(
    filtered.map(async (album) => {
      let coverUri: string | null = null;

      try {
        const page = await MediaLibrary.getAssetsAsync({
          album: album.id,
          first: 1,
          mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        });
        coverUri = page.assets[0]?.uri ?? null;
      } catch {
        coverUri = null;
      }

      return {
        id: album.id,
        title: album.title,
        assetCount: album.assetCount,
        type: album.type === 'smartAlbum' ? 'smartAlbum' : 'album',
        coverUri,
      };
    }),
  );
}

export async function fetchLibraryCounts(): Promise<{
  photoCount: number;
  videoCount: number;
}> {
  const [photos, videos] = await Promise.all([
    MediaLibrary.getAssetsAsync({
      first: 1,
      mediaType: MediaLibrary.MediaType.photo,
    }),
    MediaLibrary.getAssetsAsync({
      first: 1,
      mediaType: MediaLibrary.MediaType.video,
    }),
  ]);

  return {
    photoCount: photos.totalCount,
    videoCount: videos.totalCount,
  };
}

export { CLEANING_BATCH_SIZE };
