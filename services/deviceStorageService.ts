import * as FileSystem from 'expo-file-system/legacy';

export interface DeviceStorageInfo {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
}

const FALLBACK_TOTAL_BYTES = 64 * 1024 ** 3;
const FALLBACK_FREE_BYTES = 32 * 1024 ** 3;

export async function getDeviceStorageInfo(): Promise<DeviceStorageInfo> {
  try {
    const [totalBytes, freeBytes] = await Promise.all([
      FileSystem.getTotalDiskCapacityAsync(),
      FileSystem.getFreeDiskStorageAsync(),
    ]);

    if (totalBytes > 0 && freeBytes >= 0 && freeBytes <= totalBytes) {
      return {
        totalBytes,
        freeBytes,
        usedBytes: totalBytes - freeBytes,
      };
    }
  } catch {
    // Fall through to defaults.
  }

  return {
    totalBytes: FALLBACK_TOTAL_BYTES,
    freeBytes: FALLBACK_FREE_BYTES,
    usedBytes: FALLBACK_TOTAL_BYTES - FALLBACK_FREE_BYTES,
  };
}
