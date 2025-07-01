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
import type { InsulinInjection, InsulinType, TypeSelectorProps } from '@/types';
import { formatDateTime, validateInsulinDose } from '@/utils/helpers';

const InsulinScreen: React.FC = () => {
  const [units, setUnits] = useState<string>('');
  const [type, setType] = useState<InsulinType>('rapid_acting');
  const [notes, setNotes] = useState<string>('');
  const [injections, setInjections] = useState<InsulinInjection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const quickDoses = {
    rapid_acting: [2, 4, 6, 8, 10, 12],
    long_acting: [10, 15, 20, 25, 30, 35],
  };

  const insulinTypeLabels = {
    rapid_acting: 'Rapid-Acting',
    long_acting: 'Long-Acting',
  };

  const loadInjections = useCallback(async (): Promise<void> => {
    try {
      const data = await StorageService.getInsulinInjections();
      setInjections(data);
    } catch (error) {
      console.error('Error loading injections:', error);
      Alert.alert('Error', 'Failed to load insulin injections.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInjections();
    }, [loadInjections])
  );

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadInjections();
    setRefreshing(false);
  };

  const handleAddInjection = async (): Promise<void> => {
    const unitsValue = parseFloat(units);

    if (!validateInsulinDose(unitsValue)) {
      Alert.alert('Invalid Input', 'Please enter a valid dose between 0.1 and 100 units.');
      return;
    }

    setLoading(true);
    try {
      const success = await StorageService.addInsulinInjection({
        units: unitsValue,
        type,
        notes: notes.trim(),
      });

      if (success) {
        setUnits('');
        setNotes('');
        await loadInjections();
        Alert.alert('Success', 'Insulin injection logged successfully!');
      } else {
        Alert.alert('Error', 'Failed to log insulin injection. Please try again.');
      }
    } catch (error) {
      console.error('Error adding injection:', error);
      Alert.alert('Error', 'Failed to log insulin injection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInjection = (id: string): void => {
    Alert.alert('Delete Injection', 'Are you sure you want to delete this insulin injection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await StorageService.deleteInsulinInjection(id);
            if (success) {
              await loadInjections();
              Alert.alert('Success', 'Insulin injection deleted successfully!');
            } else {
              Alert.alert('Error', 'Failed to delete insulin injection.');
            }
          } catch (error) {
            console.error('Error deleting injection:', error);
            Alert.alert('Error', 'Failed to delete insulin injection.');
          }
        },
      },
    ]);
  };

  const TypeSelector: React.FC<TypeSelectorProps> = ({ selected, onSelect }) => (
    <View style={styles.typeSelectorContainer}>
      <Text style={styles.label}>Insulin Type</Text>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selected === 'rapid_acting' && styles.typeButtonActive,
            { borderColor: Colors.rapidActing },
          ]}
          onPress={() => onSelect('rapid_acting')}
        >
          <Text
            style={[
              styles.typeButtonText,
              selected === 'rapid_acting' && { color: Colors.surface },
            ]}
          >
            Rapid-Acting
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selected === 'long_acting' && styles.typeButtonActive,
            { borderColor: Colors.longActing },
          ]}
          onPress={() => onSelect('long_acting')}
        >
          <Text
            style={[styles.typeButtonText, selected === 'long_acting' && { color: Colors.surface }]}
          >
            Long-Acting
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  interface InjectionItemProps {
    item: InsulinInjection;
  }

  const InjectionItem: React.FC<InjectionItemProps> = ({ item }) => (
    <View style={styles.injectionItem}>
      <View style={styles.injectionHeader}>
        <View style={styles.injectionInfo}>
          <View style={styles.unitsContainer}>
            <Text style={styles.unitsText}>{item.units}</Text>
            <Text style={styles.unitsLabel}>units</Text>
          </View>
          <View
            style={[
              styles.typeTag,
              {
                backgroundColor:
                  item.type === 'rapid_acting' ? Colors.rapidActing : Colors.longActing,
              },
            ]}
          >
            <Text style={styles.typeTagText}>{insulinTypeLabels[item.type]}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteInjection(item.id)}
        >
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
        <Text style={styles.sectionTitle}>Log Insulin Injection</Text>

        <TypeSelector selected={type} onSelect={setType} />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dose (units)</Text>
          <TextInput
            style={styles.input}
            value={units}
            onChangeText={setUnits}
            placeholder="Enter insulin dose"
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* Quick Dose Buttons */}
        <View style={styles.quickButtonsContainer}>
          <Text style={styles.label}>Quick Doses</Text>
          <View style={styles.quickButtonsGrid}>
            {quickDoses[type].map((dose) => (
              <TouchableOpacity
                key={dose}
                style={[
                  styles.quickButton,
                  { borderColor: type === 'rapid_acting' ? Colors.rapidActing : Colors.longActing },
                ]}
                onPress={() => setUnits(dose.toString())}
              >
                <Text
                  style={[
                    styles.quickButtonText,
                    { color: type === 'rapid_acting' ? Colors.rapidActing : Colors.longActing },
                  ]}
                >
                  {dose}
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
            placeholder="Add notes about your injection..."
            multiline
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddInjection}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>{loading ? 'Logging...' : 'Log Injection'}</Text>
        </TouchableOpacity>
      </View>

      {/* Injections List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Recent Injections</Text>
        <FlatList
          data={injections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <InjectionItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No insulin injections yet</Text>
              <Text style={styles.emptySubtext}>Log your first injection above</Text>
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
  typeSelectorContainer: {
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
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
  injectionItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  injectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  injectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unitsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  unitsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  unitsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.surface,
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

export default InsulinScreen;
