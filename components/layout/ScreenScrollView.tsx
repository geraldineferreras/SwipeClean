import type { ReactNode } from 'react';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface ScreenScrollViewProps extends Omit<ScrollViewProps, 'contentContainerStyle'> {
  children: ReactNode;
  bottomInset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}

export function ScreenScrollView({
  bottomInset,
  children,
  contentContainerStyle,
  innerStyle,
  style,
  ...scrollProps
}: ScreenScrollViewProps) {
  const { contentPadding, maxContentWidth, scrollBottomPadding } = useResponsiveLayout();
  const paddingBottom = bottomInset ?? scrollBottomPadding;

  return (
    <ScrollView
      {...scrollProps}
      contentContainerStyle={[styles.scrollContent, { paddingBottom }, contentContainerStyle]}
      style={[styles.flex, style]}
    >
      <View
        style={[
          styles.inner,
          { maxWidth: maxContentWidth, paddingHorizontal: contentPadding },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  inner: {
    alignSelf: 'center',
    gap: 16,
    paddingTop: 16,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
});
