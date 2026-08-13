const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

export interface FormattedBytesParts {
  value: string;
  unit: string;
}

export function formatBytesParts(bytes: number, decimals = 1): FormattedBytesParts {
  if (bytes <= 0) {
    return { value: '0', unit: 'B' };
  }

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    UNITS.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return {
    value: value.toFixed(exponent === 0 ? 0 : decimals),
    unit: UNITS[exponent],
  };
}

export function formatBytes(bytes: number, decimals = 1): string {
  const { value, unit } = formatBytesParts(bytes, decimals);
  return `${value}\u00A0${unit}`;
}

export function formatCount(value: number): string {
  return value.toLocaleString();
}

/** Matches Android/iOS Settings display (decimal GB, not binary GiB). */
export function formatDeviceStorage(bytes: number, decimals = 0): string {
  if (bytes <= 0) {
    return '0 GB';
  }

  const gigabytes = bytes / 1_000_000_000;
  if (gigabytes >= 1) {
    const precision = gigabytes >= 10 ? 0 : decimals;
    return `${gigabytes.toFixed(precision)} GB`;
  }

  const megabytes = bytes / 1_000_000;
  return `${megabytes.toFixed(decimals)} MB`;
}

export function formatMediaLibraryBytes(summary: {
  storageUsedBytes: number;
  measuredAssetCount: number;
  scannedAssetCount: number;
}): string {
  const label = formatBytes(summary.storageUsedBytes);
  const isApproximate =
    summary.scannedAssetCount > 0 &&
    summary.measuredAssetCount < summary.scannedAssetCount;

  return isApproximate ? `~${label}` : label;
}
