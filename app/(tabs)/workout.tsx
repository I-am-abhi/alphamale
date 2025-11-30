import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Workout, WorkoutExercise } from '../../types';
import { workouts } from '../../data/workouts';
import { getWorkout, saveWorkout } from '../../services/storage';
import { formatDate, getDayOfWeek } from '../../utils/dateHelpers';

export default function WorkoutScreen() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    try {
      const today = new Date();
      const dayOfWeek = getDayOfWeek(today);
      
      // Sunday = 0, Monday = 1, etc.
      // Map: Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6
      // Our workouts: Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6
      // So dayOfWeek matches directly!
      const todayWorkout = workouts.find(w => w.day === dayOfWeek);
      
      if (todayWorkout) {
        // Try to load saved progress
        const saved = await getWorkout(formatDate(today));
        
        if (saved) {
          setWorkout(saved);
          setExercises(saved.exercises);
        } else {
          setWorkout(todayWorkout);
          setExercises(todayWorkout.exercises.map(ex => ({ ...ex })));
        }
      }
    } catch (error) {
      console.error('Error loading workout:', error);
    }
  };

  const toggleExercise = async (exerciseId: string) => {
    try {
      const updatedExercises = exercises.map(ex => {
        if (ex.id === exerciseId) {
          return { ...ex, completed: !ex.completed };
        }
        return ex;
      });
      
      setExercises(updatedExercises);
      
      if (workout) {
        const updatedWorkout: Workout = {
          ...workout,
          exercises: updatedExercises,
        };
        
        await saveWorkout(formatDate(new Date()), updatedWorkout);
        setWorkout(updatedWorkout);
      }
    } catch (error) {
      console.error('Error toggling exercise:', error);
    }
  };

  const groupedExercises = exercises.reduce((acc, ex) => {
    if (!acc[ex.muscleGroup]) {
      acc[ex.muscleGroup] = [];
    }
    acc[ex.muscleGroup].push(ex);
    return acc;
  }, {} as Record<string, WorkoutExercise[]>);

  const completedCount = exercises.filter(ex => ex.completed).length;
  const totalCount = exercises.length;
  const workoutProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getExerciseIcon = (exerciseId: string, exerciseName: string, muscleGroup: string): string => {
    // Exercise-specific icons using valid MaterialCommunityIcons
    const exerciseIcons: Record<string, string> = {
      // Chest exercises
      'bench-press': 'dumbbell',
      'incline-bench': 'dumbbell',
      'bench-sunday': 'dumbbell',
      'incline-dumbbell': 'dumbbell',
      'cable-fly': 'weight-lifter',
      'dumbbell-fly': 'weight-lifter',
      // Triceps exercises
      'rope-pushdown': 'weight-lifter',
      'overhead-extension': 'weight-lifter',
      'close-grip-bench': 'dumbbell',
      'tricep-kickback': 'weight-lifter',
      // Back exercises
      'lat-pulldown': 'weight-lifter',
      'seated-row': 'weight-lifter',
      'face-pulls': 'weight-lifter',
      'pull-ups': 'weight-lifter',
      'pull-ups-sunday': 'weight-lifter',
      't-bar-row': 'weight-lifter',
      // Biceps exercises
      'barbell-curl': 'weight-lifter',
      'hammer-curl': 'dumbbell',
      'preacher-curl': 'weight-lifter',
      // Legs exercises
      'squats': 'weight-lifter',
      'squat-sunday': 'weight-lifter',
      'leg-press': 'weight-lifter',
      'lunges': 'run',
      'leg-curl': 'weight-lifter',
      'calf-raises': 'weight-lifter',
      // Shoulders exercises
      'overhead-press': 'weight-lifter',
      'overhead-press-sunday': 'weight-lifter',
      'lateral-raise': 'weight-lifter',
      'rear-delt-fly': 'weight-lifter',
      // Core exercises
      'hanging-leg-raises': 'weight-lifter',
      'plank': 'yoga',
      'side-plank': 'yoga',
      'cable-crunch': 'weight-lifter',
      'reverse-crunch': 'yoga',
      'ab-wheel': 'yoga',
      // Full body exercises
      'deadlift': 'weight-lifter',
      // Cardio
      'cardio-sunday': 'run',
    };

    // Check by ID first
    if (exerciseIcons[exerciseId]) {
      return exerciseIcons[exerciseId];
    }

    // Fallback to muscle group icons
    const muscleGroupIcons: Record<string, string> = {
      'Chest': 'dumbbell',
      'Triceps': 'weight-lifter',
      'Back': 'weight-lifter',
      'Biceps': 'weight-lifter',
      'Legs': 'weight-lifter',
      'Shoulders': 'weight-lifter',
      'Core': 'yoga',
      'Full Body': 'weight-lifter',
      'Cardio': 'run',
    };

    return muscleGroupIcons[muscleGroup] || 'dumbbell';
  };

  const getWorkoutIcon = (workoutName: string): string => {
    const workoutIcons: Record<string, string> = {
      'Chest + Triceps + Core': 'dumbbell',
      'Back + Biceps': 'weight-lifter',
      'Legs + Core': 'weight-lifter',
      'Shoulders + Arms': 'weight-lifter',
      'Upper Body (Chest + Back) + Core': 'dumbbell',
      'Full Body + Cardio': 'dumbbell',
    };
    return workoutIcons[workoutName] || 'dumbbell';
  };

  if (!workout) {
    return (
      <View style={styles.container}>
        <View style={styles.restDayContainer}>
          <MaterialCommunityIcons name="sleep" size={64} color="#666666" />
          <Text style={styles.restDayText}>Rest Day</Text>
          <Text style={styles.restDaySubtext}>Recover and recharge. A warrior sharpens his weapons on Sunday.</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <MaterialCommunityIcons
            name={getWorkoutIcon(workout.name)}
            size={32}
            color="#4CAF50"
          />
          <Text style={styles.workoutName}>{workout.name}</Text>
        </View>
        <Text style={styles.progressText}>
          {completedCount} / {totalCount} exercises ({Math.round(workoutProgress)}%)
        </Text>
      </View>

      {/* Exercises by Muscle Group */}
      {Object.entries(groupedExercises).map(([muscleGroup, groupExercises]) => (
        <View key={muscleGroup} style={styles.section}>
          <Text style={styles.sectionTitle}>{muscleGroup}</Text>
          {groupExercises.map(exercise => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                exercise.completed && styles.exerciseCompleted,
              ]}
              onPress={() => toggleExercise(exercise.id)}
            >
              <View style={styles.exerciseHeader}>
                <View style={[styles.exerciseIconContainer, exercise.completed && styles.exerciseIconContainerCompleted]}>
                  <MaterialCommunityIcons
                    name={exercise.completed ? 'check-circle' : getExerciseIcon(exercise.id, exercise.name, exercise.muscleGroup)}
                    size={24}
                    color={exercise.completed ? '#4CAF50' : '#666666'}
                  />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text
                    style={[
                      styles.exerciseName,
                      exercise.completed && styles.exerciseNameCompleted,
                    ]}
                  >
                    {exercise.name}
                  </Text>
                  <Text style={styles.exerciseSets}>
                    {exercise.sets} sets × {exercise.reps}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  progressText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  exerciseCompleted: {
    backgroundColor: '#1a2e1a',
    borderColor: '#4CAF50',
    opacity: 0.7,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseIconContainerCompleted: {
    backgroundColor: '#1a2e1a',
  },
  exerciseInfo: {
    marginLeft: 15,
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  exerciseNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  exerciseSets: {
    fontSize: 14,
    color: '#666666',
  },
  restDayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  restDayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  restDaySubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },
});

