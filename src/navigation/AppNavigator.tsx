import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import type React from 'react';
import { Colors } from '@/constants';
import GlucoseScreen from '@/screens/GlucoseScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import HomeScreen from '@/screens/HomeScreen';
import InsulinScreen from '@/screens/InsulinScreen';
import MealsScreen from '@/screens/MealsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import type { RootTabParamList } from '@/types';

const Tab = createBottomTabNavigator<RootTabParamList>();

type TabNavigationProp = BottomTabNavigationProp<RootTabParamList>;
type TabRouteProp<T extends keyof RootTabParamList> = RouteProp<RootTabParamList, T>;

export type { TabNavigationProp, TabRouteProp };

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const AppNavigator: React.FC = () => {
  const getTabBarIcon = (routeName: keyof RootTabParamList) => {
    return ({ focused, color, size }: TabBarIconProps) => {
      let iconName: keyof typeof Ionicons.glyphMap;

      switch (routeName) {
        case 'Home':
          iconName = focused ? 'home' : 'home-outline';
          break;
        case 'Glucose':
          iconName = focused ? 'water' : 'water-outline';
          break;
        case 'Insulin':
          iconName = focused ? 'medical' : 'medical-outline';
          break;
        case 'Meals':
          iconName = focused ? 'restaurant' : 'restaurant-outline';
          break;
        case 'History':
          iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          break;
        case 'Settings':
          iconName = focused ? 'settings' : 'settings-outline';
          break;
        default:
          iconName = 'ellipse-outline';
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    };
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: getTabBarIcon(route.name),
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.surface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
        <Tab.Screen name="Glucose" component={GlucoseScreen} options={{ title: 'Blood Glucose' }} />
        <Tab.Screen
          name="Insulin"
          component={InsulinScreen}
          options={{ title: 'Insulin Injections' }}
        />
        <Tab.Screen name="Meals" component={MealsScreen} options={{ title: 'Meals & Carbs' }} />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'History & Trends' }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
