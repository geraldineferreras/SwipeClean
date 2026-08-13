import { Platform } from 'react-native';

/** Reference width (iPhone 14 / common Android). */
export const BASE_WIDTH = 390;

export const TABLET_BREAKPOINT = 600;
export const LARGE_TABLET_BREAKPOINT = 900;
export const MAX_CONTENT_WIDTH = 840;

export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 76 : 64;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Scale a size relative to screen width with a dampening factor. */
export function scaleSize(size: number, width: number, factor = 0.35): number {
  const scaled = size * (width / BASE_WIDTH);
  return Math.round(size + (scaled - size) * factor);
}

/** Gentler scaling for typography. */
export function moderateScale(size: number, width: number, factor = 0.25): number {
  return scaleSize(size, width, factor);
}

export function getContentPadding(width: number): number {
  if (width >= LARGE_TABLET_BREAKPOINT) {
    return 32;
  }
  if (width >= TABLET_BREAKPOINT) {
    return 28;
  }
  if (width < 360) {
    return 16;
  }
  return 24;
}

export function getContentWidth(width: number): number {
  return Math.min(width, MAX_CONTENT_WIDTH);
}

export function getGridColumns(
  width: number,
  options: { min?: number; max?: number; minColumnWidth?: number } = {},
): number {
  const { min = 2, max = 4, minColumnWidth = 150 } = options;
  const padding = getContentPadding(width) * 2;
  const available = Math.min(width - padding, MAX_CONTENT_WIDTH);
  const columns = Math.floor(available / minColumnWidth);
  return clamp(columns, min, max);
}

export function getStatColumns(width: number): number {
  if (width >= LARGE_TABLET_BREAKPOINT) {
    return 4;
  }
  if (width >= TABLET_BREAKPOINT) {
    return 3;
  }
  return 2;
}

export function getStatTileBasis(width: number): `${number}%` {
  const columns = getStatColumns(width);
  const gapShare = 2 * (columns - 1);
  return `${(100 - gapShare) / columns}%` as `${number}%`;
}
