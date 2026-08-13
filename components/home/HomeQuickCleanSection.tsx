import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HOME_CATEGORY_ROWS } from '@/constants/homeCategories';
import { theme } from '@/constants/theme';
import type { LibrarySummary } from '@/types/cleanup';
import { formatBytes, formatCount } from '@/utils/formatBytes';
import { isQuickCleanCategory } from '@/utils/quickCleanFilters';

interface HomeQuickCleanSectionProps {
  summary: LibrarySummary;
}

export function HomeQuickCleanSection({ summary }: HomeQuickCleanSectionProps) {
  const handleRowPress = useCallback((cleanCategory?: string) => {
    if (cleanCategory && isQuickCleanCategory(cleanCategory)) {
      router.push({
        pathname: '/clean',
        params: { category: cleanCategory },
      });
      return;
    }

    router.push('/clean');
  }, []);

  const handleViewAll = useCallback(() => {
    router.push('/clean');
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Quick Clean</Text>
        <Pressable
          hitSlop={8}
          onPress={handleViewAll}
          style={({ pressed }) => [styles.viewAllButton, pressed && styles.viewAllPressed]}
        >
          <Text style={styles.viewAll}>View all</Text>
          <Ionicons color={theme.colors.accent} name="chevron-forward" size={16} />
        </Pressable>
      </View>

      <View style={styles.card}>
        {HOME_CATEGORY_ROWS.map((row, index) => {
          const count = summary.quickClean[row.key] ?? 0;
          const storageBytes = summary.quickCleanBytes[row.key] ?? 0;

          return (
            <Pressable
              key={row.key}
              onPress={() => handleRowPress(row.cleanCategory)}
              style={({ pressed }) => [
                styles.row,
                index < HOME_CATEGORY_ROWS.length - 1 && styles.rowBorder,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: row.softColor }]}>
                <Ionicons color={row.color} name={row.icon} size={20} />
              </View>

              <View style={styles.rowText}>
                <Text numberOfLines={1} style={styles.label}>
                  {row.label}
                </Text>
                <Text style={styles.meta}>{formatCount(count)} items</Text>
              </View>

              <View style={styles.trailing}>
                <Text numberOfLines={1} style={styles.storage}>
                  {formatBytes(storageBytes)}
                </Text>
                <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={18} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  container: {
    gap: theme.spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    marginTop: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  rowBorder: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  rowPressed: {
    backgroundColor: theme.colors.background,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  storage: {
    color: theme.colors.textSecondary,
    flexShrink: 0,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    maxWidth: 88,
    textAlign: 'right',
  },
  trailing: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
  },
  viewAll: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  viewAllButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  viewAllPressed: {
    opacity: 0.7,
  },
});
