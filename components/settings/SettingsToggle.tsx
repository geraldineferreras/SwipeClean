import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';

interface SettingsToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SettingsToggle({ value, onValueChange }: SettingsToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </Pressable>
  );
}

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;

const styles = StyleSheet.create({
  thumb: {
    backgroundColor: theme.colors.surface,
    borderRadius: THUMB_SIZE / 2,
    height: THUMB_SIZE,
    width: THUMB_SIZE,
  },
  thumbOff: {
    transform: [{ translateX: 3 }],
  },
  thumbOn: {
    transform: [{ translateX: TRACK_WIDTH - THUMB_SIZE - 3 }],
  },
  track: {
    borderRadius: TRACK_HEIGHT / 2,
    height: TRACK_HEIGHT,
    justifyContent: 'center',
    width: TRACK_WIDTH,
  },
  trackOff: {
    backgroundColor: '#E5E7EB',
  },
  trackOn: {
    backgroundColor: theme.colors.accent,
  },
});
