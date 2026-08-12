export type MediaType = 'photo' | 'video' | 'audio' | 'unknown';

export interface MediaAsset {
  id: string;
  uri: string;
  filename: string;
  mediaType: MediaType;
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  duration: number;
  fileSizeBytes?: number;
}

export type SwipeItem = MediaAsset & {
  fileSizeBytes: number;
};

export type PhotoAccess = 'all' | 'limited' | 'denied';

export type MediaAlbumType = 'album' | 'smartAlbum';

export interface MediaAlbum {
  id: string;
  title: string;
  assetCount: number;
  type: MediaAlbumType;
  coverUri?: string | null;
}
