import Svg, { Circle } from 'react-native-svg';

import type { StorageOverviewSegment } from '@/utils/insightsSummary';

const TRACK_COLOR = '#E5E7EB';
const SEGMENT_GAP = 2;

interface SegmentedStorageDonutProps {
  size: number;
  strokeWidth?: number;
  segments: StorageOverviewSegment[];
}

export function SegmentedStorageDonut({
  size,
  strokeWidth = 10,
  segments,
}: SegmentedStorageDonutProps) {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const activeSegments = segments.filter((segment) => segment.bytes > 0);
  const totalBytes = activeSegments.reduce((sum, segment) => sum + segment.bytes, 0);

  if (totalBytes <= 0) {
    return (
      <Svg height={size} width={size}>
        <Circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
        />
      </Svg>
    );
  }

  let cumulativeOffset = 0;

  return (
    <Svg height={size} width={size}>
      <Circle
        cx={center}
        cy={center}
        fill="none"
        r={radius}
        stroke={TRACK_COLOR}
        strokeWidth={strokeWidth}
      />
      {activeSegments.map((segment) => {
        const ratio = segment.bytes / totalBytes;
        const arcLength = Math.max(
          ratio * circumference - (activeSegments.length > 1 ? SEGMENT_GAP : 0),
          0,
        );
        const strokeDasharray = `${arcLength} ${circumference - arcLength}`;
        const strokeDashoffset = -cumulativeOffset;
        cumulativeOffset += ratio * circumference;

        return (
          <Circle
            key={segment.label}
            cx={center}
            cy={center}
            fill="none"
            r={radius}
            stroke={segment.color}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            strokeWidth={strokeWidth}
            transform={`rotate(-90 ${center} ${center})`}
          />
        );
      })}
    </Svg>
  );
}
