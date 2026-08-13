import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { CleanupSessionProvider } from '@/contexts/CleanupSessionContext';
import { AppModalProvider } from '@/contexts/AppModalContext';
import { MediaLibraryProvider } from '@/contexts/MediaLibraryContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { theme } from '@/constants/theme';

export default function RootLayout() {
  return (
    <MediaLibraryProvider>
      <SettingsProvider>
        <CleanupSessionProvider>
          <AppModalProvider>
            <GestureHandlerRootView style={styles.root}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: theme.colors.background },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
                <Stack.Screen name="largest-files" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="dark" />
            </GestureHandlerRootView>
          </AppModalProvider>
        </CleanupSessionProvider>
      </SettingsProvider>
    </MediaLibraryProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
