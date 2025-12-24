import { SensorReading, SensorConfig, AnomalyDetectionResult } from '../types';

interface Statistics {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
}

function calculateStatistics(readings: SensorReading[]): Statistics {
  if (readings.length === 0) {
    return { mean: 0, stdDev: 1, min: 0, max: 0 };
  }

  const values = readings.map(r => r.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(variance) || 1; // Avoid division by zero

  return {
    mean,
    stdDev,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export function calculateZScore(value: number, readings: SensorReading[]): number {
  const stats = calculateStatistics(readings);
  return (value - stats.mean) / stats.stdDev;
}

export function calculateRateOfChange(readings: SensorReading[], windowSize: number = 10): number {
  if (readings.length < windowSize) {
    return 0;
  }

  const recentReadings = readings.slice(-windowSize);
  const n = recentReadings.length;

  // Linear regression to find slope
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += recentReadings[i].value;
    sumXY += i * recentReadings[i].value;
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope || 0;
}

export function detectAnomaly(
  currentValue: number,
  readings: SensorReading[],
  config: SensorConfig,
  baselineReadings?: SensorReading[]
): AnomalyDetectionResult {
  const referenceReadings = baselineReadings || readings.slice(0, Math.max(30, readings.length / 2));

  const zScore = calculateZScore(currentValue, referenceReadings);
  const rateOfChange = calculateRateOfChange(readings, 15);

  const factors: string[] = [];
  let isAnomalous = false;
  let confidence = 0;

  // Check Z-score threshold
  const absZScore = Math.abs(zScore);
  if (absZScore > 2) {
    isAnomalous = true;
    confidence += Math.min(absZScore / 4, 0.4);
    factors.push(`Z-score: ${zScore.toFixed(2)} (>${zScore > 0 ? '+' : '-'}2σ)`);
  }

  // Check if outside normal operating range
  const normalCenter = (config.normalMin + config.normalMax) / 2;
  const normalRange = config.normalMax - config.normalMin;
  const deviationFromNormal = Math.abs(currentValue - normalCenter) / (normalRange / 2);

  if (deviationFromNormal > 1.5) {
    isAnomalous = true;
    confidence += Math.min((deviationFromNormal - 1) * 0.2, 0.3);
    factors.push(`Outside normal range by ${((deviationFromNormal - 1) * 100).toFixed(0)}%`);
  }

  // Check rate of change
  const normalizedRateOfChange = Math.abs(rateOfChange) / config.noiseLevel;
  if (normalizedRateOfChange > 5) {
    isAnomalous = true;
    confidence += Math.min(normalizedRateOfChange / 20, 0.3);
    factors.push(`Rapid ${rateOfChange > 0 ? 'increase' : 'decrease'}: ${Math.abs(rateOfChange).toFixed(3)}/tick`);
  }

  // Check for threshold crossings
  const warningDist = Math.abs(currentValue - normalCenter);
  if (warningDist > config.warningThreshold) {
    factors.push('Warning threshold exceeded');
    confidence += 0.15;
  }
  if (warningDist > config.criticalThreshold) {
    factors.push('Critical threshold exceeded');
    confidence += 0.25;
  }

  // Calculate days to failure prediction
  let predictedDaysToFailure: number | null = null;

  if (isAnomalous && Math.abs(rateOfChange) > 0.001) {
    // Determine critical threshold direction
    let criticalValue: number;
    if (rateOfChange > 0) {
      criticalValue = normalCenter + config.criticalThreshold;
    } else {
      criticalValue = normalCenter - config.criticalThreshold;
    }

    const ticksToThreshold = Math.abs((criticalValue - currentValue) / rateOfChange);
    // Assume 10 ticks per second, convert to days
    const secondsToThreshold = ticksToThreshold / 10;
    predictedDaysToFailure = Math.max(0.01, secondsToThreshold / 86400);

    // Scale to more realistic prediction (simulation runs faster than real-time)
    // Map simulation seconds to predicted days for demo purposes
    predictedDaysToFailure = Math.max(0.1, Math.min(30, predictedDaysToFailure * 500));
  }

  confidence = Math.min(confidence, 1);

  return {
    isAnomalous,
    confidence,
    zScore,
    rateOfChange,
    predictedDaysToFailure,
    contributingFactors: factors,
  };
}

export function getStatusFromValue(
  value: number,
  config: SensorConfig
): 'normal' | 'warning' | 'critical' {
  const normalCenter = (config.normalMin + config.normalMax) / 2;
  const deviation = Math.abs(value - normalCenter);

  if (deviation > config.criticalThreshold) {
    return 'critical';
  }
  if (deviation > config.warningThreshold) {
    return 'warning';
  }
  return 'normal';
}

// Moving average for smoothing display values
export function exponentialMovingAverage(
  newValue: number,
  previousEMA: number,
  alpha: number = 0.3
): number {
  return alpha * newValue + (1 - alpha) * previousEMA;
}
