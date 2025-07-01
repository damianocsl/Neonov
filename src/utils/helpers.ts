import { GLUCOSE_RANGES } from '@/constants';
import type { GlucoseCategory, GlucoseReading, InsulinInjection, Meal, TargetRange } from '@/types';

// Date formatting utilities
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// Glucose level utilities
const getGlucoseCategory = (glucose: number): GlucoseCategory => {
  if (glucose < GLUCOSE_RANGES.LOW.min) {
    return GLUCOSE_RANGES.LOW;
  }
  if (glucose > GLUCOSE_RANGES.VERY_HIGH.max) {
    return GLUCOSE_RANGES.VERY_HIGH;
  }
  return GLUCOSE_RANGES.NORMAL;
};

export const getGlucoseColor = (glucose: number): string => {
  return getGlucoseCategory(glucose).color;
};

// Data analysis utilities
export const calculateAverageGlucose = (readings: GlucoseReading[]): number => {
  if (!readings || readings.length === 0) return 0;
  const sum = readings.reduce((total, reading) => total + reading.glucose, 0);
  return Math.round(sum / readings.length);
};

function isGlucoseInRange(glucose: number, targetRange: TargetRange): boolean {
  return glucose >= targetRange.min && glucose <= targetRange.max;
}

export const calculateTimeInRange = (
  readings: GlucoseReading[],
  targetRange: TargetRange = { min: 80, max: 140 }
): number => {
  if (!readings || readings.length === 0) return 0;
  const inRangeCount = readings.filter((reading) =>
    isGlucoseInRange(reading.glucose, targetRange)
  ).length;
  return Math.round((inRangeCount / readings.length) * 100);
};

// Insulin calculations
export const calculateTotalDailyInsulin = (
  injections: InsulinInjection[],
  date: Date = new Date()
): number => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const dailyInjections = injections.filter((injection) => {
    const injectionDate = new Date(injection.timestamp);
    return injectionDate >= startOfDay && injectionDate <= endOfDay;
  });

  return dailyInjections.reduce((total, injection) => total + injection.units, 0);
};

// Carbohydrate calculations
export const calculateTotalDailyCarbs = (meals: Meal[], date: Date = new Date()): number => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const dailyMeals = meals.filter((meal) => {
    const mealDate = new Date(meal.timestamp);
    return mealDate >= startOfDay && mealDate <= endOfDay;
  });

  return dailyMeals.reduce((total, meal) => total + (meal.carbs || 0), 0);
};

export const getLastNDays = <T extends { timestamp: string }>(data: T[], days: number = 7): T[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  return data.filter((item) => new Date(item.timestamp) >= cutoffDate);
};

// Validation utilities
export const validateGlucoseReading = (glucose: number): boolean => {
  return glucose >= 20 && glucose <= 600;
};

export const validateInsulinDose = (units: number): boolean => {
  return units > 0 && units <= 100;
};

export const validateCarbAmount = (carbs: number): boolean => {
  return carbs >= 0 && carbs <= 300;
};
