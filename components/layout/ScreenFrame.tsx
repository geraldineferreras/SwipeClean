import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface ScreenFrameProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Centers content on tablets while keeping full-width backgrounds. */
export function ScreenFrame({ children, style }: ScreenFrameProps) {
  const { contentPadding, maxContentWidth } = useResponsiveLayout();

  return (
    <View style={[styles.frame, style]}>
      <View
        style={[
          styles.inner,
          { maxWidth: maxContentWidth, paddingHorizontal: contentPadding },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  inner: {
    flex: 1,
    width: '100%',
  },
});
