import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MediaAlbum } from '@/types/media';

const CACHE_KEY = 'swipeclean.media-albums.v1';

export async function loadCachedAlbums(
  skipHiddenAlbums: boolean,
): Promise<MediaAlbum[] | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_KEY}.${skipHiddenAlbums ? 'hidden' : 'all'}`);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as MediaAlbum[];
  } catch {
    return null;
  }
}

export async function saveCachedAlbums(
  albums: MediaAlbum[],
  skipHiddenAlbums: boolean,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${CACHE_KEY}.${skipHiddenAlbums ? 'hidden' : 'all'}`,
      JSON.stringify(albums),
    );
  } catch {
    // Cache is best-effort.
  }
}
