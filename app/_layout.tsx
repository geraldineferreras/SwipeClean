import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { CleanupSessionProvider } from '@/contexts/CleanupSessionContext';
import { MediaLibraryProvider } from '@/contexts/MediaLibraryContext';
import { theme } from '@/constants/theme';

export default function RootLayout() {
  return (
    <MediaLibraryProvider>
      <CleanupSessionProvider>
        <GestureHandlerRootView style={styles.root}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
              animation: 'slide_from_right',
            }}
          />
          <StatusBar style="dark" />
        </GestureHandlerRootView>
      </CleanupSessionProvider>
    </MediaLibraryProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
