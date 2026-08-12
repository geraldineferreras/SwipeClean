export interface QuickCleanCounts {
  screenshots: number;
  duplicates: number;
  largeVideos: number;
}

export interface LibrarySummary {
  photoCount: number;
  videoCount: number;
  storageUsedBytes: number;
  potentialSavingsBytes: number;
  quickClean: QuickCleanCounts;
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
