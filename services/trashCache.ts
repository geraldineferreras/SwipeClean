import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TrashItem } from '@/types/trash';

const CACHE_KEY = 'swipeclean.trash-items.v1';

export async function loadCachedTrashItems(): Promise<TrashItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Array<Partial<TrashItem> & { uri: string; id: string }>;
    return parsed.map((item) => ({
      id: item.id,
      assetId: item.assetId ?? item.id.replace(/^session-/, ''),
      uri: item.uri,
      thumbnailUri: item.thumbnailUri ?? item.uri,
      filename: item.filename ?? 'Unknown',
      mediaType: item.mediaType === 'video' ? 'video' : 'photo',
      fileSizeBytes: item.fileSizeBytes ?? 0,
      daysLeft: item.daysLeft ?? 7,
    }));
  } catch {
    return null;
  }
}

export async function saveCachedTrashItems(items: TrashItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    // Cache is best-effort.
  }
}
