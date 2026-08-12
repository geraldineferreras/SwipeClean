import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { getTimeOfDayGreeting } from '@/utils/greeting';

export function GreetingHeader() {
  const greeting = getTimeOfDayGreeting();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.subtitle}>
        Your camera roll{'\n'}needs a little love.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  greeting: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.subtitle,
    lineHeight: 26,
  },
});
