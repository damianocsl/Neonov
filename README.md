# Diabetes Tracker - MDI Management App

A comprehensive React Native application designed specifically for people with diabetes who use Multiple Daily Injections (MDI) to manage their condition. This app helps track blood glucose levels, insulin injections, meals, and provides insights through data visualization.

## Features

### 📊 Dashboard
- **Personalized greeting** based on time of day
- **Latest glucose reading** with color-coded status
- **Quick action buttons** for easy data entry
- **Daily summary** showing average glucose, time in range, total insulin, and carbs
- **Weekly overview** with 7-day averages
- **Pull-to-refresh** for real-time data updates

### 🩸 Blood Glucose Tracking
- **Easy glucose logging** with validation (20-600 mg/dL)
- **Quick input buttons** for common glucose values
- **Color-coded readings** based on glucose ranges:
  - Low: <80 mg/dL (Blue)
  - Normal: 80-140 mg/dL (Green)
  - High: 140-180 mg/dL (Orange)
  - Very High: >180 mg/dL (Red)
- **Notes support** for contextual information
- **Comprehensive history** with timestamps and categories

### 💉 Insulin Injection Management
- **Dual insulin type support**:
  - Rapid-acting insulin (meal-time)
  - Long-acting insulin (basal)
- **Dose validation** (0.1-100 units)
- **Quick dose buttons** tailored to insulin type
- **Visual differentiation** with color coding
- **Injection history** with timestamps and notes

### 🍽️ Meal & Carbohydrate Tracking
- **Meal categorization**:
  - Breakfast (sunrise icon)
  - Lunch (partly sunny icon)
  - Dinner (moon icon)
  - Snack (fast-food icon)
- **Carbohydrate counting** with validation (0-300g)
- **Smart quick buttons** based on meal type
- **Nutritional notes** support
- **Visual meal history** with type indicators

### 📈 History & Trends
- **Interactive line charts** showing glucose trends
- **Flexible time periods**: 7, 14, 30, or 90 days
- **Comprehensive statistics**:
  - Average glucose levels
  - Time in range percentage
  - Total readings count
  - Average daily insulin
  - Average daily carbohydrates
- **Intelligent insights** with actionable recommendations
- **Progress tracking** with visual indicators

### ⚙️ Settings & Customization
- **Personal profile** with name customization
- **Glucose unit selection**: mg/dL or mmol/L
- **Custom target ranges** for personalized management
- **Notification preferences** for reminders
- **Data export** functionality for healthcare providers
- **Secure data management** with clear options

## Technical Stack

- **React Native** with Expo framework
- **TypeScript** for type safety and better development experience
- **React Navigation** for seamless navigation
- **AsyncStorage** for secure local data persistence
- **React Native Chart Kit** for beautiful data visualization
- **Expo Vector Icons** for consistent iconography
- **Biome** for fast linting and formatting
- **Modern UI/UX** with medical-appropriate color scheme

## Development

### Code Quality Tools
- **TypeScript** with strict configuration for type safety
- **Biome** for ultra-fast linting and formatting (replaces ESLint + Prettier)
- **Path aliases** configured for clean imports (`@/components`, `@/utils`, etc.)

### Available Scripts
```bash
npm run lint        # Check for linting issues
npm run lint:fix    # Auto-fix linting issues
npm run format      # Format code
npm run check       # Run linting + TypeScript checks
npm run check:fix   # Fix issues and run type checks
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Studio (for Android)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neonov
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run the app**
   - iOS: Press `i` or use iOS Simulator
   - Android: Press `a` or use Android Emulator
   - Physical device: Scan QR code with Expo Go app

## Usage Guide

### First-Time Setup
1. **Open the app** and navigate to Settings
2. **Enter your name** for personalized experience
3. **Set glucose target range** (default: 80-140 mg/dL)
4. **Configure preferences** for units and notifications

### Daily Workflow
1. **Log glucose readings** before meals and at bedtime
2. **Record insulin injections** with correct type and dosage
3. **Track meals** with carbohydrate content
4. **Review dashboard** for daily summary
5. **Check trends** weekly for pattern analysis

### Data Management
- **Export data** regularly to share with healthcare providers
- **Review insights** for management recommendations
- **Adjust targets** based on healthcare provider guidance

## App Architecture

```
neonov/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── HomeScreen.js     # Dashboard
│   │   ├── GlucoseScreen.js  # Glucose tracking
│   │   ├── InsulinScreen.js  # Insulin logging
│   │   ├── MealsScreen.js    # Meal tracking
│   │   ├── HistoryScreen.js  # Trends & analytics
│   │   └── SettingsScreen.js # Configuration
│   ├── navigation/           # Navigation setup
│   ├── services/             # Data management
│   ├── utils/                # Helper functions
│   └── constants/            # App constants
├── assets/                   # Images and icons
└── App.js                    # Main app entry point
```

## Key Features for MDI Users

### Multiple Daily Injections Support
- **Rapid-acting insulin** tracking for meal coverage
- **Long-acting insulin** logging for basal needs
- **Flexible dosing** with decimal precision
- **Injection timing** correlation with meals

### Glucose Pattern Recognition
- **Pre/post meal** tracking capabilities
- **Time-based analysis** for pattern identification
- **Target range** customization
- **Trend visualization** for better management

### Healthcare Integration
- **Data export** in JSON format for easy sharing
- **Comprehensive reports** with timestamps
- **Pattern insights** for medical consultations
- **Progress tracking** over time

## Safety Features

- **Input validation** for all health data
- **Reasonable ranges** for glucose and insulin
- **Data backup** with export functionality
- **No cloud storage** - all data stays on device
- **Secure local storage** with AsyncStorage

## Future Enhancements

- **Medication reminders** with push notifications
- **Photo logging** for meals
- **Ketone tracking** for advanced monitoring
- **Healthcare provider sharing** improvements
- **Apple Health** and **Google Fit** integration
- **Predictive analytics** for glucose trends

## Support

For questions, issues, or feature requests:
- Review the in-app documentation
- Check the settings for troubleshooting options
- Consult with your healthcare provider for medical guidance

## Medical Disclaimer

This app is designed to support diabetes management but should not replace professional medical advice. Always consult with your healthcare provider for medical decisions and treatment adjustments.

## License

This project is developed for educational and personal use. Please ensure compliance with healthcare regulations in your region before clinical use.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: iOS 13+, Android 8+ 