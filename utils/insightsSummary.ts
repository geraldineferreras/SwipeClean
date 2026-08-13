import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { InsightsCategoryDetailRow } from '@/constants/insightsData';
import type { LibrarySummary } from '@/types/cleanup';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface InsightsSpaceRow {
  label: string;
  bytes: number;
  percent: number;
  color: string;
  softColor: string;
  icon: IoniconName;
}

export const INSIGHTS_SEGMENT_COLORS = {
  photos: { color: '#2563EB', softColor: '#EFF6FF' },
  videos: { color: '#7C3AED', softColor: '#F5F3FF' },
  screenshots: { color: '#10B981', softColor: '#ECFDF5' },
  others: { color: '#EAB308', softColor: '#FEFCE8' },
} as const;

export interface StorageOverviewSegment {
  label: string;
  bytes: number;
  percent: number;
  color: string;
}

function percentOfTotal(bytes: number, totalBytes: number): number {
  return Math.round((bytes / Math.max(totalBytes, 1)) * 100);
}

function getPhotoVideoBytes(summary: LibrarySummary): { photoBytes: number; videoBytes: number } {
  const photoStorageBytes = summary.photoStorageBytes ?? 0;
  const videoStorageBytes = summary.videoStorageBytes ?? 0;

  if (photoStorageBytes > 0 || videoStorageBytes > 0) {
    return {
      photoBytes: photoStorageBytes,
      videoBytes: videoStorageBytes,
    };
  }

  const mediaTotal = Math.max(summary.photoCount + summary.videoCount, 1);
  const photoShare = summary.photoCount / mediaTotal;
  const videoShare = summary.videoCount / mediaTotal;

  return {
    photoBytes: Math.round(summary.storageUsedBytes * photoShare),
    videoBytes: Math.round(summary.storageUsedBytes * videoShare),
  };
}

export function buildStorageOverviewSegments(summary: LibrarySummary): StorageOverviewSegment[] {
  const usedBytes = Math.max(summary.storageUsedBytes, 1);
  const { photoBytes: photoStorageBytes, videoBytes: videoStorageBytes } =
    getPhotoVideoBytes(summary);
  const screenshotBytes = summary.quickCleanBytes.screenshots;
  const photoBytes = Math.max(photoStorageBytes - screenshotBytes, 0);
  const othersBytes = Math.max(
    usedBytes - photoBytes - videoStorageBytes - screenshotBytes,
    0,
  );

  const segments: StorageOverviewSegment[] = [
    {
      label: 'Photos',
      bytes: photoBytes,
      percent: percentOfTotal(photoBytes, usedBytes),
      color: INSIGHTS_SEGMENT_COLORS.photos.color,
    },
    {
      label: 'Videos',
      bytes: videoStorageBytes,
      percent: percentOfTotal(videoStorageBytes, usedBytes),
      color: INSIGHTS_SEGMENT_COLORS.videos.color,
    },
    {
      label: 'Screenshots',
      bytes: screenshotBytes,
      percent: percentOfTotal(screenshotBytes, usedBytes),
      color: INSIGHTS_SEGMENT_COLORS.screenshots.color,
    },
    {
      label: 'Others',
      bytes: othersBytes,
      percent: percentOfTotal(othersBytes, usedBytes),
      color: INSIGHTS_SEGMENT_COLORS.others.color,
    },
  ];

  return segments.filter((segment) => segment.bytes > 0 || segment.label === 'Photos');
}

