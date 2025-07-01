import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ExportData,
  GlucoseReading,
  InsulinInjection,
  Meal,
  StorageServiceInterface,
  UserSettings,
} from '@/types';

const STORAGE_KEYS = {
  GLUCOSE_READINGS: 'glucose_readings',
  INSULIN_INJECTIONS: 'insulin_injections',
  MEALS: 'meals',
  USER_SETTINGS: 'user_settings',
} as const;

class StorageService implements StorageServiceInterface {
  // Generic storage methods
  private async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  }

  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  // Glucose readings
  async addGlucoseReading(reading: Omit<GlucoseReading, 'id' | 'timestamp'>): Promise<boolean> {
    const readings = (await this.getGlucoseReadings()) || [];
    const newReading: GlucoseReading = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      glucose: reading.glucose,
      ...(reading.notes !== undefined && { notes: reading.notes }),
    };
    readings.unshift(newReading);
    return await this.setItem(STORAGE_KEYS.GLUCOSE_READINGS, readings);
  }

  async getGlucoseReadings(): Promise<GlucoseReading[]> {
    return (await this.getItem<GlucoseReading[]>(STORAGE_KEYS.GLUCOSE_READINGS)) || [];
  }

  async updateGlucoseReading(
    id: string,
    updatedReading: Partial<GlucoseReading>
  ): Promise<boolean> {
    const readings = await this.getGlucoseReadings();
    const index = readings.findIndex((reading) => reading.id === id);
    if (index !== -1) {
      if (updatedReading.glucose !== undefined) readings[index]!.glucose = updatedReading.glucose;
      if (updatedReading.notes !== undefined) readings[index]!.notes = updatedReading.notes;
      return await this.setItem(STORAGE_KEYS.GLUCOSE_READINGS, readings);
    }
    return false;
  }

  async deleteGlucoseReading(id: string): Promise<boolean> {
    const readings = await this.getGlucoseReadings();
    const filteredReadings = readings.filter((reading) => reading.id !== id);
    return await this.setItem(STORAGE_KEYS.GLUCOSE_READINGS, filteredReadings);
  }

  // Insulin injections
  async addInsulinInjection(
    injection: Omit<InsulinInjection, 'id' | 'timestamp'>
  ): Promise<boolean> {
    const injections = (await this.getInsulinInjections()) || [];
    const newInjection: InsulinInjection = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      units: injection.units,
      type: injection.type,
      ...(injection.notes !== undefined && { notes: injection.notes }),
    };
    injections.unshift(newInjection);
    return await this.setItem(STORAGE_KEYS.INSULIN_INJECTIONS, injections);
  }

  async getInsulinInjections(): Promise<InsulinInjection[]> {
    return (await this.getItem<InsulinInjection[]>(STORAGE_KEYS.INSULIN_INJECTIONS)) || [];
  }

  async updateInsulinInjection(
    id: string,
    updatedInjection: Partial<InsulinInjection>
  ): Promise<boolean> {
    const injections = await this.getInsulinInjections();
    const index = injections.findIndex((injection) => injection.id === id);
    if (index !== -1) {
      if (updatedInjection.units !== undefined) injections[index]!.units = updatedInjection.units;
      if (updatedInjection.type !== undefined) injections[index]!.type = updatedInjection.type;
      if (updatedInjection.notes !== undefined) injections[index]!.notes = updatedInjection.notes;
      return await this.setItem(STORAGE_KEYS.INSULIN_INJECTIONS, injections);
    }
    return false;
  }

  async deleteInsulinInjection(id: string): Promise<boolean> {
    const injections = await this.getInsulinInjections();
    const filteredInjections = injections.filter((injection) => injection.id !== id);
    return await this.setItem(STORAGE_KEYS.INSULIN_INJECTIONS, filteredInjections);
  }

  // Meals
  async addMeal(meal: Omit<Meal, 'id' | 'timestamp'>): Promise<boolean> {
    const meals = (await this.getMeals()) || [];
    const newMeal: Meal = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      name: meal.name,
      carbs: meal.carbs,
      type: meal.type,
      ...(meal.notes !== undefined && { notes: meal.notes }),
    };
    meals.unshift(newMeal);
    return await this.setItem(STORAGE_KEYS.MEALS, meals);
  }

  async getMeals(): Promise<Meal[]> {
    return (await this.getItem<Meal[]>(STORAGE_KEYS.MEALS)) || [];
  }

  async updateMeal(id: string, updatedMeal: Partial<Meal>): Promise<boolean> {
    const meals = await this.getMeals();
    const index = meals.findIndex((meal) => meal.id === id);
    if (index !== -1) {
      if (updatedMeal.name !== undefined) meals[index]!.name = updatedMeal.name;
      if (updatedMeal.carbs !== undefined) meals[index]!.carbs = updatedMeal.carbs;
      if (updatedMeal.type !== undefined) meals[index]!.type = updatedMeal.type;
      if (updatedMeal.notes !== undefined) meals[index]!.notes = updatedMeal.notes;
      return await this.setItem(STORAGE_KEYS.MEALS, meals);
    }
    return false;
  }

  async deleteMeal(id: string): Promise<boolean> {
    const meals = await this.getMeals();
    const filteredMeals = meals.filter((meal) => meal.id !== id);
    return await this.setItem(STORAGE_KEYS.MEALS, filteredMeals);
  }

  // User settings
  async getUserSettings(): Promise<UserSettings> {
    return (
      (await this.getItem<UserSettings>(STORAGE_KEYS.USER_SETTINGS)) || {
        glucoseUnit: 'mg/dL',
        targetRange: { min: 80, max: 140 },
        reminderEnabled: true,
        name: '',
      }
    );
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<boolean> {
    const currentSettings = await this.getUserSettings();
    const updatedSettings: UserSettings = { ...currentSettings, ...settings };
    return await this.setItem(STORAGE_KEYS.USER_SETTINGS, updatedSettings);
  }

  // Data export
  async exportAllData(): Promise<ExportData | null> {
    try {
      const [glucoseReadings, insulinInjections, meals, userSettings] = await Promise.all([
        this.getGlucoseReadings(),
        this.getInsulinInjections(),
        this.getMeals(),
        this.getUserSettings(),
      ]);

      return {
        glucoseReadings,
        insulinInjections,
        meals,
        userSettings,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Clear all data
  async clearAllData(): Promise<boolean> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.GLUCOSE_READINGS),
        AsyncStorage.removeItem(STORAGE_KEYS.INSULIN_INJECTIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.MEALS),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_SETTINGS),
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

export default new StorageService();
