export type SensorType = 'vibration' | 'temperature' | 'pressure' | 'current';

export type FaultType = 'bearing_wear' | 'heater_failure' | 'pressure_blockage' | 'motor_overload';

export type SystemStatus = 'normal' | 'warning' | 'critical';

export interface SensorConfig {
  id: SensorType;
  name: string;
  unit: string;
  min: number;
  max: number;
  normalMin: number;
  normalMax: number;
  warningThreshold: number;
  criticalThreshold: number;
  noiseLevel: number;
}

export interface SensorReading {
  timestamp: number;
  value: number;
  rawValue: number;
}

export interface SensorState {
  config: SensorConfig;
  readings: SensorReading[];
  currentValue: number;
  status: SystemStatus;
  zScore: number;
  rateOfChange: number;
  isAnomalous: boolean;
}

export interface FaultState {
  type: FaultType;
  active: boolean;
  progress: number; // 0-1, how far along the fault has developed
  startTime: number | null;
  daysToFailure: number | null;
}

export interface AnomalyDetectionResult {
  isAnomalous: boolean;
  confidence: number;
  zScore: number;
  rateOfChange: number;
  predictedDaysToFailure: number | null;
  contributingFactors: string[];
}

export interface SystemState {
  sensors: Record<SensorType, SensorState>;
  activeFault: FaultState | null;
  overallStatus: SystemStatus;
  daysToFailure: number | null;
  anomalyDetails: string[];
}

export const SENSOR_CONFIGS: Record<SensorType, SensorConfig> = {
  vibration: {
    id: 'vibration',
    name: 'Vibration',
    unit: 'mm/s',
    min: 0,
    max: 15,
    normalMin: 2,
    normalMax: 4,
    warningThreshold: 6,
    criticalThreshold: 10,
    noiseLevel: 0.15,
  },
  temperature: {
    id: 'temperature',
    name: 'Barrel Temp',
    unit: '°F',
    min: 300,
    max: 500,
    normalMin: 380,
    normalMax: 420,
    warningThreshold: 40,
    criticalThreshold: 60,
    noiseLevel: 2,
  },
  pressure: {
    id: 'pressure',
    name: 'Melt Pressure',
    unit: 'PSI',
    min: 2000,
    max: 4500,
    normalMin: 2800,
    normalMax: 3200,
    warningThreshold: 400,
    criticalThreshold: 700,
    noiseLevel: 25,
  },
  current: {
    id: 'current',
    name: 'Motor Current',
    unit: 'amps',
    min: 30,
    max: 80,
    normalMin: 45,
    normalMax: 55,
    warningThreshold: 10,
    criticalThreshold: 18,
    noiseLevel: 0.8,
  },
};

export const FAULT_CONFIGS: Record<FaultType, { name: string; description: string; icon: string }> = {
  bearing_wear: {
    name: 'Bearing Wear',
    description: 'Gradual vibration increase with harmonic patterns',
    icon: '⚙️',
  },
  heater_failure: {
    name: 'Heater Failure',
    description: 'Temperature drift down with oscillation',
    icon: '🌡️',
  },
  pressure_blockage: {
    name: 'Pressure Blockage',
    description: 'Pressure spike with current increase',
    icon: '🔒',
  },
  motor_overload: {
    name: 'Motor Overload',
    description: 'Current spike with vibration increase',
    icon: '⚡',
  },
};
