import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import {
  fetchLibrarySummary,
  fetchAlbums,
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

interface MediaLibraryContextValue {
  access: PhotoAccess;
  summary: LibrarySummary | null;
  cleaningAssets: SwipeItem[];
  albums: QuickCleanAlbum[];
  isLoading: boolean;
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
  const [access, setAccess] = useState<PhotoAccess>('denied');
  const [summary, setSummary] = useState<LibrarySummary | null>(null);
  const [cleaningAssets, setCleaningAssets] = useState<SwipeItem[]>([]);
  const [albums, setAlbums] = useState<QuickCleanAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [requiresDevBuild, setRequiresDevBuild] = useState(false);
  const [blockedReason, setBlockedReason] = useState<MediaAccessBlockReason | null>(
    null,
  );

  const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setRequiresDevBuild(false);
    setBlockedReason(null);
    setAccess('all');
    setError(null);
    setSummary(getDemoLibrarySummary());
    setCleaningAssets(getDemoCleaningAssets());
    setAlbums(mapAlbumsToQuickClean(getDemoAlbums()));
    setIsLoading(false);
  }, []);

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
      setCleaningAssets(getDemoCleaningAssets());
      setAlbums(mapAlbumsToQuickClean(getDemoAlbums()));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setRequiresDevBuild(false);
    setBlockedReason(null);

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

      const [librarySummary, assets, libraryAlbums] = await Promise.all([
        fetchLibrarySummary(),
        loadAssetsForCleaning(),
        fetchAlbums(),
      ]);

      setSummary(librarySummary);
      setCleaningAssets(assets);
      setAlbums(mapAlbumsToQuickClean(libraryAlbums));
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'Failed to load your photo library.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [applyBlockedState, isDemoMode, isSupported]);

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
      const assets = getDemoCleaningAssets();
      setCleaningAssets(assets);
      return assets;
    }

    try {
      const assets = await loadAssetsForCleaning();
      setCleaningAssets(assets);
      return assets;
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Could not load photos for cleaning.';
      setError(message);
      return [];
    }
  }, [isDemoMode]);

  const loadAlbumAssets = useCallback(
    async (albumId: string) => {
      if (isDemoMode) {
        return getDemoAlbumAssets(albumId);
      }

      try {
        return await loadAssetsForAlbum(albumId);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Could not load album photos.';
        setError(message);
        return [];
      }
    },
    [isDemoMode],
  );

  const value = useMemo(
    () => ({
      access,
      summary,
      cleaningAssets,
      albums,
      isLoading,
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
