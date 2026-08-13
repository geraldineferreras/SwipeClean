import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import { loadCachedAlbums, saveCachedAlbums } from '@/services/albumCache';
import { getCachedLibrarySummary } from '@/services/libraryScanService';
import {
  fetchAlbums,
  fetchLibrarySummary,
  getDemoAlbumAssets,
  getDemoAlbums,
  getDemoCleaningAssets,
  getDemoLibrarySummary,
  getPhotoAccess,
  loadAssetsForAlbum,
  loadAssetsForCleaning,
  presentLimitedLibraryPicker,
  requestPhotoAccess,
  type PhotoAccessResult,
} from '@/services/mediaLibrary';
import type { LibrarySummary, QuickCleanAlbum } from '@/types/cleanup';
import type { MediaAlbum, PhotoAccess, SwipeItem } from '@/types/media';
import {
  getMediaAccessErrorMessage,
  isAndroidExpoGoMediaBlocked,
  type MediaAccessBlockReason,
} from '@/utils/mediaLibraryAvailability';
import { useSettings } from '@/contexts/SettingsContext';

interface MediaLibraryContextValue {
  access: PhotoAccess;
  summary: LibrarySummary | null;
  cleaningAssets: SwipeItem[];
  albums: QuickCleanAlbum[];
  isLoading: boolean;
  isCleaningAssetsLoading: boolean;
  error: string | null;
  isSupported: boolean;
  isDemoMode: boolean;
  requiresDevBuild: boolean;
  blockedReason: MediaAccessBlockReason | null;
  refresh: () => Promise<void>;
  requestAccess: () => Promise<PhotoAccessResult>;
  openLimitedPicker: () => Promise<void>;
  loadCleaningBatch: () => Promise<SwipeItem[]>;
  loadAlbumAssets: (albumId: string) => Promise<SwipeItem[]>;
  enableDemoMode: () => void;
}

const MediaLibraryContext = createContext<MediaLibraryContextValue | null>(null);

function mapAlbumsToQuickClean(albums: MediaAlbum[]): QuickCleanAlbum[] {
  return albums.map((album) => ({
    id: album.id,
    label: album.title,
    count: album.assetCount,
    coverUri: album.coverUri ?? null,
  }));
}

