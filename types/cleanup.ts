import type { InsightsLargestFile } from '@/constants/insightsData';

export interface QuickCleanCounts {
  screenshots: number;
  duplicates: number;
  largeVideos: number;
  blurryPhotos: number;
  favorites: number;
}

export type QuickCleanByteCounts = QuickCleanCounts;

export interface LibrarySummary {
  photoCount: number;
  videoCount: number;
  otherCount: number;
  storageUsedBytes: number;
  photoStorageBytes: number;
  videoStorageBytes: number;
  totalStorageBytes: number;
  deviceUsedBytes: number;
  deviceFreeBytes: number;
  potentialSavingsBytes: number;
  quickClean: QuickCleanCounts;
  quickCleanBytes: QuickCleanByteCounts;
  scannedAssetCount: number;
  measuredAssetCount: number;
  estimatedAssetCount: number;
  isPartialScan: boolean;
  oldestMediaTimestamp: number | null;
  highestResolutionMegapixels: number;
  highestResolutionPhotoCount: number;
  largestFiles: InsightsLargestFile[];
}

export type QuickCleanCategoryKey = keyof QuickCleanCounts;

export interface QuickCleanCategory {
  key: QuickCleanCategoryKey;
  label: string;
  count: number;
}

export interface QuickCleanAlbum {
  id: string;
  label: string;
  count: number;
  coverUri?: string | null;
}

export type CleanupDecision = 'keep' | 'delete' | 'skip' | 'favorite';

export interface CleanupSessionItem {
  assetId: string;
  uri: string;
  filename: string;
  mediaType: 'photo' | 'video';
  fileSizeBytes: number;
  decision: CleanupDecision;
  decidedAt: number;
}

export interface CleanupResult {
  deletedCount: number;
  photoCount: number;
  videoCount: number;
  freedBytes: number;
}
