import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormattedBytes } from '@/components/shared/FormattedBytes';
import { PartyPopperHero } from '@/components/complete/PartyPopperHero';
import { ALBUMS_TAB_ROUTE, HOME_ROUTE, TRASH_TAB_ROUTE } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useCleanupSessionContext } from '@/contexts/CleanupSessionContext';
import { formatCount } from '@/utils/formatBytes';

export default function CompleteScreen() {
  const { lastCleanupResult } = useCleanupSessionContext();

  if (!lastCleanupResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>All Clean!</Text>
          <Text style={styles.subtitle}>Your library is a little tidier.</Text>
          <Pressable onPress={() => router.replace(HOME_ROUTE)} style={styles.doneButton}>
            <Text style={styles.doneLabel}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PartyPopperHero />

        <Text style={styles.title}>All Clean!</Text>
        <Text style={styles.subtitle}>You freed up space</Text>

        <View style={styles.resultsCard}>
          <FormattedBytes bytes={lastCleanupResult.freedBytes} style={styles.savedValue} />
          <Text style={styles.savedLabel}>Saved</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{formatCount(lastCleanupResult.photoCount)}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{formatCount(lastCleanupResult.videoCount)}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
          </View>
        </View>

        <View style={styles.linksCard}>
          <CompleteLinkRow
            icon="copy-outline"
            onPress={() => router.replace(TRASH_TAB_ROUTE)}
            subtitle="See what was removed"
            title="View Cleaned Items"
          />
          <View style={styles.linkDivider} />
          <CompleteLinkRow
            icon="grid-outline"
            onPress={() => router.replace(ALBUMS_TAB_ROUTE)}
            subtitle="Explore your library"
            title="Go to Albums"
          />
        </View>

        <Pressable onPress={() => router.replace(HOME_ROUTE)} style={styles.doneButton}>
          <Text style={styles.doneLabel}>Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function CompleteLinkRow({
  icon,
  onPress,
  subtitle,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
      <View style={styles.linkIconWrap}>
        <Ionicons color={theme.colors.textSecondary} name={icon} size={20} />
      </View>
      <View style={styles.linkText}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  doneButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    minHeight: 56,
    paddingHorizontal: theme.spacing.lg,
  },
  doneLabel: {
    color: '#FFFFFF',
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  linkDivider: {
    backgroundColor: theme.colors.border,
    height: 1,
  },
  linkIconWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  linkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  linkSubtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    marginTop: 2,
  },
  linkText: {
    flex: 1,
    minWidth: 0,
  },
  linkTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  linksCard: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginTop: theme.spacing.lg,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
  },
  resultsCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: theme.colors.savingsSoft,
    borderColor: theme.colors.savingsBorder,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  savedLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  savedValue: {
    color: theme.colors.savings,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statDivider: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.savingsBorder,
    width: 1,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    width: '100%',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
});
