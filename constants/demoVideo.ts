export const DEMO_VIDEO_URI = 'swipeclean://demo-video';

export const demoVideoSource = require('@/assets/videos/demo.mp4') as number;

export function isDemoVideoUri(uri: string): boolean {
  return uri === DEMO_VIDEO_URI;
}

export function resolveVideoSource(uri: string): string | number {
  if (isDemoVideoUri(uri)) {
    return demoVideoSource;
  }

  return uri;
}
