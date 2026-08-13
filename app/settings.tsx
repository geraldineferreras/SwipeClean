import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as StoreReview from 'expo-store-review';

import { SettingsLinkRow, SettingsRowCard } from '@/components/settings/SettingsRowCard';
import { SettingsToggle } from '@/components/settings/SettingsToggle';
import { ScreenFrame } from '@/components/layout/ScreenFrame';
import {
  ABOUT_CONTENT,
  ABOUT_LINKS,
  APP_VERSION,
  RECOVERY_RETENTION_OPTIONS,
} from '@/constants/settingsData';
import { theme } from '@/constants/theme';
import { useAppModal } from '@/contexts/AppModalContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export default function SettingsScreen() {
  const { showAlert, showOptions } = useAppModal();
  const {
    aiSuggestionsEnabled,
    recoveryRetentionDays,
    skipHiddenItems,
    setAiSuggestionsEnabled,
    setRecoveryRetentionDays,
    setSkipHiddenItems,
  } = useSettings();
  const { scrollBottomPadding, settingsButtonSize } = useResponsiveLayout();

  const handleRetentionPress = () => {
    showOptions({
      title: 'Recovery Vault',
      message: 'Choose how long deleted items stay in Trash before permanent deletion.',
      options: RECOVERY_RETENTION_OPTIONS.map((days) => `${days} days`),
      onSelect: (index) => {
        const days = RECOVERY_RETENTION_OPTIONS[index];
        if (days !== undefined) {
          setRecoveryRetentionDays(days);
        }
      },
    });
  };

  const handleAboutPress = (id: string) => {
    if (id === 'rate') {
      void (async () => {
        if (await StoreReview.isAvailableAsync()) {
          await StoreReview.requestReview();
          return;
        }

        const storeUrl = Platform.select({
          ios: 'https://apps.apple.com/app/swipe-clean',
          android: 'https://play.google.com/store/apps/details?id=com.swipeclean.app',
          default: undefined,
        });

        if (storeUrl) {
          try {
            await Linking.openURL(storeUrl);
            return;
          } catch {
            // Fall through to the alert below.
          }
        }

        showAlert({
          title: 'Rate Us',
          message:
            'Thanks for using SwipeClean! In-app rating will be available once the app is published to the App Store or Google Play.',
        });
      })();
      return;
    }

    const content = ABOUT_CONTENT[id];
    if (content) {
      showAlert({
        title: content.title,
        message: content.message,
      });
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScreenFrame>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { height: settingsButtonSize, width: settingsButtonSize },
              pressed && styles.backButtonPressed,
            ]}
          >
            <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={22} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={[styles.headerSpacer, { width: settingsButtonSize }]} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: scrollBottomPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>GENERAL</Text>

          <View style={styles.sectionGap}>
            <SettingsRowCard
              icon="trash-bin-outline"
              onPress={handleRetentionPress}
              subtitle={`Keep deleted items for ${recoveryRetentionDays} days`}
              title="Recovery Vault"
              trailing={
                <>
                  <Text style={styles.valueLink}>{recoveryRetentionDays} days</Text>
                  <Ionicons color={theme.colors.accent} name="chevron-forward" size={18} />
                </>
              }
            />

            <SettingsRowCard
              icon="sparkles-outline"
              subtitle="Show smart suggestions while cleaning"
              title="AI Suggestions"
              trailing={
                <SettingsToggle
                  onValueChange={setAiSuggestionsEnabled}
                  value={aiSuggestionsEnabled}
                />
              }
            />

            <SettingsRowCard
              icon="eye-off-outline"
              subtitle="Skip hidden photos and videos"
              title="Hidden Items"
              trailing={
                <SettingsToggle onValueChange={setSkipHiddenItems} value={skipHiddenItems} />
              }
            />
          </View>

          <Text style={styles.sectionLabel}>ABOUT</Text>

          <View style={styles.aboutCard}>
            {ABOUT_LINKS.map((item, index) => (
              <SettingsLinkRow
                key={item.id}
                icon={item.icon}
                isLast={index === ABOUT_LINKS.length - 1}
                label={item.label}
                onPress={() => handleAboutPress(item.id)}
              />
            ))}
          </View>

          <View style={styles.aboutCard}>
            <SettingsLinkRow
              icon="navigate-outline"
              isLast
              label="App Version"
              trailingText={APP_VERSION}
            />
          </View>
        </ScrollView>
      </ScreenFrame>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  aboutCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  content: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
  },
  headerSpacer: {
    flexShrink: 0,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  sectionGap: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.label,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  valueLink: {
    color: theme.colors.accent,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
});
