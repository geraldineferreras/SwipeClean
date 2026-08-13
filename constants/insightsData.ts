import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HOME_CATEGORY_ROWS, type HomeCategoryConfig } from '@/constants/homeCategories';
import { mockLibrarySummary } from '@/constants/mockLibraryStats';
import type { QuickCleanCategoryKey } from '@/types/cleanup';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface AlbumCategoryRow {
  key: string;
  label: string;
  icon: IoniconName;
  color: string;
  softColor: string;
  count: number;
  storageBytes: number;
  cleanCategory?: QuickCleanCategoryKey;
}

export const ALBUM_CATEGORY_ROWS: AlbumCategoryRow[] = [
  {
    key: 'all',
    label: 'All Photos',
    icon: 'images-outline',
    color: '#2563EB',
    softColor: '#EFF6FF',
    count: mockLibrarySummary.photoCount + mockLibrarySummary.videoCount,
    storageBytes: mockLibrarySummary.storageUsedBytes,
  },
  ...HOME_CATEGORY_ROWS.map((row: HomeCategoryConfig) => ({
    key: row.key,
    label: row.label,
    icon: row.icon,
    color: row.color,
    softColor: row.softColor,
    count: mockLibrarySummary.quickClean[row.key],
    storageBytes: row.storageBytes,
    cleanCategory: row.cleanCategory,
  })),
  {
    key: 'recent',
    label: 'Recently Added',
    icon: 'time-outline',
    color: '#0EA5E9',
    softColor: '#F0F9FF',
    count: 128,
    storageBytes: 420 * 1024 ** 2,
  },
];

export const INSIGHTS_STORAGE_SEGMENTS = [
  { label: 'Photos', bytes: 6.1 * 1024 ** 3, percent: 49, color: '#2563EB' },
  { label: 'Videos', bytes: 4.3 * 1024 ** 3, percent: 35, color: '#7C3AED' },
  { label: 'Screenshots', bytes: 1.2 * 1024 ** 3, percent: 10, color: '#10B981' },
  { label: 'Others', bytes: 0.8 * 1024 ** 3, percent: 6, color: '#EAB308' },
] as const;

export const INSIGHTS_SPACE_ROWS = [
  { label: 'Videos', bytes: 4.3 * 1024 ** 3, percent: 35, color: '#7C3AED', softColor: '#F5F3FF', icon: 'videocam-outline' as IoniconName },
  { label: 'Screenshots', bytes: 1.2 * 1024 ** 3, percent: 10, color: '#10B981', softColor: '#ECFDF5', icon: 'phone-portrait-outline' as IoniconName },
  { label: 'Duplicates', bytes: 850 * 1024 ** 2, percent: 7, color: '#EA580C', softColor: '#FFF7ED', icon: 'copy-outline' as IoniconName },
  { label: 'Blurry Photos', bytes: 210 * 1024 ** 2, percent: 2, color: '#DB2777', softColor: '#FDF2F8', icon: 'eye-off-outline' as IoniconName },
  { label: 'Others', bytes: 0.8 * 1024 ** 3, percent: 6, color: '#14B8A6', softColor: '#F0FDFA', icon: 'folder-outline' as IoniconName },
];

export const INSIGHTS_RECOVERED_BYTES = 843 * 1024 ** 2;
export const INSIGHTS_SESSION_COUNT = 27;

export interface InsightsCategoryDetailRow {
  label: string;
  count: number;
  bytes: number;
  percent: number;
  color: string;
  softColor: string;
  icon: IoniconName;
}

