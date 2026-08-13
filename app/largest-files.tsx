import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LargestFileGrid } from '@/components/insights/LargestFileGrid';
import { LargestFilePreviewOverlay } from '@/components/insights/LargestFilePreviewOverlay';
import { LargestFilesSelectionBar } from '@/components/insights/LargestFilesSelectionBar';
import { ScreenScrollView } from '@/components/layout/ScreenScrollView';
import type { InsightsLargestFile } from '@/constants/insightsData';
import { theme } from '@/constants/theme';
import { useAppModal } from '@/contexts/AppModalContext';
import { useTrash } from '@/contexts/TrashContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes, formatCount } from '@/utils/formatBytes';

export default function LargestFilesScreen() {
  const { showConfirm } = useAppModal();
  const { largestFiles, moveLargestFilesToTrash } = useTrash();
  const { settingsButtonSize } = useResponsiveLayout();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedFilenames, setSelectedFilenames] = useState<Set<string>>(() => new Set());
  const [previewFile, setPreviewFile] = useState<InsightsLargestFile | null>(null);

  const totalBytes = useMemo(
    () => largestFiles.reduce((sum, file) => sum + file.bytes, 0),
    [largestFiles],
  );

  const selectedFiles = useMemo(
    () => largestFiles.filter((file) => selectedFilenames.has(file.filename)),
    [largestFiles, selectedFilenames],
  );

  const selectedBytes = useMemo(
    () => selectedFiles.reduce((sum, file) => sum + file.bytes, 0),
    [selectedFiles],
  );

  const handleSelectPress = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectedFilenames(new Set());
      return;
    }

    setIsSelecting(true);
    setSelectedFilenames(new Set(largestFiles.map((file) => file.filename)));
  }, [largestFiles, isSelecting]);

  const toggleFile = useCallback(
    (filename: string) => {
      if (!isSelecting) {
        setIsSelecting(true);
        setSelectedFilenames(new Set([filename]));
        return;
      }

      setSelectedFilenames((previous) => {
        const next = new Set(previous);
        if (next.has(filename)) {
          next.delete(filename);
        } else {
          next.add(filename);
        }
        return next;
      });
    },
    [isSelecting],
  );

  const handlePreview = useCallback((file: InsightsLargestFile) => {
    setPreviewFile(file);
  }, []);

  const handleRemove = useCallback(() => {
    if (selectedFiles.length === 0) {
      return;
    }

    const itemLabel = selectedFiles.length === 1 ? 'item' : 'items';

    showConfirm({
      title: 'Remove selected files?',
      message: `This will move ${selectedFiles.length} ${itemLabel} (${formatBytes(selectedBytes)}) to Trash.`,
      confirmText: 'Remove',
      onConfirm: () => {
        moveLargestFilesToTrash(selectedFiles);
        setSelectedFilenames(new Set());
        setIsSelecting(false);
      },
    });
  }, [moveLargestFilesToTrash, selectedBytes, selectedFiles, showConfirm]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <ScreenScrollView
          innerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
          style={styles.flex}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                { height: settingsButtonSize, width: settingsButtonSize },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={22} />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={styles.title}>Largest Files</Text>
              <Text style={styles.subtitle}>
                {formatCount(largestFiles.length)} files · {formatBytes(totalBytes)}
              </Text>
            </View>
            <View style={{ height: settingsButtonSize, width: settingsButtonSize }} />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Files</Text>
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

          {largestFiles.length > 0 ? (
            <LargestFileGrid
              files={largestFiles}
              isSelecting={isSelecting}
              onPreviewFile={handlePreview}
              onToggleFile={toggleFile}
              selectedFilenames={selectedFilenames}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No large files left</Text>
              <Text style={styles.emptyText}>Removed files were moved to Trash.</Text>
            </View>
          )}
        </ScreenScrollView>

        {isSelecting ? (
          <LargestFilesSelectionBar
            onRemove={handleRemove}
            selectedBytes={selectedBytes}
            selectedCount={selectedFiles.length}
          />
        ) : null}
      </View>

      <LargestFilePreviewOverlay
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        visible={previewFile !== null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexShrink: 0,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xxl,
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
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  headerText: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.7,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  scrollInner: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
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
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
    textAlign: 'center',
  },
});
