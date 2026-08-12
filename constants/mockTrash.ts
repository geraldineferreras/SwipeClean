import { resolveMediaThumbnailUri } from '@/constants/demoVideo';

export interface TrashItem {
  id: string;
  uri: string;
  filename: string;
  mediaType: 'photo' | 'video';
  fileSizeBytes: number;
  daysLeft: number;
}

export const TRASH_RETENTION_DAYS = 7;

export const mockTrashItems: TrashItem[] = [
  {
    id: 'trash-1',
    uri: 'https://picsum.photos/seed/trash1/400/400',
    filename: 'IMG_1847.JPG',
    mediaType: 'photo',
    fileSizeBytes: 2.4 * 1024 ** 2,
    daysLeft: 3,
  },
  {
    id: 'trash-2',
    uri: 'https://picsum.photos/seed/trash2/400/400',
    filename: 'IMG_1848.JPG',
    mediaType: 'photo',
    fileSizeBytes: 1.8 * 1024 ** 2,
    daysLeft: 4,
  },
  {
    id: 'trash-3',
    uri: 'https://picsum.photos/seed/trash3/400/400',
    filename: 'VID_20250722.mp4',
    mediaType: 'video',
    fileSizeBytes: 48 * 1024 ** 2,
    daysLeft: 5,
  },
  {
    id: 'trash-4',
    uri: 'https://picsum.photos/seed/trash4/400/400',
    filename: 'IMG_1850.JPG',
    mediaType: 'photo',
    fileSizeBytes: 3.1 * 1024 ** 2,
    daysLeft: 2,
  },
  {
    id: 'trash-5',
    uri: 'https://picsum.photos/seed/trash5/400/400',
    filename: 'IMG_1851.JPG',
    mediaType: 'photo',
    fileSizeBytes: 2.2 * 1024 ** 2,
    daysLeft: 6,
  },
  {
    id: 'trash-6',
    uri: 'https://picsum.photos/seed/trash6/400/400',
    filename: 'IMG_1852.JPG',
    mediaType: 'photo',
    fileSizeBytes: 1.5 * 1024 ** 2,
    daysLeft: 7,
  },
  {
    id: 'trash-7',
    uri: 'https://picsum.photos/seed/trash7/400/400',
    filename: 'IMG_1853.JPG',
    mediaType: 'photo',
    fileSizeBytes: 2.9 * 1024 ** 2,
    daysLeft: 3,
  },
  {
    id: 'trash-8',
    uri: 'https://picsum.photos/seed/trash8/400/400',
    filename: 'IMG_1854.JPG',
    mediaType: 'photo',
    fileSizeBytes: 1.1 * 1024 ** 2,
    daysLeft: 4,
  },
];

export function getTrashThumbnailUri(item: TrashItem): string {
  return resolveMediaThumbnailUri(item.uri);
}

export function getTrashTotals(items: TrashItem[]) {
  return {
    count: items.length,
    bytes: items.reduce((sum, item) => sum + item.fileSizeBytes, 0),
  };
}
