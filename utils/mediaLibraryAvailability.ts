import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

export type MediaAccessBlockReason = 'expo_go_android';

export class MediaLibraryAccessError extends Error {
  readonly reason: MediaAccessBlockReason | 'unknown';

  constructor(message: string, reason: MediaAccessBlockReason | 'unknown' = 'unknown') {
    super(message);
    this.name = 'MediaLibraryAccessError';
    this.reason = reason;
  }
}

export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function isAndroidExpoGoMediaBlocked(): boolean {
  return Platform.OS === 'android' && isExpoGo();
}

export function isExpoGoAndroidMediaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('Expo Go can no longer provide full access to the media library');
}

export function getMediaAccessErrorMessage(reason: MediaAccessBlockReason): string {
  if (reason === 'expo_go_android') {
    return 'Expo Go on Android cannot access your full photo library anymore. Use a development build for real photos, or try demo mode to test the swipe flow.';
  }

  return 'Photo library access is unavailable.';
}

export const DEV_BUILD_DOCS_URL =
  'https://docs.expo.dev/develop/development-builds/create-a-build/';

async function runMediaLibraryCall<T>(operation: () => Promise<T>): Promise<T> {
  if (isAndroidExpoGoMediaBlocked()) {
    throw new MediaLibraryAccessError(
      getMediaAccessErrorMessage('expo_go_android'),
      'expo_go_android',
    );
  }

  try {
    return await operation();
  } catch (error) {
    if (isExpoGoAndroidMediaError(error)) {
      throw new MediaLibraryAccessError(
        getMediaAccessErrorMessage('expo_go_android'),
        'expo_go_android',
      );
    }

    throw error;
  }
}

export { runMediaLibraryCall };
