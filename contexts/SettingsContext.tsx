import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { RecoveryRetentionDays } from '@/constants/settingsData';

interface SettingsContextValue {
  aiSuggestionsEnabled: boolean;
  recoveryRetentionDays: RecoveryRetentionDays;
  skipHiddenItems: boolean;
  setAiSuggestionsEnabled: (value: boolean) => void;
  setRecoveryRetentionDays: (days: RecoveryRetentionDays) => void;
  setSkipHiddenItems: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [recoveryRetentionDays, setRecoveryRetentionDays] = useState<RecoveryRetentionDays>(7);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);
  const [skipHiddenItems, setSkipHiddenItems] = useState(false);

  const value = useMemo<SettingsContextValue>(
    () => ({
      aiSuggestionsEnabled,
      recoveryRetentionDays,
      skipHiddenItems,
      setAiSuggestionsEnabled,
      setRecoveryRetentionDays,
      setSkipHiddenItems,
    }),
    [aiSuggestionsEnabled, recoveryRetentionDays, skipHiddenItems],
  );

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
