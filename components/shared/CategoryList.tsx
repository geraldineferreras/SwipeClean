import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { QuickCleanCategoryKey } from '@/types/cleanup';
import { formatBytes, formatCount } from '@/utils/formatBytes';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface CategoryRowData {
  key: string;
  label: string;
  icon: IoniconName;
  color: string;
  softColor: string;
  count: number;
  storageBytes: number;
  cleanCategory?: QuickCleanCategoryKey;
}

interface CategoryListProps {
  rows: CategoryRowData[];
  onRowPress: (row: CategoryRowData) => void;
}

export function CategoryList({ rows, onRowPress }: CategoryListProps) {
  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <Pressable
          key={row.key}
          onPress={() => onRowPress(row)}
          style={({ pressed }) => [
            styles.row,
            index < rows.length - 1 && styles.rowBorder,
            pressed && styles.rowPressed,
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: row.softColor }]}>
            <Ionicons color={row.color} name={row.icon} size={20} />
          </View>

          <View style={styles.rowText}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={styles.meta}>{formatCount(row.count)} items</Text>
          </View>

          <View style={styles.trailing}>
            <Text style={[styles.storage, { color: row.color }]}>
              {formatBytes(row.storageBytes)}
            </Text>
            <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={18} />
          </View>
        </Pressable>
      ))}
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
  },
  storage: {
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  trailing: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
});
