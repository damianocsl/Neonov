// Base interfaces for diabetes data
interface BaseRecord {
  id: string;
  timestamp: string;
  notes?: string;
}

// Glucose Reading Types
export interface GlucoseReading extends BaseRecord {
  glucose: number;
}

export interface GlucoseCategory {
  min: number;
  max: number;
  label: string;
  color: string;
}

// Insulin Injection Types
export type InsulinType = 'rapid_acting' | 'long_acting';

export interface InsulinInjection extends BaseRecord {
  units: number;
  type: InsulinType;
}

// Meal Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal extends BaseRecord {
  name: string;
  carbs: number;
  type: MealType;
}

// User Settings Types
export interface TargetRange {
  min: number;
  max: number;
}

export interface UserSettings {
  name: string;
  glucoseUnit: 'mg/dL' | 'mmol/L';
  targetRange: TargetRange;
  reminderEnabled: boolean;
}

// Statistics Types
export interface DailyStats {
  avgGlucose: number;
  timeInRange: number;
  totalInsulin: number;
  totalCarbs: number;
}

export interface WeeklyStats {
  avgGlucose: number;
  timeInRange: number;
}

export interface HistoryStats {
  avgGlucose: number;
  timeInRange: number;
  totalReadings: number;
  avgDailyInsulin: number;
  avgDailyCarbs: number;
}

// Chart Data Types
interface ChartDataset {
  data: number[];
  strokeWidth?: number;
  color?: (opacity: number) => string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Export Data Types
export interface ExportData {
  glucoseReadings: GlucoseReading[];
  insulinInjections: InsulinInjection[];
  meals: Meal[];
  userSettings: UserSettings;
  exportDate: string;
}

// Navigation Types
export type RootTabParamList = {
  Home: undefined;
  Glucose: undefined;
  Insulin: undefined;
  Meals: undefined;
  History: undefined;
  Settings: undefined;
};

// Component Props Types
export interface QuickActionButtonProps {
  icon: string;
  title: string;
  onPress: () => void;
  color?: string;
}

export interface StatCardProps {
  icon?: string;
  title: string;
  value: number | string;
  unit?: string;
  subtitle?: string;
  color?: string;
}

export interface SettingItemProps {
  label: string;
  children: React.ReactNode;
  description?: string;
}

export interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export interface TypeSelectorProps {
  selected: InsulinType;
  onSelect: (type: InsulinType) => void;
}

export interface MealTypeSelectorProps {
  selected: MealType;
  onSelect: (type: MealType) => void;
}

export interface PeriodSelectorProps {
  selectedPeriod: number;
  onSelect: (period: number) => void;
}

// Utility Types

export interface QuickInputButton {
  value: number;
  color: string;
}

export interface Period {
  value: number;
  label: string;
}

// Storage Service Types
export interface StorageServiceInterface {
  // Glucose methods
  addGlucoseReading(reading: Omit<GlucoseReading, 'id' | 'timestamp'>): Promise<boolean>;
  getGlucoseReadings(): Promise<GlucoseReading[]>;
  updateGlucoseReading(id: string, reading: Partial<GlucoseReading>): Promise<boolean>;
  deleteGlucoseReading(id: string): Promise<boolean>;

  // Insulin methods
  addInsulinInjection(injection: Omit<InsulinInjection, 'id' | 'timestamp'>): Promise<boolean>;
  getInsulinInjections(): Promise<InsulinInjection[]>;
  updateInsulinInjection(id: string, injection: Partial<InsulinInjection>): Promise<boolean>;
  deleteInsulinInjection(id: string): Promise<boolean>;

  // Meal methods
  addMeal(meal: Omit<Meal, 'id' | 'timestamp'>): Promise<boolean>;
  getMeals(): Promise<Meal[]>;
  updateMeal(id: string, meal: Partial<Meal>): Promise<boolean>;
  deleteMeal(id: string): Promise<boolean>;

  // Settings methods
  getUserSettings(): Promise<UserSettings>;
  updateUserSettings(settings: Partial<UserSettings>): Promise<boolean>;

  // Data management
  exportAllData(): Promise<ExportData | null>;
  clearAllData(): Promise<boolean>;
}

export interface GlucoseRanges {
  LOW: GlucoseCategory;
  NORMAL: GlucoseCategory;
  HIGH: GlucoseCategory;
  VERY_HIGH: GlucoseCategory;
}

export interface MeasurementUnits {
  MG_DL: 'mg/dL';
  MMOL_L: 'mmol/L';
}
