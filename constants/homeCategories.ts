import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { QuickCleanCategoryKey, QuickCleanCounts } from '@/types/cleanup';

type HomeCategoryKey = keyof QuickCleanCounts;
type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface HomeCategoryConfig {
  key: HomeCategoryKey;
  label: string;
  icon: IoniconName;
  color: string;
  softColor: string;
  storageBytes: number;
  cleanCategory?: QuickCleanCategoryKey;
}

export const HOME_CATEGORY_ROWS: HomeCategoryConfig[] = [
  {
    key: 'screenshots',
    label: 'Screenshots',
    icon: 'phone-portrait-outline',
    color: '#2563EB',
    softColor: '#EFF6FF',
    storageBytes: 1.2 * 1024 ** 3,
    cleanCategory: 'screenshots',
  },
  {
    key: 'duplicates',
    label: 'Duplicates',
    icon: 'copy-outline',
    color: '#7C3AED',
    softColor: '#F5F3FF',
    storageBytes: 850 * 1024 ** 2,
    cleanCategory: 'duplicates',
  },
  {
    key: 'largeVideos',
    label: 'Large Videos',
    icon: 'videocam-outline',
    color: '#EA580C',
    softColor: '#FFF7ED',
    storageBytes: 3.4 * 1024 ** 3,
    cleanCategory: 'largeVideos',
  },
  {
    key: 'blurryPhotos',
    label: 'Blurry Photos',
    icon: 'eye-off-outline',
    color: '#DB2777',
    softColor: '#FDF2F8',
    storageBytes: 210 * 1024 ** 2,
  },
  {
    key: 'favorites',
    label: 'Favorites',
    icon: 'star-outline',
    color: '#CA8A04',
    softColor: '#FEFCE8',
    storageBytes: 1.1 * 1024 ** 3,
  },
];
