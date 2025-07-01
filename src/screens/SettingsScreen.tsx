import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import type React from 'react';
import { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, MEASUREMENT_UNITS } from '@/constants';
import StorageService from '@/services/storage';
import type { SettingItemProps, SettingSectionProps, UserSettings } from '@/types';

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    glucoseUnit: 'mg/dL',
    targetRange: { min: 80, max: 140 },
    reminderEnabled: true,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadSettings = useCallback(async (): Promise<void> => {
    try {
      const userSettings = await StorageService.getUserSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const handleSaveSettings = async (): Promise<void> => {
    if (!settings.name.trim()) {
      Alert.alert('Invalid Input', 'Please enter your name.');
      return;
    }

    if (settings.targetRange.min >= settings.targetRange.max) {
      Alert.alert('Invalid Range', 'Minimum glucose must be less than maximum glucose.');
      return;
    }

    setLoading(true);
    try {
      const success = await StorageService.updateUserSettings(settings);
      if (success) {
        Alert.alert('Success', 'Settings saved successfully!');
      } else {
        Alert.alert('Error', 'Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (): Promise<void> => {
    try {
      const exportData = await StorageService.exportAllData();
      if (!exportData) {
        Alert.alert('Export Failed', 'No data available to export.');
        return;
      }

      const filename = `diabetes_data_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));

      await Share.share({
        url: fileUri,
        title: 'Diabetes Data Export',
        message: 'Your diabetes management data export',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    }
  };

  const handleClearData = (): void => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await StorageService.clearAllData();
              if (success) {
                Alert.alert('Success', 'All data cleared successfully!');
                // Reset settings to default
                const defaultSettings: UserSettings = {
                  name: '',
                  glucoseUnit: 'mg/dL',
                  targetRange: { min: 80, max: 140 },
                  reminderEnabled: true,
                };
                setSettings(defaultSettings);
              } else {
                Alert.alert('Error', 'Failed to clear data.');
              }
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingItem: React.FC<SettingItemProps> = ({ label, children, description }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLabel}>
        <Text style={styles.settingLabelText}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Profile Section */}
      <SettingSection title="Profile">
        <SettingItem label="Name" description="Your name for personalized greetings">
          <TextInput
            style={styles.textInput}
            value={settings.name}
            onChangeText={(text) => setSettings({ ...settings, name: text })}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textSecondary}
          />
        </SettingItem>
      </SettingSection>

      {/* Glucose Settings */}
      <SettingSection title="Glucose Settings">
        <SettingItem
          label="Glucose Unit"
          description="Choose your preferred glucose measurement unit"
        >
          <View style={styles.unitSelector}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                settings.glucoseUnit === MEASUREMENT_UNITS.MG_DL && styles.unitButtonActive,
              ]}
              onPress={() => setSettings({ ...settings, glucoseUnit: MEASUREMENT_UNITS.MG_DL })}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  settings.glucoseUnit === MEASUREMENT_UNITS.MG_DL && styles.unitButtonTextActive,
                ]}
              >
                mg/dL
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitButton,
                settings.glucoseUnit === MEASUREMENT_UNITS.MMOL_L && styles.unitButtonActive,
              ]}
              onPress={() => setSettings({ ...settings, glucoseUnit: MEASUREMENT_UNITS.MMOL_L })}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  settings.glucoseUnit === MEASUREMENT_UNITS.MMOL_L && styles.unitButtonTextActive,
                ]}
              >
                mmol/L
              </Text>
            </TouchableOpacity>
          </View>
        </SettingItem>

        <SettingItem label="Target Range" description="Your personalized glucose target range">
          <View style={styles.rangeInputs}>
            <View style={styles.rangeInput}>
              <Text style={styles.rangeLabel}>Min</Text>
              <TextInput
                style={styles.rangeTextInput}
                value={settings.targetRange.min.toString()}
                onChangeText={(text) =>
                  setSettings({
                    ...settings,
                    targetRange: { ...settings.targetRange, min: parseInt(text) || 0 },
                  })
                }
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            <Text style={styles.rangeSeparator}>-</Text>
            <View style={styles.rangeInput}>
              <Text style={styles.rangeLabel}>Max</Text>
              <TextInput
                style={styles.rangeTextInput}
                value={settings.targetRange.max.toString()}
                onChangeText={(text) =>
                  setSettings({
                    ...settings,
                    targetRange: { ...settings.targetRange, max: parseInt(text) || 0 },
                  })
                }
                keyboardType="numeric"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>
        </SettingItem>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications">
        <SettingItem
          label="Reminders"
          description="Enable reminders for glucose checks and insulin"
        >
          <Switch
            value={settings.reminderEnabled}
            onValueChange={(value) => setSettings({ ...settings, reminderEnabled: value })}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={settings.reminderEnabled ? Colors.primary : Colors.textSecondary}
          />
        </SettingItem>
      </SettingSection>

      {/* Data Management */}
      <SettingSection title="Data Management">
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <Ionicons name="download-outline" size={20} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Export Data</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          <Text style={[styles.actionButtonText, { color: Colors.danger }]}>Clear All Data</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </SettingSection>

      {/* Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveSettings}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Settings'}</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <SettingSection title="About">
        <View style={styles.infoContainer}>
          <Text style={styles.appName}>Diabetes Tracker</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            A comprehensive diabetes management app for people using Multiple Daily Injections
            (MDI).
          </Text>
          <Text style={styles.disclaimer}>
            ⚠️ This app is for tracking purposes only. Always consult with your healthcare provider
            for medical decisions regarding your diabetes management.
          </Text>
        </View>
      </SettingSection>
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
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    flex: 1,
    marginRight: 16,
  },
  settingLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
    minWidth: 120,
    textAlign: 'right',
  },
  unitSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
  },
  unitButtonActive: {
    backgroundColor: Colors.primary,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  unitButtonTextActive: {
    color: Colors.surface,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  rangeTextInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
    width: 60,
    textAlign: 'center',
  },
  rangeSeparator: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginHorizontal: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  saveButtonContainer: {
    margin: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

export default SettingsScreen;
