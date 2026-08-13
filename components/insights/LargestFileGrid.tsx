import { StyleSheet, View } from 'react-native';

import { LargestFileCard } from '@/components/insights/LargestFileCard';
import type { InsightsLargestFile } from '@/constants/insightsData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface LargestFileGridProps {
  files: InsightsLargestFile[];
  isSelecting: boolean;
  selectedFilenames: Set<string>;
  onPreviewFile: (file: InsightsLargestFile) => void;
  onToggleFile: (filename: string) => void;
}

export function LargestFileGrid({
  files,
  isSelecting,
  selectedFilenames,
  onPreviewFile,
  onToggleFile,
}: LargestFileGridProps) {
  const { isTablet } = useResponsiveLayout();
  const columns = isTablet ? 3 : 2;
  const cellWidth = `${100 / columns}%` as `${number}%`;

  return (
    <View style={styles.grid}>
      {files.map((file) => (
        <View key={file.filename} style={[styles.cellWrapper, { width: cellWidth }]}>
          <LargestFileCard
            file={file}
            isSelected={selectedFilenames.has(file.filename)}
            isSelecting={isSelecting}
            onLongPress={isSelecting ? undefined : () => onPreviewFile(file)}
            onPress={() => onToggleFile(file.filename)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cellWrapper: {
    padding: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
