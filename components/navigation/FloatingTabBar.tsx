import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { active: TabIconName; inactive: TabIconName }> = {
  index: { active: 'home', inactive: 'home-outline' },
  albums: { active: 'grid', inactive: 'grid-outline' },
  trash: { active: 'trash', inactive: 'trash-outline' },
  insights: { active: 'pie-chart', inactive: 'pie-chart-outline' },
};

const BAR_TOP_RADIUS = 28;

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { font, scale } = useResponsiveLayout();
  const iconSize = scale(23, 0.12);
  const bottomInset = Platform.OS === 'ios' ? Math.max(insets.bottom, 8) : Math.max(insets.bottom, 10);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={[styles.bar, { paddingBottom: bottomInset }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          const isFocused = state.index === index;
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS.index;
          const iconName = isFocused ? icons.active : icons.inactive;
          const tint = isFocused ? theme.colors.accent : theme.colors.textSecondary;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              key={route.key}
              onLongPress={onLongPress}
              onPress={onPress}
              style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
            >
              <Ionicons color={tint} name={iconName} size={iconSize} />
              <Text
                style={[
                  styles.label,
                  {
                    color: tint,
                    fontSize: font(11),
                    fontWeight: isFocused ? '700' : '600',
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: BAR_TOP_RADIUS,
    borderTopRightRadius: BAR_TOP_RADIUS,
    elevation: 14,
    flexDirection: 'row',
    paddingTop: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  label: {
    marginTop: 4,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 4,
  },
  tabPressed: {
    opacity: 0.82,
  },
  wrapper: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});

export const FLOATING_TAB_BAR_TOP_RADIUS = BAR_TOP_RADIUS;
