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
