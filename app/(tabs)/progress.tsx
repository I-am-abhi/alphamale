import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getProgress, getAllDatesWithData, getTodayWaterCount, getTodayWaterSkipped } from '../../services/storage';
import { Progress } from '../../types';

export default function ProgressScreen() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [completionDays, setCompletionDays] = useState(0);
  const [totalDaysTracked, setTotalDaysTracked] = useState(0);
  const [waterDrank, setWaterDrank] = useState(0);
  const [waterSkipped, setWaterSkipped] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const savedProgress = await getProgress();
      if (savedProgress) {
        setProgress(savedProgress);
      }

      // Count days with completed tasks
      const dates = await getAllDatesWithData();
      setTotalDaysTracked(dates.length);
      
      // Count days where ALL tasks were completed (100% completion)
      // This would require checking each day's completion rate
      // For now, we'll show total days with any data
      setCompletionDays(dates.length);
      
      // Load today's water stats
      const drank = await getTodayWaterCount();
      const skipped = await getTodayWaterSkipped();
      setWaterDrank(drank);
      setWaterSkipped(skipped);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Overall Progress */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress Dashboard</Text>
        <Text style={styles.subtitle}>Lifetime Progress - Week After Week</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="calendar-check" size={32} color="#4CAF50" />
          <Text style={styles.statValue}>{completionDays}</Text>
          <Text style={styles.statLabel}>Days Tracked</Text>
          <Text style={styles.statHint}>Days with tasks logged</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons name="fire" size={32} color="#FF6B35" />
          <Text style={styles.statValue}>
            {progress?.streaks.gym || 0}
          </Text>
          <Text style={styles.statLabel}>Gym Streak</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons name="run" size={32} color="#4A90E2" />
          <Text style={styles.statValue}>
            {progress?.streaks.cardio || 0}
          </Text>
          <Text style={styles.statLabel}>Cardio Streak</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons name="water" size={32} color="#00BCD4" />
          <Text style={styles.statValue}>
            {waterDrank}
          </Text>
          <Text style={styles.statLabel}>Water Drank</Text>
          <Text style={styles.statHint}>Today: {waterDrank} drank, {waterSkipped} skipped</Text>
        </View>

        <View style={styles.statCard}>
          <MaterialCommunityIcons name="face-man" size={32} color="#FF6B9D" />
          <Text style={styles.statValue}>
            {progress?.streaks.grooming || 0}
          </Text>
          <Text style={styles.statLabel}>Grooming Streak</Text>
        </View>
      </View>

      {/* Weekly Cycle Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Weekly Cycle</Text>
        <View style={styles.cycleCard}>
          <Text style={styles.cycleText}>
            Your routine repeats week after week, building discipline that lasts a lifetime.
          </Text>
          <Text style={styles.cycleSubtext}>
            Every week: 7 workouts, 7 days of discipline, continuous growth.
          </Text>
        </View>
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationText}>
          🐺 The Journey Never Ends
        </Text>
        <Text style={styles.motivationList}>
          • Face sharper{'\n'}
          • Shoulders wider{'\n'}
          • Clothes fit better{'\n'}
          • Skills increased{'\n'}
          • Confidence higher{'\n'}
          • Mind calmer{'\n'}
          • People stare longer
        </Text>
        <Text style={styles.motivationFooter}>
          This is not a 90-day challenge.{'\n'}
          This is your life. Week after week. Until death.{'\n'}
          {'\n'}
          You don't become a better version of yourself.{'\n'}
          You bury the old version.
        </Text>
      </View>
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
    paddingTop: 50,
    paddingBottom: 25,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#aaaaaa',
    marginBottom: 20,
    fontWeight: '500',
  },
  progressBarContainer: {
    marginTop: 10,
  },
  progressBarBackground: {
    height: 20,
    backgroundColor: '#333333',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    letterSpacing: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#aaaaaa',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  statHint: {
    fontSize: 11,
    color: '#666666',
    marginTop: 3,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  cycleCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 22,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cycleText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 10,
  },
  cycleSubtext: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
  },
  motivationCard: {
    margin: 20,
    marginTop: 10,
    padding: 25,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  motivationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  motivationList: {
    fontSize: 17,
    color: '#e0e0e0',
    lineHeight: 28,
    marginBottom: 18,
    fontWeight: '500',
  },
  motivationFooter: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#aaaaaa',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
});

