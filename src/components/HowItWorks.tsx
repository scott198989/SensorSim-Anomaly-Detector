import { useState } from 'react';

export function HowItWorks() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-panel overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-industrial-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-accent-cyan">ℹ️</span>
          <span className="font-medium text-gray-300">How This Works</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5 space-y-6">
          {/* Detection Approach */}
          <section>
            <h4 className="text-sm font-semibold text-accent-cyan uppercase tracking-wide mb-3">
              Anomaly Detection Approach
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="text-gray-300 font-medium">Z-Score Analysis</p>
                  <p className="text-xs mt-0.5">
                    Compares current readings against historical baseline. Values beyond ±2σ are flagged as anomalous.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="text-gray-300 font-medium">Rate of Change Detection</p>
                  <p className="text-xs mt-0.5">
                    Monitors the velocity of change using linear regression over a sliding window. Rapid changes indicate developing faults.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-cyan/20 flex items-center justify-center text-accent-cyan text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="text-gray-300 font-medium">Threshold Monitoring</p>
                  <p className="text-xs mt-0.5">
                    Tracks deviation from normal operating range with warning and critical thresholds for each sensor type.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Fault Signatures */}
          <section>
            <h4 className="text-sm font-semibold text-status-warning uppercase tracking-wide mb-3">
              Fault Signatures
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-industrial-700/30 border border-industrial-600/30">
                <p className="text-gray-300 font-medium text-sm">⚙️ Bearing Wear</p>
                <p className="text-xs text-gray-500 mt-1">
                  Manifests as increasing vibration with harmonic patterns at bearing rotation frequencies. Secondary effect on motor current.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-industrial-700/30 border border-industrial-600/30">
                <p className="text-gray-300 font-medium text-sm">🌡️ Heater Failure</p>
                <p className="text-xs text-gray-500 mt-1">
                  Temperature drift downward with increasing oscillation as control system struggles. Affects melt viscosity and pressure.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-industrial-700/30 border border-industrial-600/30">
                <p className="text-gray-300 font-medium text-sm">🔒 Pressure Blockage</p>
                <p className="text-xs text-gray-500 mt-1">
                  Sharp pressure increase with surging pattern. Motor current rises as screw works against restriction.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-industrial-700/30 border border-industrial-600/30">
                <p className="text-gray-300 font-medium text-sm">⚡ Motor Overload</p>
                <p className="text-xs text-gray-500 mt-1">
                  Current spike with instability. Mechanical stress causes vibration increase. Temperature may rise from motor heat.
                </p>
              </div>
            </div>
          </section>

          {/* Failure Prediction */}
          <section>
            <h4 className="text-sm font-semibold text-status-critical uppercase tracking-wide mb-3">
              Failure Prediction
            </h4>
            <p className="text-sm text-gray-400">
              Time-to-failure is estimated by extrapolating the current rate of change to the critical threshold crossing point.
              This uses linear regression on recent readings to project when sensor values will exceed safe operating limits.
            </p>
            <div className="mt-3 p-3 rounded-lg bg-industrial-800/50 border border-industrial-600/30">
              <code className="text-xs text-accent-cyan font-mono">
                t_failure = (threshold - current_value) / rate_of_change
              </code>
            </div>
          </section>

          {/* Technical Stack */}
          <section>
            <h4 className="text-sm font-semibold text-accent-purple uppercase tracking-wide mb-3">
              Technical Implementation
            </h4>
            <div className="flex flex-wrap gap-2">
              {['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'Client-side Simulation', 'SVG Sparklines'].map(tech => (
                <span
                  key={tech}
                  className="px-2 py-1 rounded text-xs font-medium bg-accent-purple/10 text-accent-purple border border-accent-purple/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
