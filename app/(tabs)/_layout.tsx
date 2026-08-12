import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { TAB_BAR_HEIGHT } from '@/utils/responsive';

type TabIconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ color, name }: { color: string; name: TabIconName }) {
  const { scale } = useResponsiveLayout();
  return <Ionicons color={color} name={name} size={scale(22, 0.15)} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { font } = useResponsiveLayout();
  const tabBarHeight = TAB_BAR_HEIGHT + (Platform.OS === 'android' ? Math.max(insets.bottom - 8, 0) : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: font(11),
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: tabBarHeight,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="home" />,
        }}
      />
      <Tabs.Screen
        name="albums"
        options={{
          title: 'Albums',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="grid-outline" />,
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: 'Trash',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="trash-outline" />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="pie-chart-outline" />,
        }}
      />
    </Tabs>
  );
}
