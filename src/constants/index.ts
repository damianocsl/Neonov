import type { GlucoseRanges, MeasurementUnits } from '@/types';

export { Colors } from './colors';

export const GLUCOSE_RANGES: GlucoseRanges = {
  LOW: { min: 0, max: 80, label: 'Low', color: '#2196F3' },
  NORMAL: { min: 80, max: 140, label: 'Normal', color: '#4CAF50' },
  HIGH: { min: 140, max: 180, label: 'High', color: '#FF9800' },
  VERY_HIGH: { min: 180, max: 400, label: 'Very High', color: '#FF5252' },
};

export const MEASUREMENT_UNITS: MeasurementUnits = {
  MG_DL: 'mg/dL',
  MMOL_L: 'mmol/L',
};
