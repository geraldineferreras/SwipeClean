import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export type ReviewTab = 'photos' | 'videos';

interface ReviewTabsProps {
  activeTab: ReviewTab;
  onTabChange: (tab: ReviewTab) => void;
  photoCount: number;
  videoCount: number;
}

export function ReviewTabs({ activeTab, onTabChange, photoCount, videoCount }: ReviewTabsProps) {
  return (
    <View style={styles.container}>
      <TabButton
        active={activeTab === 'photos'}
        label={`Photos (${photoCount})`}
        onPress={() => onTabChange('photos')}
      />
      <TabButton
        active={activeTab === 'videos'}
        label={`Videos (${videoCount})`}
        onPress={() => onTabChange('videos')}
      />
    </View>
  );
}

function TabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active ? <View style={styles.tabIndicator} /> : <View style={styles.tabSpacer} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  tabButton: {
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
  },
  tabIndicator: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    height: 3,
    marginTop: theme.spacing.sm,
    width: '100%',
  },
  tabLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  tabSpacer: {
    height: 3,
    marginTop: theme.spacing.sm,
  },
});
