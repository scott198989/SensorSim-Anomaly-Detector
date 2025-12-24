import { SensorState } from '../types';
import { Sparkline } from './Sparkline';

interface SensorPanelProps {
  sensor: SensorState;
}

const STATUS_STYLES = {
  normal: {
    indicator: 'bg-status-normal',
    text: 'text-status-normal',
    glow: 'text-glow-green',
    border: 'border-status-normal/20',
  },
  warning: {
    indicator: 'bg-status-warning',
    text: 'text-status-warning',
    glow: 'text-glow-yellow',
    border: 'border-status-warning/30',
  },
  critical: {
    indicator: 'bg-status-critical',
    text: 'text-status-critical',
    glow: 'text-glow-red',
    border: 'border-status-critical/40',
  },
};

const SENSOR_ICONS: Record<string, string> = {
  vibration: '〰️',
  temperature: '🌡️',
  pressure: '⏲️',
  current: '⚡',
};

export function SensorPanel({ sensor }: SensorPanelProps) {
  const { config, readings, currentValue, status, zScore, isAnomalous } = sensor;
  const styles = STATUS_STYLES[status];

  const formatValue = (value: number): string => {
    if (config.id === 'vibration') {
      return value.toFixed(2);
    }
    if (config.id === 'temperature') {
      return value.toFixed(1);
    }
    if (config.id === 'pressure') {
      return value.toFixed(0);
    }
    return value.toFixed(1);
  };

  return (
    <div
      className={`sensor-panel ${isAnomalous ? styles.border : ''} ${
        status === 'critical' ? 'animate-pulse' : ''
      }`}
      style={{
        borderColor: isAnomalous
          ? status === 'critical'
            ? 'rgba(239, 68, 68, 0.5)'
            : status === 'warning'
            ? 'rgba(234, 179, 8, 0.4)'
            : undefined
          : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{SENSOR_ICONS[config.id]}</span>
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            {config.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`status-indicator ${styles.indicator}`}
            style={{ color: styles.indicator.replace('bg-', '') }}
          />
          <span className={`text-xs font-medium uppercase ${styles.text}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Current Value */}
      <div className="mb-4">
        <div className={`value-display ${styles.text} ${styles.glow}`}>
          {formatValue(currentValue)}
          <span className="text-lg ml-1 font-normal text-gray-400">{config.unit}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span>
            Range: {config.normalMin}-{config.normalMax} {config.unit}
          </span>
          {Math.abs(zScore) > 1 && (
            <span className={zScore > 2 || zScore < -2 ? styles.text : 'text-gray-400'}>
              Z: {zScore > 0 ? '+' : ''}{zScore.toFixed(1)}σ
            </span>
          )}
        </div>
      </div>

      {/* Sparkline */}
      <div className="relative">
        <Sparkline readings={readings} config={config} status={status} />

        {/* Reference lines overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full overflow-visible">
            <defs>
              <pattern
                id={`grid-${config.id}`}
                width="40"
                height="16"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 16"
                  fill="none"
                  stroke="rgba(75, 90, 111, 0.1)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-${config.id})`} />
          </svg>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-3 pt-3 border-t border-industrial-600/30 grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-gray-500">Min</span>
          <p className="font-mono text-gray-300">
            {readings.length > 0
              ? formatValue(Math.min(...readings.slice(-60).map(r => r.value)))
              : '-'}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Avg</span>
          <p className="font-mono text-gray-300">
            {readings.length > 0
              ? formatValue(
                  readings.slice(-60).reduce((a, b) => a + b.value, 0) /
                    Math.min(60, readings.length)
                )
              : '-'}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Max</span>
          <p className="font-mono text-gray-300">
            {readings.length > 0
              ? formatValue(Math.max(...readings.slice(-60).map(r => r.value)))
              : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
