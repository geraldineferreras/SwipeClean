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
