import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RecoveryRetentionDays } from '@/constants/settingsData';
import { RECOVERY_RETENTION_OPTIONS } from '@/constants/settingsData';

export const SETTINGS_STORAGE_KEY = '@swipeclean/settings';

export interface PersistedSettings {
  aiSuggestionsEnabled: boolean;
  recoveryRetentionDays: RecoveryRetentionDays;
  skipHiddenItems: boolean;
}

export const DEFAULT_SETTINGS: PersistedSettings = {
  aiSuggestionsEnabled: true,
  recoveryRetentionDays: 7,
  skipHiddenItems: false,
};

export async function loadPersistedSettings(): Promise<PersistedSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    const retention = RECOVERY_RETENTION_OPTIONS.includes(
      parsed.recoveryRetentionDays as RecoveryRetentionDays,
    )
      ? (parsed.recoveryRetentionDays as RecoveryRetentionDays)
      : DEFAULT_SETTINGS.recoveryRetentionDays;

    return {
      aiSuggestionsEnabled:
        typeof parsed.aiSuggestionsEnabled === 'boolean'
          ? parsed.aiSuggestionsEnabled
          : DEFAULT_SETTINGS.aiSuggestionsEnabled,
      recoveryRetentionDays: retention,
      skipHiddenItems:
        typeof parsed.skipHiddenItems === 'boolean'
          ? parsed.skipHiddenItems
          : DEFAULT_SETTINGS.skipHiddenItems,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function savePersistedSettings(settings: PersistedSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
