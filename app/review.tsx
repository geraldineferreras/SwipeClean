import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReviewActions } from '@/components/review/ReviewActions';
import { ReviewGrid } from '@/components/review/ReviewGrid';
import { ReviewPreviewOverlay } from '@/components/review/ReviewPreviewOverlay';
import { ReviewSummary } from '@/components/review/ReviewSummary';
import { ReviewTabs, type ReviewTab } from '@/components/review/ReviewTabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { HOME_ROUTE } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useCleanupSessionContext } from '@/contexts/CleanupSessionContext';
import { useTrash } from '@/contexts/TrashContext';
import type { CleanupSessionItem } from '@/types/cleanup';
import { resolveAssetDisplayUri } from '@/utils/mediaHelpers';
import { formatBytes } from '@/utils/formatBytes';

function buildSelectedSet(items: CleanupSessionItem[]): Set<string> {
  return new Set(items.map((item) => item.assetId));
}

export default function ReviewScreen() {
  const [activeTab, setActiveTab] = useState<ReviewTab>('photos');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<CleanupSessionItem | null>(null);
  const { markedForDeletion, resetSession, setLastCleanupResult } =
    useCleanupSessionContext();
  const { addSessionItemsToTrash } = useTrash();

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

  const photoItems = useMemo(
    () => markedForDeletion.filter((item) => item.mediaType === 'photo'),
    [markedForDeletion],
  );

  const videoItems = useMemo(
    () => markedForDeletion.filter((item) => item.mediaType === 'video'),
    [markedForDeletion],
  );

  const visibleItems = activeTab === 'photos' ? photoItems : videoItems;

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

  const handleCancel = useCallback(() => {
    resetSession();
    router.replace(HOME_ROUTE);
  }, [resetSession]);

  const performDelete = useCallback(async () => {
    const thumbnailEntries = await Promise.all(
      selectedItems.map(async (item) => ({
        assetId: item.assetId,
        thumbnailUri: await resolveAssetDisplayUri({
          id: item.assetId,
          uri: item.uri,
        }),
      })),
    );
    const thumbnailUris = Object.fromEntries(
      thumbnailEntries.map((entry) => [entry.assetId, entry.thumbnailUri]),
    );

    setLastCleanupResult({
      deletedCount: selectedItems.length,
      photoCount,
      videoCount,
      freedBytes: totalBytes,
    });
    addSessionItemsToTrash(selectedItems, thumbnailUris);
    resetSession();
    router.replace('/complete');
  }, [
    addSessionItemsToTrash,
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

    return `This will move ${selectedItems.length} ${itemLabel} (${formatBytes(totalBytes)}) to Trash.\n\nYou can restore them from the Trash tab before permanently deleting.`;
  }, [selectedItems.length, totalBytes]);

  const handlePreviewAll = useCallback(() => {
    const firstItem =
      visibleItems.find((item) => selectedIds.has(item.assetId)) ?? visibleItems[0] ?? null;
    setPreviewItem(firstItem);
  }, [selectedIds, visibleItems]);

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
          <Pressable
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Review</Text>
          <Pressable hitSlop={8} onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>

        <ReviewSummary itemCount={selectedItems.length} totalBytes={totalBytes} />

        <ReviewTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          photoCount={photoItems.length}
          videoCount={videoItems.length}
        />

        <View style={styles.gridContainer}>
          <ReviewGrid
            items={visibleItems}
            onToggleItem={toggleItem}
            selectedIds={selectedIds}
          />
        </View>

        <Pressable hitSlop={8} onPress={handlePreviewAll} style={styles.previewLink}>
          <Text style={styles.previewLinkText}>Preview All</Text>
        </Pressable>

        <ReviewActions
          deleteDisabled={selectedItems.length === 0}
          isDeleting={isDeleting}
          onDeleteSelected={handleDeleteSelected}
          selectedCount={selectedItems.length}
        />

        <ConfirmDialog
          cancelLabel="Cancel"
          confirmLabel="Move to Trash"
          destructive
          message={deleteConfirmMessage}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            void performDelete();
          }}
          title="Move selected items to Trash?"
          visible={showDeleteConfirm}
        />

        <ConfirmDialog
          confirmLabel="OK"
          message={errorMessage ?? ''}
          onConfirm={() => setErrorMessage(null)}
          title="Deletion failed"
          visible={errorMessage !== null}
        />

        <ReviewPreviewOverlay
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          visible={previewItem !== null}
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
  cancelButton: {
    minWidth: 56,
    paddingVertical: theme.spacing.xs,
  },
  cancelText: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
    textAlign: 'right',
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
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  previewLink: {
    alignSelf: 'center',
    marginTop: -theme.spacing.sm,
  },
  previewLinkText: {
    color: theme.colors.accent,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
});
