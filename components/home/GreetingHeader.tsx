import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { getTimeOfDayGreeting } from '@/utils/greeting';

interface GreetingHeaderProps {
  onSettingsPress?: () => void;
}

export function GreetingHeader({ onSettingsPress }: GreetingHeaderProps) {
  const greeting = getTimeOfDayGreeting();
  const { font, isCompact, settingsButtonSize } = useResponsiveLayout();
  const titleSize = font(isCompact ? 26 : 30);
  const lineHeight = font(isCompact ? 32 : 36);

  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <Text style={styles.greeting}>{greeting} 👋</Text>
        <Text style={[styles.title, { fontSize: titleSize, lineHeight }]}>
          Let&apos;s clean your{'\n'}camera roll ✨
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Settings"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onSettingsPress}
        style={({ pressed }) => [
          styles.settingsButton,
          { height: settingsButtonSize, width: settingsButtonSize },
          pressed && styles.settingsPressed,
        ]}
      >
        <Ionicons color={theme.colors.textSecondary} name="settings-outline" size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  greeting: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    fontWeight: '500',
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexShrink: 0,
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
  },
  settingsPressed: {
    opacity: 0.85,
  },
  textColumn: {
    flex: 1,
    gap: theme.spacing.sm,
    minWidth: 0,
    paddingRight: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
});
