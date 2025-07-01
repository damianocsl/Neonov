import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type React from 'react';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '@/constants';
import StorageService from '@/services/storage';
import type { GlucoseReading, QuickInputButton } from '@/types';
import { formatDateTime, getGlucoseColor, validateGlucoseReading } from '@/utils/helpers';

const GlucoseScreen: React.FC = () => {
  const [glucose, setGlucose] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const quickButtons: QuickInputButton[] = [
    { value: 70, color: Colors.glucoseLow },
    { value: 100, color: Colors.glucoseNormal },
    { value: 120, color: Colors.glucoseNormal },
    { value: 150, color: Colors.glucoseMedium },
    { value: 180, color: Colors.glucoseHigh },
    { value: 250, color: Colors.glucoseHigh },
  ];

  const loadReadings = useCallback(async (): Promise<void> => {
    try {
      const data = await StorageService.getGlucoseReadings();
      setReadings(data);
    } catch (error) {
      console.error('Error loading readings:', error);
      Alert.alert('Error', 'Failed to load glucose readings.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReadings();
    }, [loadReadings])
  );

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadReadings();
    setRefreshing(false);
  };

  const handleAddReading = async (): Promise<void> => {
    const glucoseValue = parseFloat(glucose);

    if (!validateGlucoseReading(glucoseValue)) {
      Alert.alert('Invalid Input', 'Please enter a glucose value between 20 and 600 mg/dL.');
      return;
    }

    setLoading(true);
    try {
      const success = await StorageService.addGlucoseReading({
        glucose: glucoseValue,
        notes: notes.trim(),
      });

      if (success) {
        setGlucose('');
        setNotes('');
        await loadReadings();
        Alert.alert('Success', 'Glucose reading added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add glucose reading. Please try again.');
      }
    } catch (error) {
      console.error('Error adding reading:', error);
      Alert.alert('Error', 'Failed to add glucose reading. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReading = (id: string): void => {
    Alert.alert('Delete Reading', 'Are you sure you want to delete this glucose reading?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await StorageService.deleteGlucoseReading(id);
            if (success) {
              await loadReadings();
              Alert.alert('Success', 'Glucose reading deleted successfully!');
            } else {
              Alert.alert('Error', 'Failed to delete glucose reading.');
            }
          } catch (error) {
            console.error('Error deleting reading:', error);
            Alert.alert('Error', 'Failed to delete glucose reading.');
          }
        },
      },
    ]);
  };

  interface ReadingItemProps {
    item: GlucoseReading;
  }

  const ReadingItem: React.FC<ReadingItemProps> = ({ item }) => (
    <View style={styles.readingItem}>
      <View style={styles.readingHeader}>
        <View style={styles.glucoseValue}>
          <Text style={[styles.glucoseText, { color: getGlucoseColor(item.glucose) }]}>
            {item.glucose}
          </Text>
          <Text style={styles.unitText}>mg/dL</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteReading(item.id)}>
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>
      <Text style={styles.timestampText}>{formatDateTime(item.timestamp)}</Text>
      {item.notes && <Text style={styles.notesText}>{item.notes}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Log Blood Glucose</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Glucose Level (mg/dL)</Text>
          <TextInput
            style={styles.input}
            value={glucose}
            onChangeText={setGlucose}
            placeholder="Enter glucose reading"
            keyboardType="numeric"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* Quick Input Buttons */}
        <View style={styles.quickButtonsContainer}>
          <Text style={styles.label}>Quick Input</Text>
          <View style={styles.quickButtonsGrid}>
            {quickButtons.map((button) => (
              <TouchableOpacity
                key={button.value}
                style={[styles.quickButton, { borderColor: button.color }]}
                onPress={() => setGlucose(button.value.toString())}
              >
                <Text style={[styles.quickButtonText, { color: button.color }]}>
                  {button.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about your reading..."
            multiline
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddReading}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>{loading ? 'Adding...' : 'Add Reading'}</Text>
        </TouchableOpacity>
      </View>

      {/* Readings List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Recent Readings</Text>
        <FlatList
          data={readings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReadingItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="water-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No glucose readings yet</Text>
              <Text style={styles.emptySubtext}>Add your first reading above</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inputSection: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  quickButtonsContainer: {
    marginBottom: 16,
  },
  quickButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickButton: {
    width: '30%',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: Colors.surface,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listSection: {
    flex: 1,
    padding: 16,
  },
  readingItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  glucoseValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  glucoseText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 4,
  },
  timestampText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default GlucoseScreen;
