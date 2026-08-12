export const DEMO_VIDEO_URI = 'swipeclean://demo-video';

export const DEMO_VIDEO_POSTER_URI =
  'https://picsum.photos/seed/swipeclean5/900/1200';

export const demoVideoSource = require('@/assets/videos/demo.mp4') as number;

export function isDemoVideoUri(uri: string): boolean {
  return uri === DEMO_VIDEO_URI;
}

export function resolveMediaThumbnailUri(uri: string): string {
  if (isDemoVideoUri(uri)) {
    return DEMO_VIDEO_POSTER_URI;
  }

  return uri;
}

export function resolveVideoSource(uri: string): string | number {
  if (isDemoVideoUri(uri)) {
    return demoVideoSource;
  }

  return uri;
}
