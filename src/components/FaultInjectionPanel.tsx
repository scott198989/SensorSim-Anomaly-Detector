import { FaultType, FaultState, FAULT_CONFIGS } from '../types';

interface FaultInjectionPanelProps {
  activeFault: FaultState | null;
  onInjectFault: (faultType: FaultType) => void;
  onClearFault: () => void;
}

const FAULT_TYPES: FaultType[] = [
  'bearing_wear',
  'heater_failure',
  'pressure_blockage',
  'motor_overload',
];

export function FaultInjectionPanel({
  activeFault,
  onInjectFault,
  onClearFault,
}: FaultInjectionPanelProps) {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            Fault Injection
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Simulate equipment failures
          </p>
        </div>
        {activeFault?.active && (
          <button
            onClick={onClearFault}
            className="px-3 py-1.5 rounded-lg text-xs font-medium
              bg-status-critical/20 text-status-critical border border-status-critical/30
              hover:bg-status-critical/30 transition-colors"
          >
            Reset System
          </button>
        )}
      </div>

      {/* Fault Progress */}
      {activeFault?.active && (
        <div className="mb-4 p-3 rounded-lg bg-industrial-700/50 border border-industrial-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">
              Active: {FAULT_CONFIGS[activeFault.type].name}
            </span>
            <span className="text-xs font-mono text-status-warning">
              {(activeFault.progress * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-industrial-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-status-warning to-status-critical rounded-full transition-all duration-200"
              style={{ width: `${activeFault.progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Fault Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {FAULT_TYPES.map(faultType => {
          const config = FAULT_CONFIGS[faultType];
          const isActive = activeFault?.type === faultType && activeFault?.active;

          return (
            <button
              key={faultType}
              onClick={() => onInjectFault(faultType)}
              disabled={activeFault?.active}
              className={`
                btn-fault flex flex-col items-start text-left p-3
                ${isActive ? 'active' : ''}
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{config.icon}</span>
                <span className="font-medium">{config.name}</span>
              </div>
              <span className="text-xs text-gray-500 leading-tight">
                {config.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Info */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Faults develop over 30-60 seconds to simulate gradual equipment degradation
      </p>
    </div>
  );
}
