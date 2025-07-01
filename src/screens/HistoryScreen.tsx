import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '@/constants';
import StorageService from '@/services/storage';
import type {
  ChartData,
  GlucoseReading,
  HistoryStats,
  InsulinInjection,
  Meal,
  Period,
  PeriodSelectorProps,
  UserSettings,
} from '@/types';
import {
  calculateAverageGlucose,
  calculateTimeInRange,
  formatDate,
  getLastNDays,
} from '@/utils/helpers';

const { width: screenWidth } = Dimensions.get('window');

const HistoryScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([]);
  const [insulinInjections, setInsulinInjections] = useState<InsulinInjection[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [stats, setStats] = useState<HistoryStats>({
    avgGlucose: 0,
    timeInRange: 0,
    totalReadings: 0,
    avgDailyInsulin: 0,
    avgDailyCarbs: 0,
  });
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const periods: Period[] = [
    { value: 7, label: '7 Days' },
    { value: 14, label: '14 Days' },
    { value: 30, label: '30 Days' },
    { value: 90, label: '90 Days' },
  ];

  const loadData = useCallback(async (): Promise<void> => {
    try {
      const [readings, injections, mealsData, settings] = await Promise.all([
        StorageService.getGlucoseReadings(),
        StorageService.getInsulinInjections(),
        StorageService.getMeals(),
        StorageService.getUserSettings(),
      ]);

      setGlucoseReadings(readings);
      setInsulinInjections(injections);
      setMeals(mealsData);
      setUserSettings(settings);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  }, []);

  const processData = useCallback((): void => {
    if (!userSettings) return;

    const periodReadings = getLastNDays(glucoseReadings, selectedPeriod);
    const periodInjections = getLastNDays(insulinInjections, selectedPeriod);
    const periodMeals = getLastNDays(meals, selectedPeriod);

    // Calculate statistics
    const avgGlucose = calculateAverageGlucose(periodReadings);
    const timeInRange = calculateTimeInRange(periodReadings, userSettings.targetRange);
    const totalReadings = periodReadings.length;

    const avgDailyInsulin =
      periodInjections.length > 0
        ? periodInjections.reduce((sum, inj) => sum + inj.units, 0) / selectedPeriod
        : 0;

    const avgDailyCarbs =
      periodMeals.length > 0
        ? periodMeals.reduce((sum, meal) => sum + meal.carbs, 0) / selectedPeriod
        : 0;

    setStats({
      avgGlucose,
      timeInRange,
      totalReadings,
      avgDailyInsulin: Math.round(avgDailyInsulin * 10) / 10,
      avgDailyCarbs: Math.round(avgDailyCarbs),
    });

    // Process chart data
    if (periodReadings.length > 0) {
      const dailyAverages: { [key: string]: number[] } = {};

      periodReadings.forEach((reading) => {
        const date = formatDate(reading.timestamp);
        if (!dailyAverages[date]) {
          dailyAverages[date] = [];
        }
        dailyAverages[date].push(reading.glucose);
      });

      const sortedDates = Object.keys(dailyAverages).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );

      const labels = sortedDates.map((date) => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });

      const data = sortedDates.map((date) => {
        const readings = dailyAverages[date] ?? [];
        return readings.reduce((sum, glucose) => sum + glucose, 0) / readings.length;
      });

      setChartData({
        labels,
        datasets: [
          {
            data,
            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      });
    } else {
      setChartData(null);
    }
  }, [selectedPeriod, glucoseReadings, insulinInjections, meals, userSettings]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  React.useEffect(() => {
    processData();
  }, [processData]);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onSelect }) => (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.value}
          style={[
            styles.periodButton,
            selectedPeriod === period.value && styles.periodButtonActive,
          ]}
          onPress={() => onSelect(period.value)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period.value && styles.periodButtonTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const generateInsights = (): string[] => {
    const insights: string[] = [];

    if (stats.avgGlucose > 0) {
      if (stats.avgGlucose > 180) {
        insights.push(
          '📈 Your average glucose is high. Consider reviewing your meal timing and insulin doses.'
        );
      } else if (stats.avgGlucose < 80) {
        insights.push(
          '📉 Your average glucose is low. You might need to adjust your insulin doses or meal timing.'
        );
      } else {
        insights.push('✅ Your average glucose is in a good range. Keep up the great work!');
      }
    }

    if (stats.timeInRange > 0) {
      if (stats.timeInRange >= 70) {
        insights.push("🎯 Excellent time in range! You're managing your glucose levels well.");
      } else if (stats.timeInRange >= 50) {
        insights.push("📊 Good time in range. There's room for improvement in glucose control.");
      } else {
        insights.push(
          '⚠️ Time in range could be better. Consider discussing adjustments with your healthcare provider.'
        );
      }
    }

    if (stats.totalReadings > 0) {
      const dailyReadings = stats.totalReadings / selectedPeriod;
      if (dailyReadings < 4) {
        insights.push('📱 Consider checking your glucose more frequently for better management.');
      }
    }

    return insights;
  };

  const chartConfig = {
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Period Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Period</Text>
        <PeriodSelector selectedPeriod={selectedPeriod} onSelect={setSelectedPeriod} />
      </View>

      {/* Chart */}
      {chartData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glucose Trend</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              fromZero={false}
              segments={4}
            />
          </View>
        </View>
      )}

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.avgGlucose || '--'}</Text>
            <Text style={styles.statLabel}>Avg Glucose</Text>
            <Text style={styles.statUnit}>mg/dL</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.timeInRange || '--'}</Text>
            <Text style={styles.statLabel}>Time in Range</Text>
            <Text style={styles.statUnit}>%</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalReadings}</Text>
            <Text style={styles.statLabel}>Total Readings</Text>
            <Text style={styles.statUnit}>readings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.avgDailyInsulin || '--'}</Text>
            <Text style={styles.statLabel}>Avg Daily Insulin</Text>
            <Text style={styles.statUnit}>units</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.avgDailyCarbs || '--'}</Text>
            <Text style={styles.statLabel}>Avg Daily Carbs</Text>
            <Text style={styles.statUnit}>g</Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        {generateInsights().map((insight) => (
          <View key={insight} style={styles.insightCard}>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  periodButtonTextActive: {
    color: Colors.surface,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chart: {
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  statUnit: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  insightCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
});

export default HistoryScreen;
