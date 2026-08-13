import type { Href } from 'expo-router';

/** Home tab route — cast until Expo Router regenerates typed routes. */
export const HOME_ROUTE = '/(tabs)' as Href;

export const SETTINGS_ROUTE = '/settings' as Href;

export const TRASH_TAB_ROUTE = '/(tabs)/trash' as Href;

export const ALBUMS_TAB_ROUTE = '/(tabs)/albums' as Href;

export const LARGEST_FILES_ROUTE = '/largest-files' as Href;

export const STORAGE_BREAKDOWN_ROUTE = '/storage-breakdown' as Href;
