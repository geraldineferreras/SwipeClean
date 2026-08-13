import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

interface SavingsSparklineProps {
  height?: number;
  width?: number;
}

const CHART_POINTS: [number, number][] = [
  [0, 36],
  [11, 30],
  [22, 32],
  [33, 24],
  [44, 26],
  [55, 18],
  [66, 14],
  [77, 10],
  [88, 7],
];

function buildLinePath(points: [number, number][]) {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

function buildAreaPath(points: [number, number][], baseline: number) {
  const last = points[points.length - 1];
  return `${buildLinePath(points)} L ${last[0]} ${baseline} L ${points[0][0]} ${baseline} Z`;
}

export function SavingsSparkline({ width = 88, height = 46 }: SavingsSparklineProps) {
  const baseline = 40;
  const scaledPoints = CHART_POINTS.map(([x, y]) => [
    (x / 88) * width,
    (y / 46) * height,
  ]) as [number, number][];
  const scaledBaseline = (baseline / 46) * height;
  const lastPoint = scaledPoints[scaledPoints.length - 1];

  return (
    <Svg height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
      <Defs>
        <LinearGradient id="savingsSparkFill" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#34A853" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#34A853" stopOpacity="0.02" />
        </LinearGradient>
      </Defs>

      <Line
        stroke="#BBF7D0"
        strokeDasharray="3 4"
        strokeWidth={1}
        x1={0}
        x2={width}
        y1={scaledBaseline}
        y2={scaledBaseline}
      />

      <Path d={buildAreaPath(scaledPoints, scaledBaseline)} fill="url(#savingsSparkFill)" />

      <Path
        d={buildLinePath(scaledPoints)}
        fill="none"
        stroke="#34A853"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />

      <Circle cx={lastPoint[0]} cy={lastPoint[1]} fill="#059669" r={3.5} />
    </Svg>
  );
}
