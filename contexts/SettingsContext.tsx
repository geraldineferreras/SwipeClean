import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { RecoveryRetentionDays } from '@/constants/settingsData';
import {
  DEFAULT_SETTINGS,
  loadPersistedSettings,
  savePersistedSettings,
} from '@/services/settingsStorage';

interface SettingsContextValue {
  aiSuggestionsEnabled: boolean;
  recoveryRetentionDays: RecoveryRetentionDays;
  skipHiddenItems: boolean;
  isHydrated: boolean;
  setAiSuggestionsEnabled: (value: boolean) => void;
  setRecoveryRetentionDays: (days: RecoveryRetentionDays) => void;
  setSkipHiddenItems: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [aiSuggestionsEnabled, setAiSuggestionsEnabledState] = useState(
    DEFAULT_SETTINGS.aiSuggestionsEnabled,
  );
  const [recoveryRetentionDays, setRecoveryRetentionDaysState] = useState<RecoveryRetentionDays>(
    DEFAULT_SETTINGS.recoveryRetentionDays,
  );
  const [skipHiddenItems, setSkipHiddenItemsState] = useState(DEFAULT_SETTINGS.skipHiddenItems);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    void loadPersistedSettings().then((settings) => {
      if (!mounted) {
        return;
      }

      setAiSuggestionsEnabledState(settings.aiSuggestionsEnabled);
      setRecoveryRetentionDaysState(settings.recoveryRetentionDays);
      setSkipHiddenItemsState(settings.skipHiddenItems);
      setIsHydrated(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void savePersistedSettings({
      aiSuggestionsEnabled,
      recoveryRetentionDays,
      skipHiddenItems,
    });
  }, [aiSuggestionsEnabled, isHydrated, recoveryRetentionDays, skipHiddenItems]);

  const setAiSuggestionsEnabled = useCallback((value: boolean) => {
    setAiSuggestionsEnabledState(value);
  }, []);

  const setRecoveryRetentionDays = useCallback((days: RecoveryRetentionDays) => {
    setRecoveryRetentionDaysState(days);
  }, []);

  const setSkipHiddenItems = useCallback((value: boolean) => {
    setSkipHiddenItemsState(value);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      aiSuggestionsEnabled,
      recoveryRetentionDays,
      skipHiddenItems,
      isHydrated,
      setAiSuggestionsEnabled,
      setRecoveryRetentionDays,
      setSkipHiddenItems,
    }),
    [
      aiSuggestionsEnabled,
      recoveryRetentionDays,
      skipHiddenItems,
      isHydrated,
      setAiSuggestionsEnabled,
      setRecoveryRetentionDays,
      setSkipHiddenItems,
    ],
  );

  if (!isHydrated) {
    return null;
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

export function useSettingsOptional() {
  return useContext(SettingsContext);
}
