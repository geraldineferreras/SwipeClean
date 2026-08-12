import * as MediaLibrary from 'expo-media-library';

export interface DeleteAssetsResult {
  success: boolean;
  deletedCount: number;
  errors: string[];
}

function isDemoAssetId(assetId: string): boolean {
  return assetId.startsWith('mock-');
}

export async function deleteMarkedAssets(
  assetIds: string[],
): Promise<DeleteAssetsResult> {
  if (assetIds.length === 0) {
    return { success: true, deletedCount: 0, errors: [] };
  }

  const demoIds = assetIds.filter(isDemoAssetId);
  const realIds = assetIds.filter((id) => !isDemoAssetId(id));

  if (realIds.length === 0) {
    return {
      success: true,
      deletedCount: demoIds.length,
      errors: [],
    };
  }

  try {
    const deleted = await MediaLibrary.deleteAssetsAsync(realIds);

    return {
      success: deleted,
      deletedCount: deleted ? realIds.length + demoIds.length : demoIds.length,
      errors: deleted ? [] : ['Deletion was not confirmed or failed.'],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown deletion error';

    return {
      success: false,
      deletedCount: 0,
      errors: [message],
    };
  }
}
