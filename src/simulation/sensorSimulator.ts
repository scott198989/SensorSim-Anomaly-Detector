import { SensorType, FaultType, SensorConfig, SENSOR_CONFIGS } from '../types';

// Gaussian random using Box-Muller transform
function gaussianRandom(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * stdDev + mean;
}

// Generate pink noise (1/f noise) for more realistic sensor readings
class PinkNoiseGenerator {
  private b0 = 0;
  private b1 = 0;
  private b2 = 0;
  private b3 = 0;
  private b4 = 0;
  private b5 = 0;
  private b6 = 0;

  next(): number {
    const white = Math.random() * 2 - 1;
    this.b0 = 0.99886 * this.b0 + white * 0.0555179;
    this.b1 = 0.99332 * this.b1 + white * 0.0750759;
    this.b2 = 0.96900 * this.b2 + white * 0.1538520;
    this.b3 = 0.86650 * this.b3 + white * 0.3104856;
    this.b4 = 0.55000 * this.b4 + white * 0.5329522;
    this.b5 = -0.7616 * this.b5 - white * 0.0168980;
    const pink = this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362;
    this.b6 = white * 0.115926;
    return pink * 0.11;
  }
}

export class SensorSimulator {
  private config: SensorConfig;
  private pinkNoise: PinkNoiseGenerator;
  private baseValue: number;
  private drift: number = 0;
  private phase: number = Math.random() * Math.PI * 2;

  constructor(sensorType: SensorType) {
    this.config = SENSOR_CONFIGS[sensorType];
    this.pinkNoise = new PinkNoiseGenerator();
    this.baseValue = (this.config.normalMin + this.config.normalMax) / 2;
  }

  generateNormalReading(time: number): number {
    // Slow drift around center
    this.drift += gaussianRandom(0, 0.001);
    this.drift = Math.max(-0.5, Math.min(0.5, this.drift));

    // Base value with slight sinusoidal variation (simulating process cycles)
    const range = this.config.normalMax - this.config.normalMin;
    const cycleVariation = Math.sin(time * 0.001 + this.phase) * range * 0.1;

    // Add pink noise for realistic variation
    const noise = this.pinkNoise.next() * this.config.noiseLevel * 3;

    // Add occasional small spikes (normal process variations)
    const spike = Math.random() < 0.02 ? gaussianRandom(0, this.config.noiseLevel * 2) : 0;

    const value = this.baseValue + this.drift * range + cycleVariation + noise + spike;

    // Clamp to normal operating range with small margin
    return Math.max(
      this.config.normalMin - range * 0.1,
      Math.min(this.config.normalMax + range * 0.1, value)
    );
  }

  applyFaultEffect(
    normalValue: number,
    faultType: FaultType,
    faultProgress: number,
    time: number
  ): number {
    const sensorId = this.config.id;

    switch (faultType) {
      case 'bearing_wear':
        return this.applyBearingWear(normalValue, faultProgress, time, sensorId);
      case 'heater_failure':
        return this.applyHeaterFailure(normalValue, faultProgress, time, sensorId);
      case 'pressure_blockage':
        return this.applyPressureBlockage(normalValue, faultProgress, time, sensorId);
      case 'motor_overload':
        return this.applyMotorOverload(normalValue, faultProgress, time, sensorId);
      default:
        return normalValue;
    }
  }

  private applyBearingWear(
    value: number,
    progress: number,
    time: number,
    sensor: SensorType
  ): number {
    if (sensor === 'vibration') {
      // Primary effect: vibration creep + harmonic pattern
      const creep = progress * 8; // Up to 8 mm/s increase
      const harmonicFreq = 15 + progress * 10; // Increasing frequency
      const harmonicAmp = progress * 2;
      const harmonic = Math.sin(time * harmonicFreq * 0.01) * harmonicAmp;
      const secondHarmonic = Math.sin(time * harmonicFreq * 0.02) * harmonicAmp * 0.5;
      return value + creep + harmonic + secondHarmonic;
    }
    if (sensor === 'current') {
      // Secondary effect: slight current increase from friction
      return value + progress * 5;
    }
    return value;
  }

  private applyHeaterFailure(
    value: number,
    progress: number,
    time: number,
    sensor: SensorType
  ): number {
    if (sensor === 'temperature') {
      // Primary effect: temperature drift down + oscillation
      const drift = -progress * 80; // Up to 80°F drop
      const oscillationAmp = 5 + progress * 15;
      const oscillation = Math.sin(time * 0.05) * oscillationAmp;
      return value + drift + oscillation;
    }
    if (sensor === 'pressure') {
      // Secondary effect: pressure variation from viscosity changes
      const pressureEffect = progress * 200 * Math.sin(time * 0.03);
      return value + pressureEffect;
    }
    return value;
  }

  private applyPressureBlockage(
    value: number,
    progress: number,
    time: number,
    sensor: SensorType
  ): number {
    if (sensor === 'pressure') {
      // Primary effect: pressure spike
      const spike = progress * 1000; // Up to 1000 PSI increase
      const surging = Math.sin(time * 0.08) * progress * 100;
      return value + spike + surging;
    }
    if (sensor === 'current') {
      // Secondary effect: motor works harder
      const currentIncrease = progress * 15;
      return value + currentIncrease;
    }
    if (sensor === 'vibration') {
      // Tertiary effect: some vibration from surging
      return value + progress * 1.5;
    }
    return value;
  }

  private applyMotorOverload(
    value: number,
    progress: number,
    time: number,
    sensor: SensorType
  ): number {
    if (sensor === 'current') {
      // Primary effect: current spike with instability
      const spike = progress * 20; // Up to 20 amps increase
      const instability = Math.sin(time * 0.15) * progress * 5;
      const jitter = gaussianRandom(0, progress * 2);
      return value + spike + instability + jitter;
    }
    if (sensor === 'vibration') {
      // Secondary effect: vibration increase from motor stress
      const vibrationIncrease = progress * 4;
      const motorHarmonic = Math.sin(time * 0.2) * progress * 1.5;
      return value + vibrationIncrease + motorHarmonic;
    }
    if (sensor === 'temperature') {
      // Tertiary effect: slight temperature rise from motor heat
      return value + progress * 15;
    }
    return value;
  }

  clampToRange(value: number): number {
    return Math.max(this.config.min, Math.min(this.config.max, value));
  }
}
