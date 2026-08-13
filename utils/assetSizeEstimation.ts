import type { MediaType } from '@/types/media';
import type * as MediaLibrary from 'expo-media-library';

const PHOTO_BYTES_PER_PIXEL = 0.22;
const SCREENSHOT_BYTES_PER_PIXEL = 0.75;
const VIDEO_BYTES_PER_SECOND = 350_000;

function isScreenshotFilename(filename: string): boolean {
  return /screenshot|screen shot|screen_shot|\.png$/i.test(filename);
}

export function estimateAssetSizeBytes(asset: {
  filename: string;
  mediaType: MediaType | MediaLibrary.MediaTypeValue;
  width: number;
  height: number;
  duration: number;
}): number {
  const pixels = Math.max(asset.width, 1) * Math.max(asset.height, 1);

  if (asset.mediaType === 'video') {
    const seconds = Math.max(asset.duration, 1);
    return Math.round(seconds * VIDEO_BYTES_PER_SECOND);
  }

  if (isScreenshotFilename(asset.filename)) {
    return Math.round(pixels * SCREENSHOT_BYTES_PER_PIXEL);
  }

  return Math.round(pixels * PHOTO_BYTES_PER_PIXEL);
}
