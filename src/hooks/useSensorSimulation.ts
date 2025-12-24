import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SensorType,
  FaultType,
  SensorState,
  SystemState,
  SystemStatus,
  SENSOR_CONFIGS,
  SensorReading,
} from '../types';
import { SensorSimulator } from '../simulation/sensorSimulator';
import { detectAnomaly, getStatusFromValue, exponentialMovingAverage } from '../detection/anomalyDetector';

const TICK_INTERVAL = 100; // 100ms = 10 readings per second
const MAX_HISTORY = 600; // 60 seconds of history
const FAULT_DURATION = 45000; // 45 seconds to full fault development

function createInitialSensorState(sensorType: SensorType): SensorState {
  const config = SENSOR_CONFIGS[sensorType];
  return {
    config,
    readings: [],
    currentValue: (config.normalMin + config.normalMax) / 2,
    status: 'normal',
    zScore: 0,
    rateOfChange: 0,
    isAnomalous: false,
  };
}

export function useSensorSimulation() {
  const [systemState, setSystemState] = useState<SystemState>(() => ({
    sensors: {
      vibration: createInitialSensorState('vibration'),
      temperature: createInitialSensorState('temperature'),
      pressure: createInitialSensorState('pressure'),
      current: createInitialSensorState('current'),
    },
    activeFault: null,
    overallStatus: 'normal',
    daysToFailure: null,
    anomalyDetails: [],
  }));

  const simulatorsRef = useRef<Record<SensorType, SensorSimulator>>({
    vibration: new SensorSimulator('vibration'),
    temperature: new SensorSimulator('temperature'),
    pressure: new SensorSimulator('pressure'),
    current: new SensorSimulator('current'),
  });

  const baselineReadingsRef = useRef<Record<SensorType, SensorReading[]>>({
    vibration: [],
    temperature: [],
    pressure: [],
    current: [],
  });

  const tickCountRef = useRef(0);
  const emaValuesRef = useRef<Record<SensorType, number>>({
    vibration: 3,
    temperature: 400,
    pressure: 3000,
    current: 50,
  });

  const injectFault = useCallback((faultType: FaultType) => {
    setSystemState(prev => ({
      ...prev,
      activeFault: {
        type: faultType,
        active: true,
        progress: 0,
        startTime: Date.now(),
        daysToFailure: null,
      },
    }));
  }, []);

  const clearFault = useCallback(() => {
    setSystemState(prev => ({
      ...prev,
      activeFault: null,
    }));
    // Reset simulators for fresh start
    simulatorsRef.current = {
      vibration: new SensorSimulator('vibration'),
      temperature: new SensorSimulator('temperature'),
      pressure: new SensorSimulator('pressure'),
      current: new SensorSimulator('current'),
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      tickCountRef.current++;
      const currentTime = Date.now();

      setSystemState(prev => {
        const newSensors = { ...prev.sensors };
        let worstStatus: SystemStatus = 'normal';
        let minDaysToFailure: number | null = null;
        const allAnomalyDetails: string[] = [];

        // Calculate fault progress
        let faultProgress = 0;
        if (prev.activeFault?.active && prev.activeFault.startTime) {
          const elapsed = currentTime - prev.activeFault.startTime;
          faultProgress = Math.min(1, elapsed / FAULT_DURATION);
        }

        // Update each sensor
        const sensorTypes: SensorType[] = ['vibration', 'temperature', 'pressure', 'current'];

        for (const sensorType of sensorTypes) {
          const simulator = simulatorsRef.current[sensorType];
          const config = SENSOR_CONFIGS[sensorType];

          // Generate base reading
          let rawValue = simulator.generateNormalReading(tickCountRef.current);

          // Apply fault effects if active
          if (prev.activeFault?.active && faultProgress > 0) {
            rawValue = simulator.applyFaultEffect(
              rawValue,
              prev.activeFault.type,
              faultProgress,
              tickCountRef.current
            );
          }

          // Clamp to valid range
          rawValue = simulator.clampToRange(rawValue);

          // Apply EMA smoothing for display
          const smoothedValue = exponentialMovingAverage(
            rawValue,
            emaValuesRef.current[sensorType],
            0.4
          );
          emaValuesRef.current[sensorType] = smoothedValue;

          // Create reading
          const reading: SensorReading = {
            timestamp: currentTime,
            value: smoothedValue,
            rawValue,
          };

          // Update readings history
          const newReadings = [...prev.sensors[sensorType].readings, reading];
          if (newReadings.length > MAX_HISTORY) {
            newReadings.shift();
          }

          // Store baseline readings (first 50 readings when no fault)
          if (
            !prev.activeFault?.active &&
            baselineReadingsRef.current[sensorType].length < 50
          ) {
            baselineReadingsRef.current[sensorType].push(reading);
          }

          // Detect anomalies
          const detection = detectAnomaly(
            smoothedValue,
            newReadings,
            config,
            baselineReadingsRef.current[sensorType].length >= 30
              ? baselineReadingsRef.current[sensorType]
              : undefined
          );

          const status = getStatusFromValue(smoothedValue, config);

          // Track worst status
          if (status === 'critical') {
            worstStatus = 'critical';
          } else if (status === 'warning' && worstStatus !== 'critical') {
            worstStatus = 'warning';
          }

          // Track minimum days to failure
          if (detection.predictedDaysToFailure !== null) {
            if (minDaysToFailure === null || detection.predictedDaysToFailure < minDaysToFailure) {
              minDaysToFailure = detection.predictedDaysToFailure;
            }
          }

          // Collect anomaly details
          if (detection.isAnomalous) {
            allAnomalyDetails.push(
              `${config.name}: ${detection.contributingFactors.join(', ')}`
            );
          }

          newSensors[sensorType] = {
            config,
            readings: newReadings,
            currentValue: smoothedValue,
            status,
            zScore: detection.zScore,
            rateOfChange: detection.rateOfChange,
            isAnomalous: detection.isAnomalous,
          };
        }

        // Update fault state with progress
        let updatedFault = prev.activeFault;
        if (prev.activeFault?.active) {
          updatedFault = {
            ...prev.activeFault,
            progress: faultProgress,
            daysToFailure: minDaysToFailure,
          };
        }

        return {
          sensors: newSensors,
          activeFault: updatedFault,
          overallStatus: worstStatus,
          daysToFailure: minDaysToFailure,
          anomalyDetails: allAnomalyDetails,
        };
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return {
    systemState,
    injectFault,
    clearFault,
  };
}
