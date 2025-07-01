export const Colors = {
  // Primary Colors
  primary: '#2E7D32', // Medical green
  primaryLight: '#66BB6A',
  primaryDark: '#1B5E20',

  // Accent Colors
  accent: '#1976D2', // Medical blue
  accentLight: '#42A5F5',
  accentDark: '#0D47A1',

  // Status Colors
  danger: '#D32F2F', // High glucose
  warning: '#F57C00', // Medium glucose
  success: '#388E3C', // Normal glucose
  info: '#1976D2',

  // Neutral Colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  border: '#E0E0E0',

  // Glucose Level Colors
  glucoseHigh: '#FF5252', // >180 mg/dL
  glucoseMedium: '#FF9800', // 140-180 mg/dL
  glucoseNormal: '#4CAF50', // 80-139 mg/dL
  glucoseLow: '#2196F3', // <80 mg/dL

  // Insulin Types
  rapidActing: '#FF6B6B',
  longActing: '#4ECDC4',
} as const;
