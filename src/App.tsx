import { SensorPanel } from './components/SensorPanel';
import { StatusBanner } from './components/StatusBanner';
import { FaultInjectionPanel } from './components/FaultInjectionPanel';
import { HowItWorks } from './components/HowItWorks';
import { useSensorSimulation } from './hooks/useSensorSimulation';
import { SensorType } from './types';

const SENSOR_ORDER: SensorType[] = ['vibration', 'temperature', 'pressure', 'current'];

function App() {
  const { systemState, injectFault, clearFault } = useSensorSimulation();

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Industrial Extruder Monitoring
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time anomaly detection & predictive maintenance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-industrial-800/80 border border-industrial-600/50">
              <div className="w-2 h-2 rounded-full bg-status-normal animate-pulse" />
              <span className="text-xs text-gray-400 font-mono">
                {systemState.sensors.vibration.readings.length > 0 ? 'LIVE' : 'INITIALIZING'}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono hidden sm:block">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </header>

        {/* Status Banner */}
        <StatusBanner
          status={systemState.overallStatus}
          daysToFailure={systemState.daysToFailure}
          anomalyDetails={systemState.anomalyDetails}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sensor Panels - 3 columns on large screens */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SENSOR_ORDER.map(sensorType => (
                <SensorPanel
                  key={sensorType}
                  sensor={systemState.sensors[sensorType]}
                />
              ))}
            </div>
          </div>

          {/* Sidebar - Fault Injection */}
          <div className="lg:col-span-1 space-y-4">
            <FaultInjectionPanel
              activeFault={systemState.activeFault}
              onInjectFault={injectFault}
              onClearFault={clearFault}
            />
          </div>
        </div>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Footer */}
        <footer className="pt-6 border-t border-industrial-700/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>
              Industrial Sensor Anomaly Detection Dashboard
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-normal" />
                Normal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-warning" />
                Warning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-critical" />
                Critical
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
