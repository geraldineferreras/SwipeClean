export interface TrashItem {
  id: string;
  assetId: string;
  uri: string;
  thumbnailUri: string;
  filename: string;
  mediaType: 'photo' | 'video';
  fileSizeBytes: number;
  daysLeft: number;
}

export const TRASH_RETENTION_DAYS = 7;

export function getTrashTotals(items: TrashItem[]) {
  return {
    count: items.length,
    bytes: items.reduce((sum, item) => sum + item.fileSizeBytes, 0),
  };
}

export function getTrashThumbnailUri(item: TrashItem): string {
  return item.thumbnailUri || item.uri;
}