export function buildInsightsCategoryDetailRows(
  summary: LibrarySummary,
): InsightsCategoryDetailRow[] {
  const { photoBytes: photoStorageBytes, videoBytes: videoStorageBytes } =
    getPhotoVideoBytes(summary);
  const { quickClean, quickCleanBytes } = summary;
  const usedBytes = summary.storageUsedBytes;
  const screenshotBytes = quickCleanBytes.screenshots;
  const regularPhotoBytes = Math.max(photoStorageBytes - screenshotBytes, 0);

  const othersBytes = Math.max(
    usedBytes - regularPhotoBytes - videoStorageBytes - screenshotBytes - quickCleanBytes.duplicates - quickCleanBytes.blurryPhotos,
    0,
  );

  return [
    {
      label: 'Photos',
      count: summary.photoCount,
      bytes: regularPhotoBytes,
      percent: percentOfTotal(regularPhotoBytes, usedBytes),
      color: INSIGHTS_SEGMENT_COLORS.photos.color,
      softColor: INSIGHTS_SEGMENT_COLORS.photos.softColor,
      icon: 'image-outline',
    },
    {
      label: 'Videos',
      count: summary.videoCount,
      bytes: videoStorageBytes,
      percent: percentOfTotal(videoStorageBytes, usedBytes),
      color: INSIGHTS_SEGMENT_COLORS.videos.color,
      softColor: INSIGHTS_SEGMENT_COLORS.videos.softColor,
      icon: 'videocam-outline',
    },
    {
      label: 'Screenshots',
      count: quickClean.screenshots,
      bytes: screenshotBytes,
      percent: percentOfTotal(screenshotBytes, usedBytes),
      color: INSIGHTS_SEGMENT_COLORS.screenshots.color,
      softColor: INSIGHTS_SEGMENT_COLORS.screenshots.softColor,
      icon: 'crop-outline',
    },
    {
      label: 'Duplicates',
      count: quickClean.duplicates,
      bytes: quickCleanBytes.duplicates,
      percent: percentOfTotal(quickCleanBytes.duplicates, usedBytes),
      color: '#EA580C',
      softColor: '#FFF7ED',
      icon: 'copy-outline',
    },
    {
      label: 'Blurry Photos',
      count: quickClean.blurryPhotos,
      bytes: quickCleanBytes.blurryPhotos,
      percent: percentOfTotal(quickCleanBytes.blurryPhotos, usedBytes),
      color: '#DB2777',
      softColor: '#FDF2F8',
      icon: 'eye-off-outline',
    },
    {
      label: 'Others',
      count: summary.otherCount,
      bytes: othersBytes,
      percent: percentOfTotal(othersBytes, usedBytes),
      color: '#14B8A6',
      softColor: '#F0FDFA',
      icon: 'folder-outline',
    },
  ];
}

export function buildInsightsSpaceRows(summary: LibrarySummary): InsightsSpaceRow[] {
  const { videoBytes: videoStorageBytes } = getPhotoVideoBytes(summary);
  const { quickCleanBytes } = summary;
  const usedBytes = summary.storageUsedBytes;
  const screenshotBytes = quickCleanBytes.screenshots;
  const regularPhotoBytes = Math.max(
    getPhotoVideoBytes(summary).photoBytes - screenshotBytes,
    0,
  );

  const othersBytes = Math.max(
    usedBytes -
      regularPhotoBytes -
      videoStorageBytes -
      screenshotBytes -
      quickCleanBytes.duplicates -
      quickCleanBytes.blurryPhotos,
    0,
  );

  return [
    {
      label: 'Photos',
      bytes: regularPhotoBytes,
      percent: percentOfTotal(regularPhotoBytes, usedBytes),
      color: INSIGHTS_SEGMENT_COLORS.photos.color,
      softColor: INSIGHTS_SEGMENT_COLORS.photos.softColor,
      icon: 'image-outline',
    },
    {
      label: 'Videos',
      bytes: videoStorageBytes,
      percent: percentOfTotal(videoStorageBytes, usedBytes),
      color: INSIGHTS_SEGMENT_COLORS.videos.color,
      softColor: INSIGHTS_SEGMENT_COLORS.videos.softColor,
      icon: 'videocam-outline',
    },
    {
      label: 'Screenshots',
      bytes: screenshotBytes,
      percent: percentOfTotal(screenshotBytes, usedBytes),
      color: INSIGHTS_SEGMENT_COLORS.screenshots.color,
      softColor: INSIGHTS_SEGMENT_COLORS.screenshots.softColor,
      icon: 'phone-portrait-outline',
    },
    {
      label: 'Duplicates',
      bytes: quickCleanBytes.duplicates,
      percent: percentOfTotal(quickCleanBytes.duplicates, usedBytes),
      color: '#EA580C',
      softColor: '#FFF7ED',
      icon: 'copy-outline',
    },
    {
      label: 'Blurry Photos',
      bytes: quickCleanBytes.blurryPhotos,
      percent: percentOfTotal(quickCleanBytes.blurryPhotos, usedBytes),
      color: '#DB2777',
      softColor: '#FDF2F8',
      icon: 'eye-off-outline',
    },
    {
      label: 'Others',
      bytes: othersBytes,
      percent: percentOfTotal(othersBytes, usedBytes),
      color: '#14B8A6',
      softColor: '#F0FDFA',
      icon: 'folder-outline',
    },
  ];
}
