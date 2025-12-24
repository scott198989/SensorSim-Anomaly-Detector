import { useMemo } from 'react';
import { SensorReading, SensorConfig, SystemStatus } from '../types';

interface SparklineProps {
  readings: SensorReading[];
  config: SensorConfig;
  status: SystemStatus;
  width?: number;
  height?: number;
}

const STATUS_COLORS = {
  normal: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
};

const STATUS_GRADIENTS = {
  normal: ['#22c55e', '#15803d'],
  warning: ['#eab308', '#a16207'],
  critical: ['#ef4444', '#b91c1c'],
};

export function Sparkline({
  readings,
  config,
  status,
  width = 280,
  height = 64,
}: SparklineProps) {
  const { path, areaPath, points } = useMemo(() => {
    if (readings.length < 2) {
      return { path: '', areaPath: '', points: [] };
    }

    // Use last 60 readings (6 seconds at 10Hz)
    const recentReadings = readings.slice(-60);
    const padding = { top: 4, bottom: 4, left: 2, right: 2 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate min/max for scaling
    const values = recentReadings.map(r => r.value);
    let minVal = Math.min(...values);
    let maxVal = Math.max(...values);

    // Ensure we have a reasonable range including normal bounds
    minVal = Math.min(minVal, config.normalMin - config.noiseLevel * 2);
    maxVal = Math.max(maxVal, config.normalMax + config.noiseLevel * 2);

    // Add some padding to the range
    const range = maxVal - minVal || 1;
    minVal -= range * 0.1;
    maxVal += range * 0.1;

    const scaleX = (i: number) =>
      padding.left + (i / (recentReadings.length - 1)) * chartWidth;
    const scaleY = (v: number) =>
      padding.top + chartHeight - ((v - minVal) / (maxVal - minVal)) * chartHeight;

    const pts = recentReadings.map((r, i) => ({
      x: scaleX(i),
      y: scaleY(r.value),
      value: r.value,
    }));

    // Create smooth path using cardinal spline
    let pathD = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[Math.max(0, i - 2)];
      const p1 = pts[i - 1];
      const p2 = pts[i];
      const p3 = pts[Math.min(pts.length - 1, i + 1)];

      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    // Create area path
    const areaD = `${pathD} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

    return { path: pathD, areaPath: areaD, points: pts };
  }, [readings, config, width, height]);

  const gradientId = `sparkline-gradient-${config.id}`;
  const areaGradientId = `sparkline-area-gradient-${config.id}`;

  return (
    <div className="sparkline-container">
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        style={{ filter: `drop-shadow(0 0 3px ${STATUS_COLORS[status]}40)` }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={STATUS_GRADIENTS[status][0]} stopOpacity="0.6" />
            <stop offset="100%" stopColor={STATUS_GRADIENTS[status][0]} stopOpacity="1" />
          </linearGradient>
          <linearGradient id={areaGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={STATUS_COLORS[status]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={STATUS_COLORS[status]} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${areaGradientId})`} />

        {/* Main line */}
        <path
          d={path}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Latest point indicator */}
        {points.length > 0 && (
          <>
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="4"
              fill={STATUS_COLORS[status]}
              className="animate-pulse"
            />
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="6"
              fill="none"
              stroke={STATUS_COLORS[status]}
              strokeWidth="1"
              opacity="0.5"
            />
          </>
        )}
      </svg>
    </div>
  );
}
