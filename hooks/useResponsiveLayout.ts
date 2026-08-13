import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

import { theme } from '@/constants/theme';
import {
  BASE_WIDTH,
  LARGE_TABLET_BREAKPOINT,
  MAX_CONTENT_WIDTH,
  TAB_BAR_HEIGHT,
  TABLET_BREAKPOINT,
  getContentPadding,
  getContentWidth,
  getGridColumns,
  getStatColumns,
  getStatTileBasis,
  moderateScale,
  scaleSize,
} from '@/utils/responsive';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isCompact = width < 360;
  const isTablet = width >= TABLET_BREAKPOINT;
  const isLargeTablet = width >= LARGE_TABLET_BREAKPOINT;

  const contentPadding = getContentPadding(width);
  const contentWidth = getContentWidth(width);
  const albumColumns = getGridColumns(width, { min: 2, max: 4, minColumnWidth: 150 });
  const trashColumns = getGridColumns(width, { min: 2, max: 4, minColumnWidth: 140 });
  const statColumns = getStatColumns(width);
  const statTileBasis = getStatTileBasis(width);

  const scale = (size: number, factor?: number) => scaleSize(size, width, factor);
  const font = (size: number, factor?: number) => moderateScale(size, width, factor);

  const tabBarOffset = TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 8));
  const scrollBottomPadding = tabBarOffset + theme.spacing.xl;

  const statGap = theme.spacing.sm;
  const statInnerWidth = Math.min(width, MAX_CONTENT_WIDTH) - contentPadding * 2;
  const statTileWidth = (statInnerWidth - statGap * (statColumns - 1)) / statColumns;

  return {
    width,
    height,
    insets,
    isCompact,
    isTablet,
    isLargeTablet,
    contentPadding,
    contentWidth,
    maxContentWidth: MAX_CONTENT_WIDTH,
    albumColumns,
    trashColumns,
    statColumns,
    statTileBasis,
    statTileWidth,
    scale,
    font,
    screenTitleSize: font(30),
    heroValueSize: font(28),
    settingsButtonSize: scale(44),
    tabBarOffset,
    scrollBottomPadding,
    baseWidth: BASE_WIDTH,
  };
}
