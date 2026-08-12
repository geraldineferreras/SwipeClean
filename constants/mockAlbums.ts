import type { MediaAlbum } from '@/types/media';

export const mockAlbums: MediaAlbum[] = [
  {
    id: 'mock-album-vacation',
    title: 'Vacation 2025',
    assetCount: 5,
    type: 'album',
  },
  {
    id: 'mock-album-family',
    title: 'Family',
    assetCount: 4,
    type: 'album',
  },
  {
    id: 'mock-album-screenshots',
    title: 'Screenshots',
    assetCount: 3,
    type: 'smartAlbum',
  },
  {
    id: 'mock-album-videos',
    title: 'Videos',
    assetCount: 1,
    type: 'smartAlbum',
  },
  {
    id: 'mock-album-favorites',
    title: 'Favorites',
    assetCount: 3,
    type: 'album',
  },
  {
    id: 'mock-album-downloads',
    title: 'Downloads',
    assetCount: 2,
    type: 'album',
  },
];

export const mockAlbumAssetIds: Record<string, string[]> = {
  'mock-album-vacation': ['mock-1', 'mock-2', 'mock-4', 'mock-6', 'mock-7'],
  'mock-album-family': ['mock-2', 'mock-6', 'mock-8', 'mock-9'],
  'mock-album-screenshots': ['mock-3', 'mock-11', 'mock-12'],
  'mock-album-videos': ['mock-5'],
  'mock-album-favorites': ['mock-1', 'mock-4', 'mock-10'],
  'mock-album-downloads': ['mock-8', 'mock-9'],
};

export const HOME_ALBUM_PREVIEW_COUNT = 4;
