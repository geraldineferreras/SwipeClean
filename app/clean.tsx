import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionBar } from '@/components/clean/ActionBar';
import { CleanScreenHeader } from '@/components/clean/CleanScreenHeader';
import { MediaAccessGate } from '@/components/clean/MediaAccessGate';
import { ProgressIndicator } from '@/components/clean/ProgressIndicator';
import { SimilarPhotosChip } from '@/components/clean/SimilarPhotosChip';
import { SwipeCardStack, type SwipeCardRef } from '@/components/clean/SwipeCard';
import { HOME_ROUTE } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useCleanupSessionContext } from '@/contexts/CleanupSessionContext';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { useSwipeSounds } from '@/hooks/useSwipeSounds';
import type { SwipeItem } from '@/types/media';
import { DEV_BUILD_DOCS_URL } from '@/utils/mediaLibraryAvailability';
import {
  filterAssetsByCategory,
  getQuickCleanCategoryLabel,
  isQuickCleanCategory,
} from '@/utils/quickCleanFilters';
import { getSimilarPhotoCount } from '@/utils/similarPhotos';
import { formatBytes } from '@/utils/formatBytes';
import { formatMediaDate } from '@/utils/formatDate';

export default function CleanScreen() {
  const swipeRef = useRef<SwipeCardRef>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastInitKeyRef = useRef<string | null>(null);
  const hasNavigatedToReviewRef = useRef(false);

  const { category: categoryParam, albumId, albumTitle } = useLocalSearchParams<{
    category?: string;
    albumId?: string;
    albumTitle?: string;
  }>();
  const activeCategory =
    !albumId && categoryParam && isQuickCleanCategory(categoryParam)
      ? categoryParam
      : null;
  const activeAlbumId = typeof albumId === 'string' ? albumId : null;
  const activeAlbumTitle =
    typeof albumTitle === 'string' && albumTitle.length > 0 ? albumTitle : null;

  const [albumAssets, setAlbumAssets] = useState<SwipeItem[]>([]);
  const [isAlbumLoading, setIsAlbumLoading] = useState(false);

  const {
    access,
    cleaningAssets,
    isLoading,
    error,
    isSupported,
    isDemoMode,
    requiresDevBuild,
    requestAccess,
    openLimitedPicker,
    loadCleaningBatch,
    loadAlbumAssets,
    enableDemoMode,
  } = useMediaLibrary();

  const {
    items,
    currentItem,
    nextItem,
    isComplete,
    progressCurrent,
    progressTotal,
    canUndo,
    markedForDeletion,
    initializeSession,
    recordDecision,
    finishSession,
    undoLastDecision,
  } = useCleanupSessionContext();

  const isCompleteRef = useRef(isComplete);
  isCompleteRef.current = isComplete;

  const { playDecisionSound } = useSwipeSounds();

  useEffect(() => {
    if (!activeAlbumId) {
      setAlbumAssets([]);
      setIsAlbumLoading(false);
      return;
    }

    let cancelled = false;
    setIsAlbumLoading(true);

    void loadAlbumAssets(activeAlbumId).then((assets) => {
      if (cancelled) {
        return;
      }

      setAlbumAssets(assets);
      setIsAlbumLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [activeAlbumId, loadAlbumAssets]);

  const sessionAssets = useMemo(() => {
    if (activeAlbumId) {
      return albumAssets;
    }

    if (!activeCategory) {
      return cleaningAssets;
    }

    return filterAssetsByCategory(cleaningAssets, activeCategory);
  }, [activeAlbumId, activeCategory, albumAssets, cleaningAssets]);

  const sessionInitKey = useMemo(
    () =>
      `${activeAlbumId ?? activeCategory ?? 'all'}:${sessionAssets.map((item) => item.id).join('|')}`,
    [activeAlbumId, activeCategory, sessionAssets],
  );

  useEffect(() => {
    if (sessionAssets.length === 0) {
      return;
    }

    if (lastInitKeyRef.current === sessionInitKey) {
      return;
    }

    initializeSession(sessionAssets);
    lastInitKeyRef.current = sessionInitKey;
    hasNavigatedToReviewRef.current = false;
  }, [initializeSession, sessionAssets, sessionInitKey]);

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    if (markedForDeletion.length > 0 && !hasNavigatedToReviewRef.current) {
      hasNavigatedToReviewRef.current = true;
      router.push('/review');
      return;
    }

    if (markedForDeletion.length === 0) {
      router.replace(HOME_ROUTE);
    }
  }, [isComplete, markedForDeletion.length]);

  // Restart when returning to this screen after a finished session
  useFocusEffect(
    useCallback(() => {
      if (sessionAssets.length > 0 && isCompleteRef.current) {
        initializeSession(sessionAssets);
        lastInitKeyRef.current = sessionInitKey;
        hasNavigatedToReviewRef.current = false;
      }
    }, [initializeSession, sessionAssets, sessionInitKey]),
  );

  useEffect(() => {
    if (isComplete) {
      setIsAnimating(false);
    }
  }, [isComplete]);

  useEffect(() => {
    setIsAnimating(false);
  }, [currentItem?.id]);

  const handleDecision = useCallback(
    (decision: 'keep' | 'delete') => {
      recordDecision(decision);
      setIsAnimating(false);
    },
    [recordDecision],
  );

  const handleDeletePress = useCallback(() => {
    if (isAnimating || !currentItem) {
      return;
    }

    setIsAnimating(true);
    swipeRef.current?.swipe('delete');
  }, [currentItem, isAnimating]);

  const handleKeepPress = useCallback(() => {
    if (isAnimating || !currentItem) {
      return;
    }

    setIsAnimating(true);
    swipeRef.current?.swipe('keep');
  }, [currentItem, isAnimating]);

  const handleUndo = useCallback(() => {
    if (isAnimating || !canUndo) {
      return;
    }

    undoLastDecision();
  }, [canUndo, isAnimating, undoLastDecision]);

  const handleDone = useCallback(() => {
    if (isAnimating || isComplete) {
      return;
    }

    finishSession();
  }, [finishSession, isAnimating, isComplete]);

  const cleaningTitle = useMemo(() => {
    if (activeAlbumTitle) {
      return activeAlbumTitle;
    }

    if (activeCategory) {
      return getQuickCleanCategoryLabel(activeCategory);
    }

    return 'Cleaning All Photos';
  }, [activeAlbumTitle, activeCategory]);

  const similarPhotoCount = useMemo(
    () => (currentItem ? getSimilarPhotoCount(currentItem) : 0),
    [currentItem],
  );

  const handleDetailsPress = useCallback((item: SwipeItem) => {
    Alert.alert(
      item.filename,
      `${formatBytes(item.fileSizeBytes)} · ${formatMediaDate(item.creationTime)}\n${item.width} x ${item.height}`,
    );
  }, []);

  const handleSimilarPress = useCallback(() => {
    Alert.alert('Similar photos', 'Reviewing similar photos will be available in a future update.');
  }, []);

  const handleRetryLoad = useCallback(async () => {
    if (activeAlbumId) {
      const assets = await loadAlbumAssets(activeAlbumId);
      setAlbumAssets(assets);

      if (assets.length > 0) {
        initializeSession(assets);
        lastInitKeyRef.current = `${activeAlbumId}:${assets.map((item) => item.id).join('|')}`;
      }

      return;
    }

    const assets = await loadCleaningBatch();
    const nextAssets = activeCategory
      ? filterAssetsByCategory(assets, activeCategory)
      : assets;

    if (nextAssets.length > 0) {
      initializeSession(nextAssets);
      lastInitKeyRef.current = `${activeCategory ?? 'all'}:${nextAssets.map((item) => item.id).join('|')}`;
    }
  }, [
    activeAlbumId,
    activeCategory,
    initializeSession,
    loadAlbumAssets,
    loadCleaningBatch,
  ]);

  if (!isSupported) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MediaAccessGate
          message="Use an iPhone or Android device to clean your camera roll with SwipeClean."
          title="Not available here"
        />
      </SafeAreaView>
    );
  }

  if (isLoading || (activeAlbumId && isAlbumLoading)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MediaAccessGate
          isLoading
          message={
            activeAlbumId
              ? 'Loading album photos…'
              : 'Loading your photos and videos…'
          }
          title="Getting ready"
        />
      </SafeAreaView>
    );
  }

  if (requiresDevBuild) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MediaAccessGate
          message="Google Play now blocks full photo-library access inside Expo Go on Android. Build a development version of SwipeClean to use your real camera roll."
          onPrimaryPress={() => void Linking.openURL(DEV_BUILD_DOCS_URL)}
          onSecondaryPress={enableDemoMode}
          primaryLabel="How to create a dev build"
          secondaryLabel="Try demo photos instead"
          title="Expo Go limitation"
        />
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (access === 'denied') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MediaAccessGate
          message="SwipeClean needs photo access to show your camera roll. Nothing leaves your device."
          onPrimaryPress={() => void requestAccess()}
          primaryLabel="Allow photo access"
          title="Photo access needed"
        />
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MediaAccessGate
          message={error}
          onPrimaryPress={() => void handleRetryLoad()}
          primaryLabel="Try again"
          title="Something went wrong"
        />
      </SafeAreaView>
    );
  }

  if (!activeAlbumId && cleaningAssets.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MediaAccessGate
          message={
            access === 'limited'
              ? 'You granted limited access but no photos are visible yet. Add photos to continue.'
              : 'Your library appears empty. Add some photos or videos to start cleaning.'
          }
          onPrimaryPress={
            access === 'limited' ? () => void openLimitedPicker() : undefined
          }
          primaryLabel={access === 'limited' ? 'Choose photos' : undefined}
          title="Nothing to clean"
        />
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (sessionAssets.length === 0) {
    const categoryLabel = activeCategory
      ? getQuickCleanCategoryLabel(activeCategory)
      : null;

    return (
      <SafeAreaView style={styles.safeArea}>
        <MediaAccessGate
          message={
            activeAlbumTitle
              ? `"${activeAlbumTitle}" has no photos or videos to clean right now.`
              : categoryLabel
                ? `No ${categoryLabel.toLowerCase()} found in this batch yet.`
                : 'Nothing to clean in this category.'
          }
          title={
            activeAlbumTitle
              ? 'Album is empty'
              : categoryLabel
                ? `No ${categoryLabel.toLowerCase()}`
                : 'Nothing to clean'
          }
        />
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MediaAccessGate
          isLoading
          message={
            markedForDeletion.length > 0
              ? 'Taking you to review…'
              : 'Wrapping up…'
          }
          title="Session complete"
        />
      </SafeAreaView>
    );
  }

  if (!currentItem) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CleanScreenHeader
          doneDisabled={isAnimating}
          onBack={() => router.back()}
          onDone={handleDone}
          title={cleaningTitle}
        />

        <ProgressIndicator current={progressCurrent} total={progressTotal} />

        {access === 'limited' ? (
          <Pressable
            onPress={() => void openLimitedPicker()}
            style={styles.limitedBanner}
          >
            <Text style={styles.limitedBannerText}>
              Limited access · Tap to add more photos
            </Text>
          </Pressable>
        ) : null}

        {isDemoMode ? (
          <Text style={styles.batchHint}>Demo mode — sample photos only</Text>
        ) : null}

        <View style={styles.cardArea}>
          <SwipeCardStack
            currentItem={currentItem}
            isInteractive={!isAnimating}
            nextItem={nextItem}
            onDecision={handleDecision}
            onDetailsPress={handleDetailsPress}
            onSwipeStart={(decision) => void playDecisionSound(decision)}
            swipeRef={swipeRef}
          />
        </View>

        <SimilarPhotosChip count={similarPhotoCount} onPress={handleSimilarPress} />

        <ActionBar
          canUndo={canUndo}
          disabled={isAnimating}
          onDelete={handleDeletePress}
          onKeep={handleKeepPress}
          onUndo={handleUndo}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backLink: {
    alignSelf: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  backLinkText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    fontWeight: '500',
  },
  batchHint: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    textAlign: 'center',
  },
  cardArea: {
    flex: 1,
    marginTop: theme.spacing.sm,
    minHeight: 360,
  },
  container: {
    flex: 1,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  limitedBanner: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  limitedBannerText: {
    color: theme.colors.accent,
    fontSize: theme.typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  safeArea: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
});
