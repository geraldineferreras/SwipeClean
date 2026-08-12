import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReviewActions } from '@/components/review/ReviewActions';
import { ReviewGrid } from '@/components/review/ReviewGrid';
import { ReviewSummary } from '@/components/review/ReviewSummary';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { HOME_ROUTE } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useCleanupSessionContext } from '@/contexts/CleanupSessionContext';
import { deleteMarkedAssets } from '@/services/deletionService';
import type { CleanupSessionItem } from '@/types/cleanup';
import { formatBytes } from '@/utils/formatBytes';

function buildSelectedSet(items: CleanupSessionItem[]): Set<string> {
  return new Set(items.map((item) => item.assetId));
}

export default function ReviewScreen() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { markedForDeletion, resetSession, setLastCleanupResult } =
    useCleanupSessionContext();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() =>
    buildSelectedSet(markedForDeletion),
  );

  useEffect(() => {
    setSelectedIds(buildSelectedSet(markedForDeletion));
  }, [markedForDeletion]);

  const selectedItems = useMemo(
    () => markedForDeletion.filter((item) => selectedIds.has(item.assetId)),
    [markedForDeletion, selectedIds],
  );

  const photoCount = useMemo(
    () => selectedItems.filter((item) => item.mediaType === 'photo').length,
    [selectedItems],
  );

  const videoCount = useMemo(
    () => selectedItems.filter((item) => item.mediaType === 'video').length,
    [selectedItems],
  );

  const totalBytes = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.fileSizeBytes, 0),
    [selectedItems],
  );

  const toggleItem = useCallback((assetId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  }, []);

  const handleKeepEverything = useCallback(() => {
    resetSession();
    router.replace(HOME_ROUTE);
  }, [resetSession]);

  const performDelete = useCallback(async () => {
    setIsDeleting(true);

    const assetIds = selectedItems.map((item) => item.assetId);
    const result = await deleteMarkedAssets(assetIds);

    setIsDeleting(false);

    if (!result.success) {
      setErrorMessage(
        result.errors.join('\n') || 'Could not delete the selected items.',
      );
      return;
    }

    setLastCleanupResult({
      deletedCount: result.deletedCount,
      photoCount,
      videoCount,
      freedBytes: totalBytes,
    });
    resetSession();
    router.replace('/complete');
  }, [
    photoCount,
    resetSession,
    selectedItems,
    setLastCleanupResult,
    totalBytes,
    videoCount,
  ]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedItems.length === 0) {
      return;
    }

    setShowDeleteConfirm(true);
  }, [selectedItems.length]);

  const deleteConfirmMessage = useMemo(() => {
    const itemLabel = selectedItems.length === 1 ? 'item' : 'items';

    return `This will permanently delete ${selectedItems.length} ${itemLabel} (${formatBytes(totalBytes)}).\n\nYour device may ask you to confirm again.`;
  }, [selectedItems.length, totalBytes]);

  if (markedForDeletion.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nothing to review</Text>
          <Text style={styles.emptyMessage}>
            You have not marked any items for deletion in this session.
          </Text>
          <Pressable onPress={() => router.replace(HOME_ROUTE)} style={styles.backLink}>
            <Text style={styles.backLinkText}>Back to home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBack}>
            <Text style={styles.headerBackText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Review deletions</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ReviewSummary
          photoCount={photoCount}
          totalBytes={totalBytes}
          videoCount={videoCount}
        />

        <Text style={styles.hint}>
          Tap to unselect · hold to preview
        </Text>

        <View style={styles.gridContainer}>
          <ReviewGrid
            items={markedForDeletion}
            onToggleItem={toggleItem}
            selectedIds={selectedIds}
          />
        </View>

        <ReviewActions
          deleteDisabled={selectedItems.length === 0}
          isDeleting={isDeleting}
          onDeleteSelected={handleDeleteSelected}
          onKeepEverything={handleKeepEverything}
        />

        <ConfirmDialog
          cancelLabel="Cancel"
          confirmLabel="Delete"
          destructive
          message={deleteConfirmMessage}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            void performDelete();
          }}
          title="Delete selected items?"
          visible={showDeleteConfirm}
        />

        <ConfirmDialog
          confirmLabel="OK"
          message={errorMessage ?? ''}
          onConfirm={() => setErrorMessage(null)}
          title="Deletion failed"
          visible={errorMessage !== null}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backLink: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.sm,
  },
  backLinkText: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyMessage: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 24,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
    textAlign: 'center',
  },
  gridContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerBack: {
    minWidth: 56,
    paddingVertical: theme.spacing.xs,
  },
  headerBackText: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  headerSpacer: {
    minWidth: 56,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 18,
    marginTop: -theme.spacing.sm,
    textAlign: 'center',
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
});