export const INSIGHTS_CATEGORY_DETAIL_ROWS: InsightsCategoryDetailRow[] = [
  {
    label: 'Photos',
    count: 3284,
    bytes: 6.1 * 1024 ** 3,
    percent: 49,
    color: '#2563EB',
    softColor: '#EFF6FF',
    icon: 'image-outline',
  },
  {
    label: 'Videos',
    count: 487,
    bytes: 4.3 * 1024 ** 3,
    percent: 35,
    color: '#7C3AED',
    softColor: '#F5F3FF',
    icon: 'videocam-outline',
  },
  {
    label: 'Screenshots',
    count: 487,
    bytes: 1.2 * 1024 ** 3,
    percent: 10,
    color: '#10B981',
    softColor: '#ECFDF5',
    icon: 'crop-outline',
  },
  {
    label: 'Duplicates',
    count: 128,
    bytes: 850 * 1024 ** 2,
    percent: 7,
    color: '#EA580C',
    softColor: '#FFF7ED',
    icon: 'copy-outline',
  },
  {
    label: 'Blurry Photos',
    count: 42,
    bytes: 210 * 1024 ** 2,
    percent: 2,
    color: '#DB2777',
    softColor: '#FDF2F8',
    icon: 'eye-off-outline',
  },
  {
    label: 'Others',
    count: 0,
    bytes: 0.8 * 1024 ** 3,
    percent: 6,
    color: '#14B8A6',
    softColor: '#F0FDFA',
    icon: 'folder-outline',
  },
];

export interface InsightsLargestFile {
  filename: string;
  bytes: number;
  duration?: string;
  is4k?: boolean;
  mediaType: 'photo' | 'video';
  thumbnailUri: string;
}

export const INSIGHTS_LARGEST_FILES: InsightsLargestFile[] = [
  {
    filename: 'VID_20250722.mp4',
    bytes: 428 * 1024 ** 2,
    duration: '01:32',
    is4k: true,
    mediaType: 'video',
    thumbnailUri: 'https://picsum.photos/seed/insights-vid1/320/420',
  },
  {
    filename: 'IMG_20250715.HEIC',
    bytes: 18 * 1024 ** 2,
    mediaType: 'photo',
    thumbnailUri: 'https://picsum.photos/seed/insights-img1/320/420',
  },
  {
    filename: 'VID_20250630.mp4',
    bytes: 312 * 1024 ** 2,
    duration: '00:48',
    is4k: true,
    mediaType: 'video',
    thumbnailUri: 'https://picsum.photos/seed/insights-vid2/320/420',
  },
  {
    filename: 'IMG_20250612.HEIC',
    bytes: 14 * 1024 ** 2,
    mediaType: 'photo',
    thumbnailUri: 'https://picsum.photos/seed/insights-img2/320/420',
  },
  {
    filename: 'VID_20250518.mp4',
    bytes: 286 * 1024 ** 2,
    duration: '02:14',
    is4k: true,
    mediaType: 'video',
    thumbnailUri: 'https://picsum.photos/seed/insights-vid3/320/420',
  },
  {
    filename: 'IMG_20250502.HEIC',
    bytes: 16 * 1024 ** 2,
    mediaType: 'photo',
    thumbnailUri: 'https://picsum.photos/seed/insights-img3/320/420',
  },
  {
    filename: 'VID_20250411.mp4',
    bytes: 245 * 1024 ** 2,
    duration: '01:05',
    mediaType: 'video',
    thumbnailUri: 'https://picsum.photos/seed/insights-vid4/320/420',
  },
  {
    filename: 'IMG_20250327.HEIC',
    bytes: 12 * 1024 ** 2,
    mediaType: 'photo',
    thumbnailUri: 'https://picsum.photos/seed/insights-img4/320/420',
  },
  {
    filename: 'VID_20250308.mp4',
    bytes: 198 * 1024 ** 2,
    duration: '00:36',
    mediaType: 'video',
    thumbnailUri: 'https://picsum.photos/seed/insights-vid5/320/420',
  },
  {
    filename: 'IMG_20250219.HEIC',
    bytes: 11 * 1024 ** 2,
    mediaType: 'photo',
    thumbnailUri: 'https://picsum.photos/seed/insights-img5/320/420',
  },
];

export const INSIGHTS_LARGEST_FILES_PREVIEW_COUNT = 4;
