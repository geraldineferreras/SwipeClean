import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { theme } from '@/constants/theme';
import { TAB_BAR_HEIGHT } from '@/utils/responsive';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: styles.scene,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: TAB_BAR_HEIGHT,
          position: 'absolute',
        },
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="albums"
        options={{
          title: 'Albums',
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: 'Trash',
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: theme.colors.background,
  },
});
