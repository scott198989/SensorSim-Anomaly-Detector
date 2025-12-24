import { SystemStatus } from '../types';

interface StatusBannerProps {
  status: SystemStatus;
  daysToFailure: number | null;
  anomalyDetails: string[];
}

const STATUS_CONFIG = {
  normal: {
    title: 'NORMAL OPERATION',
    subtitle: 'All sensors within operating parameters',
    bgClass: 'from-status-normal/20 via-status-normal/10 to-transparent',
    borderClass: 'border-status-normal/30',
    textClass: 'text-status-normal',
    glowClass: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
    icon: '✓',
  },
  warning: {
    title: 'ANOMALY DETECTED',
    subtitle: 'Sensor readings outside normal range',
    bgClass: 'from-status-warning/20 via-status-warning/10 to-transparent',
    borderClass: 'border-status-warning/40',
    textClass: 'text-status-warning',
    glowClass: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]',
    icon: '⚠',
  },
  critical: {
    title: 'FAILURE IMMINENT',
    subtitle: 'Critical threshold exceeded - immediate action required',
    bgClass: 'from-status-critical/25 via-status-critical/15 to-transparent',
    borderClass: 'border-status-critical/50',
    textClass: 'text-status-critical',
    glowClass: 'shadow-[0_0_40px_rgba(239,68,68,0.4)]',
    icon: '✕',
  },
};

export function StatusBanner({ status, daysToFailure, anomalyDetails }: StatusBannerProps) {
  const config = STATUS_CONFIG[status];

  const formatDaysToFailure = (days: number): string => {
    if (days < 1) {
      const hours = days * 24;
      if (hours < 1) {
        return `${Math.round(hours * 60)} minutes`;
      }
      return `${hours.toFixed(1)} hours`;
    }
    return `${days.toFixed(1)} days`;
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border ${config.borderClass}
        bg-gradient-to-r ${config.bgClass}
        ${config.glowClass}
        transition-all duration-500
      `}
    >
      {/* Animated background pattern for critical status */}
      {status === 'critical' && (
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(239, 68, 68, 0.1) 10px,
                rgba(239, 68, 68, 0.1) 20px
              )`,
              animation: 'slide 2s linear infinite',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes slide {
          from { transform: translateX(-28px); }
          to { transform: translateX(0); }
        }
      `}</style>

      <div className="relative px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Main Status */}
          <div className="flex items-center gap-4">
            <div
              className={`
                flex items-center justify-center w-12 h-12 rounded-xl
                ${status === 'normal' ? 'bg-status-normal/20' : ''}
                ${status === 'warning' ? 'bg-status-warning/20' : ''}
                ${status === 'critical' ? 'bg-status-critical/20 animate-pulse' : ''}
              `}
            >
              <span className={`text-2xl ${config.textClass}`}>{config.icon}</span>
            </div>
            <div>
              <h2
                className={`
                  text-xl font-bold tracking-wider ${config.textClass}
                  ${status === 'critical' ? 'animate-pulse' : ''}
                `}
              >
                {config.title}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{config.subtitle}</p>
            </div>
          </div>

          {/* Days to Failure */}
          {daysToFailure !== null && status !== 'normal' && (
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Estimated Time to Failure
              </p>
              <p className={`text-2xl font-mono font-bold ${config.textClass}`}>
                {formatDaysToFailure(daysToFailure)}
              </p>
            </div>
          )}
        </div>

        {/* Anomaly Details */}
        {anomalyDetails.length > 0 && (
          <div className="mt-4 pt-4 border-t border-industrial-600/30">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Contributing Factors
            </p>
            <div className="flex flex-wrap gap-2">
              {anomalyDetails.map((detail, i) => (
                <span
                  key={i}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${status === 'critical'
                      ? 'bg-status-critical/20 text-status-critical'
                      : 'bg-status-warning/20 text-status-warning'
                    }
                  `}
                >
                  {detail}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
