import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ScreenScrollView } from '@/components/layout/ScreenScrollView';
import { TrashItemGrid } from '@/components/trash/TrashItemGrid';
import { TrashSelectionBar } from '@/components/trash/TrashSelectionBar';
import { TrashSummaryCard } from '@/components/trash/TrashSummaryCard';
import { getTrashTotals } from '@/types/trash';
import { SETTINGS_ROUTE } from '@/constants/routes';
import { useAppModal } from '@/contexts/AppModalContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTrash } from '@/contexts/TrashContext';
import { theme } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes } from '@/utils/formatBytes';

export default function TrashTabScreen() {
  const { showAlert, showConfirm } = useAppModal();
  const { recoveryRetentionDays } = useSettings();
  const { items, permanentlyDelete, restoreAllFromTrash, restoreFromTrash } = useTrash();
  const { screenTitleSize, settingsButtonSize } = useResponsiveLayout();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const totals = useMemo(() => getTrashTotals(items), [items]);

  const minDaysLeft = useMemo(() => {
    if (items.length === 0) {
      return recoveryRetentionDays;
    }

    return Math.min(...items.map((item) => item.daysLeft));
  }, [items, recoveryRetentionDays]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );

  const selectedBytes = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.fileSizeBytes, 0),
    [selectedItems],
  );

  const toggleItem = useCallback((id: string) => {
    if (!isSelecting) {
      setIsSelecting(true);
      setSelectedIds(new Set([id]));
      return;
    }

    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, [isSelecting]);

  const handleSelectPress = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectedIds(new Set());
      return;
    }

    setIsSelecting(true);
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [isSelecting, items]);

  const handleRestore = useCallback(() => {
    if (selectedItems.length === 0) {
      return;
    }

    const count = selectedItems.length;
    const itemLabel = count === 1 ? 'item' : 'items';

    showConfirm({
      title: 'Restore selected items?',
      message: `${count} ${itemLabel} will be returned to your gallery and cleaning queue.`,
      confirmText: 'Restore',
      destructive: false,
      onConfirm: () => {
        const restoredCount = restoreFromTrash([...selectedIds]);
        setSelectedIds(new Set());
        setIsSelecting(false);

        if (restoredCount > 0) {
          showAlert({
            title: 'Items restored',
            message: `${restoredCount} ${restoredCount === 1 ? 'item' : 'items'} restored to your gallery.`,
          });
        }
      },
    });
  }, [restoreFromTrash, selectedIds, selectedItems.length, showAlert, showConfirm]);

  const handleRestoreItem = useCallback(
    (id: string) => {
      showConfirm({
        title: 'Restore this item?',
        message: 'It will be returned to your gallery and cleaning queue.',
        confirmText: 'Restore',
        destructive: false,
        onConfirm: () => {
          const restoredCount = restoreFromTrash([id]);

          if (restoredCount > 0) {
            showAlert({
              title: 'Item restored',
              message: 'The item has been restored to your gallery.',
            });
          }
        },
      });
    },
    [restoreFromTrash, showAlert, showConfirm],
  );

  const handleRestoreAll = useCallback(() => {
    if (items.length === 0) {
      return;
    }

    showConfirm({
      title: 'Restore all items?',
      message: `All ${items.length} items in Trash will be returned to your gallery and cleaning queue.`,
      confirmText: 'Restore All',
      destructive: false,
      onConfirm: () => {
        const restoredCount = restoreAllFromTrash();
        setSelectedIds(new Set());
        setIsSelecting(false);

        if (restoredCount > 0) {
          showAlert({
            title: 'All items restored',
            message: `${restoredCount} ${restoredCount === 1 ? 'item' : 'items'} restored to your gallery.`,
          });
        }
      },
    });
  }, [items.length, restoreAllFromTrash, showAlert, showConfirm]);

  const handleDelete = useCallback(() => {
    showConfirm({
      title: 'Delete permanently?',
      message: `This will permanently remove ${selectedItems.length} items (${formatBytes(selectedBytes)}) from your gallery.`,
      confirmText: 'Delete',
      onConfirm: () => {
        void permanentlyDelete([...selectedIds]).then(() => {
          setSelectedIds(new Set());
          setIsSelecting(false);
        });
      },
    });
  }, [permanentlyDelete, selectedBytes, selectedIds, selectedItems.length, showConfirm]);

  const handleDeleteAll = useCallback(() => {
    showConfirm({
      title: 'Delete all now?',
      message: 'All items in Trash will be permanently deleted from your gallery.',
      confirmText: 'Delete All',
      onConfirm: () => {
        void permanentlyDelete(items.map((item) => item.id)).then(() => {
          setSelectedIds(new Set());
          setIsSelecting(false);
        });
      },
    });
  }, [items, permanentlyDelete, showConfirm]);

  const handleLearnMore = useCallback(() => {
    showAlert({
      title: 'About Trash',
      message: `Items you remove are kept here for ${recoveryRetentionDays} days. Restore them anytime — they stay on your phone until you permanently delete them.\n\nChange how long items stay in Trash in Settings under Recovery Vault.`,
    });
  }, [recoveryRetentionDays, showAlert]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenScrollView
          innerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
          style={styles.flex}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.title, { fontSize: screenTitleSize }]}>Trash</Text>
              <Text style={styles.subtitle}>Items removed by you</Text>
            </View>
            <Pressable
              onPress={() => router.push(SETTINGS_ROUTE)}
              style={[
                styles.settingsButton,
                { height: settingsButtonSize, width: settingsButtonSize },
              ]}
            >
              <Ionicons color={theme.colors.textSecondary} name="settings-outline" size={22} />
            </Pressable>
          </View>

          <TrashSummaryCard
            daysLeft={minDaysLeft}
            itemCount={totals.count}
            totalBytes={totals.bytes}
          />

          <View style={styles.infoBanner}>
            <View style={styles.infoRow}>
              <Ionicons color={theme.colors.accent} name="shield-checkmark-outline" size={18} />
              <Text style={styles.infoText}>
                Items in Trash stay on your phone until permanently deleted. Tap the restore button
                on any item, or use Restore All below.
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={handleLearnMore}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={styles.infoLink}>Learn more</Text>
            </Pressable>
          </View>

          {items.length > 0 ? (
            <Pressable
              onPress={handleRestoreAll}
              style={({ pressed }) => [styles.restoreAllButton, pressed && styles.pressed]}
            >
              <Ionicons color={theme.colors.accent} name="arrow-undo-outline" size={18} />
              <Text style={styles.restoreAllLabel}>Restore All ({items.length})</Text>
            </Pressable>
          ) : null}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Removed</Text>
            <View style={styles.sectionActions}>
              <Pressable
                hitSlop={8}
                onPress={handleSelectPress}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <Text style={[styles.selectLabel, isSelecting && styles.selectLabelActive]}>
                  {isSelecting ? 'Cancel' : 'Select'}
                </Text>
              </Pressable>
              <Ionicons color={theme.colors.textMuted} name="filter-outline" size={18} />
            </View>
          </View>

          {items.length > 0 ? (
            <TrashItemGrid
              isSelecting={isSelecting}
              items={items}
              onRestoreItem={handleRestoreItem}
              onToggleItem={toggleItem}
              selectedIds={selectedIds}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Trash is empty</Text>
              <Text style={styles.emptyText}>
                Deleted items will appear here for {recoveryRetentionDays} days.
              </Text>
            </View>
          )}

          {items.length > 0 ? (
            <View style={styles.tipBanner}>
              <View style={styles.tipRow}>
                <Ionicons color="#CA8A04" name="bulb-outline" size={18} />
                <Text style={styles.tipText}>
                  Don&apos;t want to wait? You can delete these items now to free up space.
                </Text>
              </View>
              <Pressable onPress={handleDeleteAll} style={styles.tipButton}>
                <Text style={styles.tipButtonText}>Delete All Now</Text>
              </Pressable>
            </View>
          ) : null}
        </ScreenScrollView>

        {isSelecting ? (
          <TrashSelectionBar
            onDelete={handleDelete}
            onRestore={handleRestore}
            selectedBytes={selectedBytes}
            selectedCount={selectedItems.length}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    textAlign: 'center',
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
  infoBanner: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  infoLink: {
    color: theme.colors.accent,
    fontSize: theme.typography.caption,
    fontWeight: '700',
    marginLeft: 26,
  },
  infoRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  infoText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  restoreAllButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accentRing,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  restoreAllLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  sectionActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  selectLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  selectLabelActive: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
  scrollInner: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexShrink: 0,
    justifyContent: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
  tipBanner: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  tipButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderRadius: theme.radius.pill,
    marginLeft: 26,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  tipButtonText: {
    color: theme.colors.delete,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  tipRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tipText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontSize: theme.typography.caption,
    lineHeight: 18,
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
