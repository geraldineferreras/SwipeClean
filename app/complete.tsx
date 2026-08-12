import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/constants/theme';
import { useCleanupSessionContext } from '@/contexts/CleanupSessionContext';
import { formatBytes } from '@/utils/formatBytes';

export default function CompleteScreen() {
  const { lastCleanupResult } = useCleanupSessionContext();

  if (!lastCleanupResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Cleanup complete</Text>
          <Text style={styles.message}>Your library is a little tidier.</Text>
          <PrimaryButton
            label="Back to home"
            onPress={() => router.replace('/')}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.emoji}>✓</Text>
        <Text style={styles.title}>Cleanup complete</Text>
        <Text style={styles.message}>
          Removed {lastCleanupResult.deletedCount} item
          {lastCleanupResult.deletedCount === 1 ? '' : 's'} and freed{' '}
          {formatBytes(lastCleanupResult.freedBytes)}.
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Photos deleted</Text>
            <Text style={styles.statValue}>{lastCleanupResult.photoCount}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Videos deleted</Text>
            <Text style={styles.statValue}>{lastCleanupResult.videoCount}</Text>
          </View>
        </View>

        <PrimaryButton
          label="Back to home"
          onPress={() => router.replace('/')}
          style={styles.button}
        />

        <Pressable onPress={() => router.push('/clean')} style={styles.secondaryLink}>
          <Text style={styles.secondaryLinkText}>Clean more</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.xl,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emoji: {
    color: theme.colors.keep,
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  secondaryLink: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  secondaryLinkText: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  statsCard: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
    textAlign: 'center',
  },
});
