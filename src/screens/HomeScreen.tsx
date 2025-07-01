import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import type React from 'react';
import { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '@/constants';
import StorageService from '@/services/storage';
import type {
  DailyStats,
  GlucoseReading,
  QuickActionButtonProps,
  RootTabParamList,
  StatCardProps,
  WeeklyStats,
} from '@/types';
import {
  calculateAverageGlucose,
  calculateTimeInRange,
  calculateTotalDailyCarbs,
  calculateTotalDailyInsulin,
  formatTime,
  getGlucoseColor,
  getLastNDays,
} from '@/utils/helpers';

type HomeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [recentGlucose, setRecentGlucose] = useState<GlucoseReading | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    avgGlucose: 0,
    timeInRange: 0,
    totalInsulin: 0,
    totalCarbs: 0,
  });
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    avgGlucose: 0,
    timeInRange: 0,
  });
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      const [glucoseReadings, insulinInjections, meals, userSettings] = await Promise.all([
        StorageService.getGlucoseReadings(),
        StorageService.getInsulinInjections(),
        StorageService.getMeals(),
        StorageService.getUserSettings(),
      ]);

      // Recent glucose
      if (glucoseReadings.length > 0) {
        setRecentGlucose(glucoseReadings[0] || null);
      }

      // Daily stats
      const todayReadings = getLastNDays(glucoseReadings, 1);
      const todayInjections = getLastNDays(insulinInjections, 1);
      const todayMeals = getLastNDays(meals, 1);

      setDailyStats({
        avgGlucose: calculateAverageGlucose(todayReadings),
        timeInRange: calculateTimeInRange(todayReadings, userSettings.targetRange),
        totalInsulin: calculateTotalDailyInsulin(todayInjections),
        totalCarbs: calculateTotalDailyCarbs(todayMeals),
      });

      // Weekly stats
      const weeklyReadings = getLastNDays(glucoseReadings, 7);
      setWeeklyStats({
        avgGlucose: calculateAverageGlucose(weeklyReadings),
        timeInRange: calculateTimeInRange(weeklyReadings, userSettings.targetRange),
      });
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const QuickActionButton: React.FC<QuickActionButtonProps> = ({
    icon,
    title,
    onPress,
    color = Colors.primary,
  }) => (
    <TouchableOpacity style={[styles.quickActionButton, { borderColor: color }]} onPress={onPress}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={32} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    unit,
    subtitle,
    color = Colors.primary,
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>
        {value}
        {unit && <Text style={styles.statUnit}> {unit}</Text>}
      </Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Good {getGreeting()}</Text>
        <Text style={styles.welcomeSubtext}>Here's your diabetes overview</Text>
      </View>

      {/* Recent Glucose Reading */}
      {recentGlucose && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Glucose Reading</Text>
          <View style={styles.glucoseCard}>
            <View style={styles.glucoseReading}>
              <Text
                style={[styles.glucoseValue, { color: getGlucoseColor(recentGlucose.glucose) }]}
              >
                {recentGlucose.glucose}
              </Text>
              <Text style={styles.glucoseUnit}>mg/dL</Text>
            </View>
            <Text style={styles.glucoseTime}>{formatTime(recentGlucose.timestamp)}</Text>
            {recentGlucose.notes && <Text style={styles.glucoseNotes}>{recentGlucose.notes}</Text>}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            icon="water"
            title="Log Glucose"
            onPress={() => navigation.navigate('Glucose')}
            color={Colors.accent}
          />
          <QuickActionButton
            icon="medical"
            title="Log Insulin"
            onPress={() => navigation.navigate('Insulin')}
            color={Colors.danger}
          />
          <QuickActionButton
            icon="restaurant"
            title="Log Meal"
            onPress={() => navigation.navigate('Meals')}
            color={Colors.warning}
          />
          <QuickActionButton
            icon="stats-chart"
            title="View Trends"
            onPress={() => navigation.navigate('History')}
            color={Colors.success}
          />
        </View>
      </View>

      {/* Today's Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Avg Glucose"
            value={dailyStats.avgGlucose || '--'}
            unit={dailyStats.avgGlucose ? 'mg/dL' : ''}
            color={
              dailyStats.avgGlucose ? getGlucoseColor(dailyStats.avgGlucose) : Colors.textSecondary
            }
          />
          <StatCard
            title="Time in Range"
            value={dailyStats.timeInRange || '--'}
            unit={dailyStats.timeInRange ? '%' : ''}
            color={Colors.success}
          />
          <StatCard
            title="Total Insulin"
            value={dailyStats.totalInsulin || '--'}
            unit={dailyStats.totalInsulin ? 'units' : ''}
            color={Colors.danger}
          />
          <StatCard
            title="Total Carbs"
            value={dailyStats.totalCarbs || '--'}
            unit={dailyStats.totalCarbs ? 'g' : ''}
            color={Colors.warning}
          />
        </View>
      </View>

      {/* Weekly Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Avg Glucose"
            value={weeklyStats.avgGlucose || '--'}
            unit={weeklyStats.avgGlucose ? 'mg/dL' : ''}
            subtitle="7-day average"
            color={
              weeklyStats.avgGlucose
                ? getGlucoseColor(weeklyStats.avgGlucose)
                : Colors.textSecondary
            }
          />
          <StatCard
            title="Time in Range"
            value={weeklyStats.timeInRange || '--'}
            unit={weeklyStats.timeInRange ? '%' : ''}
            subtitle="7-day average"
            color={Colors.success}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: Colors.primary,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.surface,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: Colors.surface,
    opacity: 0.8,
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
  glucoseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  glucoseReading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glucoseValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  glucoseUnit: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  glucoseTime: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  glucoseNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
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
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: Colors.textSecondary,
  },
  statSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

export default HomeScreen;
