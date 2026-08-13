import type { SwipeItem } from '@/types/media';

export function filterHiddenAssets(
  assets: SwipeItem[],
  skipHiddenItems: boolean,
): SwipeItem[] {
  if (!skipHiddenItems) {
    return assets;
  }

  return assets.filter((asset) => !asset.isHidden);
}

export function isHiddenAlbumTitle(title: string): boolean {
  const normalized = title.trim().toLowerCase();
  return normalized === 'hidden' || normalized === 'hidden album';
}