export function MediaLibraryProvider({ children }: { children: ReactNode }) {
  const { skipHiddenItems } = useSettings();
  const [access, setAccess] = useState<PhotoAccess>('denied');
  const [summary, setSummary] = useState<LibrarySummary | null>(null);
  const [cleaningAssets, setCleaningAssets] = useState<SwipeItem[]>([]);
  const [isCleaningAssetsLoading, setIsCleaningAssetsLoading] = useState(false);
  const [albums, setAlbums] = useState<QuickCleanAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [requiresDevBuild, setRequiresDevBuild] = useState(false);
  const [blockedReason, setBlockedReason] = useState<MediaAccessBlockReason | null>(
    null,
  );
  const hasHydratedCacheRef = useRef(false);

  const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

  useEffect(() => {
    if (isAndroidExpoGoMediaBlocked() || isDemoMode) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const [cachedSummary, cachedAlbums] = await Promise.all([
        getCachedLibrarySummary(skipHiddenItems),
        loadCachedAlbums(skipHiddenItems),
      ]);

      if (!cancelled && cachedAlbums) {
        setAlbums(mapAlbumsToQuickClean(cachedAlbums));
      }

      if (!cancelled && cachedSummary) {
        setSummary(cachedSummary);
        setIsLoading(false);
        hasHydratedCacheRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDemoMode, skipHiddenItems]);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setRequiresDevBuild(false);
    setBlockedReason(null);
    setAccess('all');
    setError(null);
    setSummary(getDemoLibrarySummary());
    setCleaningAssets(getDemoCleaningAssets(skipHiddenItems));
    setAlbums(mapAlbumsToQuickClean(getDemoAlbums()));
    setIsLoading(false);
  }, [skipHiddenItems]);

  const applyBlockedState = useCallback((reason: MediaAccessBlockReason) => {
    setRequiresDevBuild(true);
    setBlockedReason(reason);
    setAccess('denied');
    setSummary(null);
    setCleaningAssets([]);
    setAlbums([]);
    setError(getMediaAccessErrorMessage(reason));
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupported) {
      setAccess('denied');
      setSummary(null);
      setCleaningAssets([]);
      setAlbums([]);
      setError('Photo library access is only available on iOS and Android.');
      setIsLoading(false);
      return;
    }

    if (isDemoMode) {
      setSummary(getDemoLibrarySummary());
      setCleaningAssets(getDemoCleaningAssets(skipHiddenItems));
      setAlbums(mapAlbumsToQuickClean(getDemoAlbums()));
      setIsLoading(false);
      return;
    }

    setError(null);
    setRequiresDevBuild(false);
    setBlockedReason(null);

    const showLoadingState = !hasHydratedCacheRef.current;
    if (showLoadingState) {
      setIsLoading(true);
    }

    try {
      const accessResult = await getPhotoAccess();

      if (accessResult.blockedReason) {
        applyBlockedState(accessResult.blockedReason);
        return;
      }

      setAccess(accessResult.access);

      if (!accessResult.granted) {
        setSummary(null);
        setCleaningAssets([]);
        setAlbums([]);
        return;
      }

      void fetchAlbums(skipHiddenItems).then((libraryAlbums) => {
        setAlbums(mapAlbumsToQuickClean(libraryAlbums));
        void saveCachedAlbums(libraryAlbums, skipHiddenItems);
      });

      const librarySummary = await fetchLibrarySummary(skipHiddenItems);
      setSummary(librarySummary);
      hasHydratedCacheRef.current = true;
      setIsLoading(false);

      setIsCleaningAssetsLoading(true);
      try {
        const assets = await loadAssetsForCleaning(skipHiddenItems);
        setCleaningAssets(assets);
      } catch (cleaningLoadError) {
        const message =
          cleaningLoadError instanceof Error
            ? cleaningLoadError.message
            : 'Could not load photos for cleaning.';
        setError(message);
        setCleaningAssets([]);
      } finally {
        setIsCleaningAssetsLoading(false);
      }
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'Failed to load your photo library.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [applyBlockedState, isDemoMode, isSupported, skipHiddenItems]);

  useEffect(() => {
    if (isAndroidExpoGoMediaBlocked()) {
      enableDemoMode();
      return;
    }

    void refresh();
  }, [enableDemoMode, refresh]);

  const requestAccess = useCallback(async () => {
    if (isAndroidExpoGoMediaBlocked()) {
      applyBlockedState('expo_go_android');
      return {
        granted: false,
        access: 'denied' as const,
        blockedReason: 'expo_go_android' as const,
      };
    }

    try {
      const result = await requestPhotoAccess();

      if (result.blockedReason) {
        applyBlockedState(result.blockedReason);
        return result;
      }

      setAccess(result.access);
      await refresh();
      return result;
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Could not request photo access.';
      setError(message);

      return {
        granted: false,
        access: 'denied' as const,
      };
    }
  }, [applyBlockedState, refresh]);

  const openLimitedPicker = useCallback(async () => {
    try {
      await presentLimitedLibraryPicker();
      await refresh();
    } catch (pickerError) {
      const message =
        pickerError instanceof Error
          ? pickerError.message
          : 'Could not open the photo picker.';
      setError(message);
    }
  }, [refresh]);

  const loadCleaningBatch = useCallback(async () => {
    if (isDemoMode) {
      const assets = getDemoCleaningAssets(skipHiddenItems);
      setCleaningAssets(assets);
      return assets;
    }

    setIsCleaningAssetsLoading(true);
    try {
      const assets = await loadAssetsForCleaning(skipHiddenItems);
      setCleaningAssets(assets);
      return assets;
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Could not load photos for cleaning.';
      setError(message);
      return [];
    } finally {
      setIsCleaningAssetsLoading(false);
    }
  }, [isDemoMode, skipHiddenItems]);

  const loadAlbumAssets = useCallback(
    async (albumId: string) => {
      if (isDemoMode) {
        return getDemoAlbumAssets(albumId, skipHiddenItems);
      }

      try {
        return await loadAssetsForAlbum(albumId, skipHiddenItems);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Could not load album photos.';
        setError(message);
        return [];
      }
    },
    [isDemoMode, skipHiddenItems],
  );

  const value = useMemo(
    () => ({
      access,
      summary,
      cleaningAssets,
      albums,
      isLoading,
      isCleaningAssetsLoading,
      error,
      isSupported,
      isDemoMode,
      requiresDevBuild,
      blockedReason,
      refresh,
      requestAccess,
      openLimitedPicker,
      loadCleaningBatch,
      loadAlbumAssets,
      enableDemoMode,
    }),
    [
      access,
      summary,
      cleaningAssets,
      albums,
      isLoading,
      isCleaningAssetsLoading,
      error,
      isSupported,
      isDemoMode,
      requiresDevBuild,
      blockedReason,
      refresh,
      requestAccess,
      openLimitedPicker,
      loadCleaningBatch,
      loadAlbumAssets,
      enableDemoMode,
    ],
  );

  return (
    <MediaLibraryContext.Provider value={value}>
      {children}
    </MediaLibraryContext.Provider>
  );
}

export function useMediaLibrary(): MediaLibraryContextValue {
  const context = useContext(MediaLibraryContext);
  if (!context) {
    throw new Error('useMediaLibrary must be used within MediaLibraryProvider');
  }
  return context;
}
