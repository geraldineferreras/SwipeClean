import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

import type { MediaAlbum, MediaType, PhotoAccess, SwipeItem } from '@/types/media';
import { estimateAssetSizeBytes } from '@/utils/assetSizeEstimation';
import { isHiddenAlbumTitle } from '@/utils/assetFilters';

const CLEANING_BATCH_SIZE = 100;
const CLEANING_PAGE_SIZE = 1000;
const ALBUM_RESOLVE_CONCURRENCY = 6;

async function readUriSizeBytes(uri: string): Promise<number | null> {
  if (!uri) {
    return null;
  }

  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && 'size' in fileInfo && typeof fileInfo.size === 'number' && fileInfo.size > 0) {
      return fileInfo.size;
    }
  } catch {
    // Fall through.
  }

  return null;
}

function parseExifFileSize(exif: Record<string, unknown> | undefined): number | null {
  if (!exif) {
    return null;
  }

  const candidates = [exif.FileSize, exif.fileSize, exif.ImageLength];
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && candidate > 0) {
      return candidate;
    }

    if (typeof candidate === 'string') {
      const parsed = Number(candidate);
      if (parsed > 0) {
        return parsed;
      }
    }
  }

  return null;
}

export interface ResolvedFileSize {
  bytes: number;
  isMeasured: boolean;
}

export async function resolveFileSizeBytesWithSource(
  asset: MediaLibrary.Asset,
): Promise<ResolvedFileSize> {
  try {
    const info = await MediaLibrary.getAssetInfoAsync(asset, {
      shouldDownloadFromNetwork: false,
    });
    const exifSize = parseExifFileSize(info.exif as Record<string, unknown> | undefined);

    if (exifSize) {
      return { bytes: exifSize, isMeasured: true };
    }

    const uris = [info.localUri, asset.uri].filter(
      (uri): uri is string => typeof uri === 'string' && uri.length > 0,
    );

    for (const uri of uris) {
      const localSize = await readUriSizeBytes(uri);
      if (localSize) {
        return { bytes: localSize, isMeasured: true };
      }
    }
  } catch {
    // Fall through to estimate.
  }

  return {
    bytes: estimateAssetSizeBytes(asset),
    isMeasured: false,
  };
}

export async function resolveFileSizeBytes(
  asset: MediaLibrary.Asset,
): Promise<number> {
  const resolved = await resolveFileSizeBytesWithSource(asset);
  return resolved.bytes;
}

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

export function resolveEstimatedFileSizeBytes(asset: MediaLibrary.Asset): number {
  return estimateAssetSizeBytes(asset);
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

export async function resolveAssetDisplayUri(
  asset: { id: string; uri: string },
): Promise<string> {
  try {
    const info = await MediaLibrary.getAssetInfoAsync(asset, {
      shouldDownloadFromNetwork: false,
    });

    if (info.localUri) {
      return info.localUri;
    }
  } catch {
    // Fall through.
  }

  return asset.uri;
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

export function getSwipeItemRecencyTimestamp(item: SwipeItem): number {
  return Math.max(item.modificationTime ?? 0, item.creationTime ?? 0);
}

export function sortSwipeItemsByRecency(items: SwipeItem[]): SwipeItem[] {
  return [...items].sort(
    (left, right) => getSwipeItemRecencyTimestamp(right) - getSwipeItemRecencyTimestamp(left),
  );
}

export function mapAssetsWithEstimatedSizes(
  assets: MediaLibrary.Asset[],
): SwipeItem[] {
  return assets.map((asset) =>
    mapAssetToSwipeItem(asset, estimateAssetSizeBytes(asset)),
  );
}

async function paginateAllAssets(options: {
  album?: string;
  mediaType?: MediaLibrary.MediaTypeValue[];
} = {}): Promise<MediaLibrary.Asset[]> {
  const allAssets: MediaLibrary.Asset[] = [];
  let after: string | undefined;

  while (true) {
    let page: MediaLibrary.PagedInfo<MediaLibrary.Asset>;

    try {
      page = await MediaLibrary.getAssetsAsync({
        first: CLEANING_PAGE_SIZE,
        after,
        album: options.album,
        mediaType: options.mediaType ?? [
          MediaLibrary.MediaType.photo,
          MediaLibrary.MediaType.video,
        ],
        sortBy: [[MediaLibrary.SortBy.modificationTime, false]],
      });
    } catch {
      page = await MediaLibrary.getAssetsAsync({
        first: CLEANING_PAGE_SIZE,
        after,
        album: options.album,
        mediaType: options.mediaType ?? [
          MediaLibrary.MediaType.photo,
          MediaLibrary.MediaType.video,
        ],
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
    }

    allAssets.push(...page.assets);

    if (!page.hasNextPage || !page.endCursor || page.assets.length === 0) {
      break;
    }

    after = page.endCursor;
  }

  return allAssets;
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

export async function fetchHiddenAssetIds(): Promise<Set<string>> {
  try {
    const albums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });
    const hiddenAlbum = albums.find((album) => isHiddenAlbumTitle(album.title));

    if (!hiddenAlbum) {
      return new Set();
    }

    const page = await MediaLibrary.getAssetsAsync({
      album: hiddenAlbum.id,
      first: 5000,
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    });

    return new Set(page.assets.map((asset) => asset.id));
  } catch {
    return new Set();
  }
}

export async function fetchCleaningAssets(): Promise<SwipeItem[]> {
  const assets = await paginateAllAssets();
  return sortSwipeItemsByRecency(mapAssetsWithEstimatedSizes(assets));
}

export async function fetchAlbumAssets(albumId: string): Promise<SwipeItem[]> {
  const assets = await paginateAllAssets({ album: albumId });
  return sortSwipeItemsByRecency(mapAssetsWithEstimatedSizes(assets));
}

async function resolveMediaAlbum(album: MediaLibrary.Album): Promise<MediaAlbum | null> {
  let assetCount = album.assetCount;
  let coverUri: string | null = null;

  try {
    const page = await MediaLibrary.getAssetsAsync({
      album: album.id,
      first: 1,
      mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });

    coverUri = page.assets[0]?.uri ?? null;
    if (assetCount <= 0) {
      assetCount = page.totalCount;
    }
  } catch {
    if (assetCount <= 0) {
      return null;
    }
  }

  if (assetCount <= 0) {
    return null;
  }

  return {
    id: album.id,
    title: album.title,
    assetCount,
    type: album.type === 'smartAlbum' ? 'smartAlbum' : 'album',
    coverUri,
  };
}

export async function fetchMediaAlbums(skipHiddenAlbums = false): Promise<MediaAlbum[]> {
  const albums = await MediaLibrary.getAlbumsAsync({
    includeSmartAlbums: true,
  });

  const visibleAlbums = albums.filter(
    (album) => !skipHiddenAlbums || !isHiddenAlbumTitle(album.title),
  );
  const resolvedAlbums: MediaAlbum[] = [];

  for (let start = 0; start < visibleAlbums.length; start += ALBUM_RESOLVE_CONCURRENCY) {
    const batch = visibleAlbums.slice(start, start + ALBUM_RESOLVE_CONCURRENCY);
    const batchResults = await Promise.all(batch.map((album) => resolveMediaAlbum(album)));

    for (const album of batchResults) {
      if (album) {
        resolvedAlbums.push(album);
      }
    }
  }

  return resolvedAlbums.sort((left, right) => {
    if (right.assetCount !== left.assetCount) {
      return right.assetCount - left.assetCount;
    }

    return left.title.localeCompare(right.title);
  });
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
