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
import type { Meal, MealType, MealTypeSelectorProps } from '@/types';
import { formatDateTime, validateCarbAmount } from '@/utils/helpers';

const MealsScreen: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [type, setType] = useState<MealType>('breakfast');
  const [notes, setNotes] = useState<string>('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const quickCarbs = {
    breakfast: [15, 30, 45, 60],
    lunch: [30, 45, 60, 75],
    dinner: [30, 45, 60, 75],
    snack: [10, 15, 20, 30],
  };

  const mealTypeLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  };

  const mealTypeIcons = {
    breakfast: 'sunny-outline',
    lunch: 'partly-sunny-outline',
    dinner: 'moon-outline',
    snack: 'cafe-outline',
  };

  const mealTypeColors = {
    breakfast: Colors.warning,
    lunch: Colors.success,
    dinner: Colors.primary,
    snack: Colors.accent,
  };

  const loadMeals = useCallback(async (): Promise<void> => {
    try {
      const data = await StorageService.getMeals();
      setMeals(data);
    } catch (error) {
      console.error('Error loading meals:', error);
      Alert.alert('Error', 'Failed to load meals.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals])
  );

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  const handleAddMeal = async (): Promise<void> => {
    const carbsValue = parseFloat(carbs);

    if (!name.trim()) {
      Alert.alert('Invalid Input', 'Please enter a meal name.');
      return;
    }

    if (!validateCarbAmount(carbsValue)) {
      Alert.alert('Invalid Input', 'Please enter a valid carb amount between 0 and 300g.');
      return;
    }

    setLoading(true);
    try {
      const success = await StorageService.addMeal({
        name: name.trim(),
        carbs: carbsValue,
        type,
        notes: notes.trim(),
      });

      if (success) {
        setName('');
        setCarbs('');
        setNotes('');
        await loadMeals();
        Alert.alert('Success', 'Meal logged successfully!');
      } else {
        Alert.alert('Error', 'Failed to log meal. Please try again.');
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to log meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = (id: string): void => {
    Alert.alert('Delete Meal', 'Are you sure you want to delete this meal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await StorageService.deleteMeal(id);
            if (success) {
              await loadMeals();
              Alert.alert('Success', 'Meal deleted successfully!');
            } else {
              Alert.alert('Error', 'Failed to delete meal.');
            }
          } catch (error) {
            console.error('Error deleting meal:', error);
            Alert.alert('Error', 'Failed to delete meal.');
          }
        },
      },
    ]);
  };

  const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({ selected, onSelect }) => (
    <View style={styles.typeSelectorContainer}>
      <Text style={styles.label}>Meal Type</Text>
      <View style={styles.typeSelector}>
        {(Object.keys(mealTypeLabels) as MealType[]).map((mealType) => (
          <TouchableOpacity
            key={mealType}
            style={[
              styles.typeButton,
              selected === mealType && [
                styles.typeButtonActive,
                { backgroundColor: mealTypeColors[mealType] },
              ],
              { borderColor: mealTypeColors[mealType] },
            ]}
            onPress={() => onSelect(mealType)}
          >
            <Ionicons
              name={mealTypeIcons[mealType] as keyof typeof Ionicons.glyphMap}
              size={16}
              color={selected === mealType ? Colors.surface : mealTypeColors[mealType]}
            />
            <Text
              style={[
                styles.typeButtonText,
                selected === mealType && { color: Colors.surface },
                !selected && { color: mealTypeColors[mealType] },
              ]}
            >
              {mealTypeLabels[mealType]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  interface MealItemProps {
    item: Meal;
  }

  const MealItem: React.FC<MealItemProps> = ({ item }) => (
    <View style={styles.mealItem}>
      <View style={styles.mealHeader}>
        <View style={styles.mealInfo}>
          <View style={styles.mealNameContainer}>
            <Ionicons
              name={mealTypeIcons[item.type] as keyof typeof Ionicons.glyphMap}
              size={20}
              color={mealTypeColors[item.type]}
            />
            <Text style={styles.mealName}>{item.name}</Text>
          </View>
          <View style={styles.carbsContainer}>
            <Text style={styles.carbsText}>{item.carbs}</Text>
            <Text style={styles.carbsLabel}>g carbs</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteMeal(item.id)}>
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>
      <View style={[styles.typeTag, { backgroundColor: mealTypeColors[item.type] }]}>
        <Text style={styles.typeTagText}>{mealTypeLabels[item.type]}</Text>
      </View>
      <Text style={styles.timestampText}>{formatDateTime(item.timestamp)}</Text>
      {item.notes && <Text style={styles.notesText}>{item.notes}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Log Meal</Text>

        <MealTypeSelector selected={type} onSelect={setType} />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Meal Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter meal name"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Carbohydrates (g)</Text>
          <TextInput
            style={styles.input}
            value={carbs}
            onChangeText={setCarbs}
            placeholder="Enter carb amount"
            keyboardType="numeric"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* Quick Carb Buttons */}
        <View style={styles.quickButtonsContainer}>
          <Text style={styles.label}>Quick Carbs</Text>
          <View style={styles.quickButtonsGrid}>
            {quickCarbs[type].map((carbAmount) => (
              <TouchableOpacity
                key={carbAmount}
                style={[styles.quickButton, { borderColor: mealTypeColors[type] }]}
                onPress={() => setCarbs(carbAmount.toString())}
              >
                <Text style={[styles.quickButtonText, { color: mealTypeColors[type] }]}>
                  {carbAmount}g
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
            placeholder="Add notes about your meal..."
            multiline
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddMeal}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>{loading ? 'Logging...' : 'Log Meal'}</Text>
        </TouchableOpacity>
      </View>

      {/* Meals List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Recent Meals</Text>
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MealItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No meals logged yet</Text>
              <Text style={styles.emptySubtext}>Add your first meal above</Text>
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
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 12,
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
    width: '23%',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: Colors.surface,
  },
  quickButtonText: {
    fontSize: 14,
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
  mealItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealInfo: {
    flex: 1,
  },
  mealNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  carbsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  carbsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.warning,
  },
  carbsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
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

export default MealsScreen;
