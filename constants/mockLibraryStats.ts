import type { LibrarySummary } from '@/types/cleanup';

export const mockLibrarySummary: LibrarySummary = {
  photoCount: 3284,
  videoCount: 142,
  otherCount: 28,
  storageUsedBytes: 12.4 * 1024 ** 3,
  totalStorageBytes: 64 * 1024 ** 3,
  potentialSavingsBytes: 1.8 * 1024 ** 3,
  quickClean: {
    screenshots: 487,
    duplicates: 231,
    largeVideos: 42,
    blurryPhotos: 87,
    favorites: 156,
  },
};
