import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LargestFileCard } from '@/components/insights/LargestFileCard';
import { LargestFilePreviewOverlay } from '@/components/insights/LargestFilePreviewOverlay';
import { LargestFilesSelectionBar } from '@/components/insights/LargestFilesSelectionBar';
import { ScreenFrame } from '@/components/layout/ScreenFrame';
import { INSIGHTS_LARGEST_FILES, type InsightsLargestFile } from '@/constants/insightsData';
import { theme } from '@/constants/theme';
import { useAppModal } from '@/contexts/AppModalContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { formatBytes, formatCount } from '@/utils/formatBytes';

export default function LargestFilesScreen() {
  const { showConfirm } = useAppModal();
  const { contentPadding, isTablet, settingsButtonSize } = useResponsiveLayout();
  const columns = isTablet ? 3 : 2;
  const cellWidth = `${100 / columns}%` as `${number}%`;

  const [files, setFiles] = useState<InsightsLargestFile[]>(INSIGHTS_LARGEST_FILES);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedFilenames, setSelectedFilenames] = useState<Set<string>>(() => new Set());
  const [previewFile, setPreviewFile] = useState<InsightsLargestFile | null>(null);

  const totalBytes = useMemo(() => files.reduce((sum, file) => sum + file.bytes, 0), [files]);

  const selectedFiles = useMemo(
    () => files.filter((file) => selectedFilenames.has(file.filename)),
    [files, selectedFilenames],
  );

  const selectedBytes = useMemo(
    () => selectedFiles.reduce((sum, file) => sum + file.bytes, 0),
    [selectedFiles],
  );

  const allSelected = files.length > 0 && selectedFilenames.size === files.length;

  const handleSelectPress = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectedFilenames(new Set());
      return;
    }

    setIsSelecting(true);
  }, [isSelecting]);

  const handleSelectAll = useCallback(() => {
    if (!isSelecting) {
      setIsSelecting(true);
    }

    if (allSelected) {
      setSelectedFilenames(new Set());
      return;
    }

    setSelectedFilenames(new Set(files.map((file) => file.filename)));
  }, [allSelected, files, isSelecting]);

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
        setFiles((previous) =>
          previous.filter((file) => !selectedFilenames.has(file.filename)),
        );
        setSelectedFilenames(new Set());
        setIsSelecting(false);
      },
    });
  }, [selectedBytes, selectedFilenames, selectedFiles.length, showConfirm]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScreenFrame>
        <View style={styles.shell}>
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
                {formatCount(files.length)} files · {formatBytes(totalBytes)}
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={handleSelectPress}
              style={({ pressed }) => [
                styles.selectButton,
                { minHeight: settingsButtonSize },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.selectLabel, isSelecting && styles.selectLabelActive]}>
                {isSelecting ? 'Cancel' : 'Select'}
              </Text>
            </Pressable>
          </View>

          {isSelecting && files.length > 0 ? (
            <View style={[styles.selectAllRow, { paddingHorizontal: contentPadding }]}>
              <Pressable hitSlop={8} onPress={handleSelectAll} style={styles.selectAllButton}>
                <Text style={styles.selectAllLabel}>
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={[styles.content, { paddingHorizontal: contentPadding }]}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            {files.length > 0 ? (
              <View style={styles.grid}>
                {files.map((file) => (
                  <View key={file.filename} style={[styles.cell, { width: cellWidth }]}>
                    <LargestFileCard
                      file={file}
                      isSelected={selectedFilenames.has(file.filename)}
                      isSelecting={isSelecting}
                      onLongPress={() => handlePreview(file)}
                      onPress={() => toggleFile(file.filename)}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No large files left</Text>
                <Text style={styles.emptyText}>Removed files were moved to Trash.</Text>
              </View>
            )}
          </ScrollView>

          {isSelecting ? (
            <LargestFilesSelectionBar
              onRemove={handleRemove}
              selectedBytes={selectedBytes}
              selectedCount={selectedFiles.length}
            />
          ) : null}
        </View>
      </ScreenFrame>

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
    justifyContent: 'center',
  },
  cell: {
    padding: 6,
  },
  content: {
    paddingBottom: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
  },
  headerText: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.85,
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  selectAllButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
  },
  selectAllLabel: {
    color: theme.colors.accent,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  selectAllRow: {
    paddingBottom: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
  },
  selectButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    paddingHorizontal: theme.spacing.sm,
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
  shell: {
    flex: 1,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
  },
});
