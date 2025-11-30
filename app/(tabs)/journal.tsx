import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getJournalEntry, saveJournalEntry } from '../../services/storage';
import { formatDate, formatDateWithDay, getDayNameFull } from '../../utils/dateHelpers';
import { JournalEntry } from '../../types';

export default function JournalScreen() {
  const [journalCompleted, setJournalCompleted] = useState(false);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    loadJournal();
  }, []);

  const loadJournal = async () => {
    try {
      const today = formatDate(new Date());
      setTodayDate(formatDateWithDay(new Date()));
      
      const entry = await getJournalEntry(today);
      setJournalCompleted(!!entry);
    } catch (error) {
      console.error('Error loading journal:', error);
    }
  };

  const toggleJournal = async () => {
    try {
      const today = formatDate(new Date());
      const newCompleted = !journalCompleted;
      
      if (newCompleted) {
        // Save a simple entry
        const entry: JournalEntry = {
          date: today,
          whatWentWell: 'Journal completed',
          whatToImprove: '',
          gratitude: [],
          tomorrowFocus: '',
        };
        await saveJournalEntry(entry);
      } else {
        // Could delete entry, but for simplicity just mark as incomplete
        // In a real app, you might want to delete the entry
      }
      
      setJournalCompleted(newCompleted);
    } catch (error) {
      console.error('Error toggling journal:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Journal</Text>
        <Text style={styles.subtitle}>{todayDate}</Text>
      </View>

      {/* Journal Reminder Card */}
      <View style={styles.reminderCard}>
        <MaterialCommunityIcons 
          name="book-open-variant" 
          size={48} 
          color="#4CAF50" 
          style={styles.icon}
        />
        <Text style={styles.reminderTitle}>Time for Reflection</Text>
        <Text style={styles.reminderText}>
          Take a moment to reflect on your day in your physical diary.
        </Text>
        <Text style={styles.reminderTime}>⏰ Reminder: 10:15 PM</Text>
      </View>

      {/* Journal Completion Checkbox */}
      <TouchableOpacity
        style={[styles.completionCard, journalCompleted && styles.completionCardDone]}
        onPress={toggleJournal}
      >
        <MaterialCommunityIcons
          name={journalCompleted ? 'check-circle' : 'circle-outline'}
          size={32}
          color={journalCompleted ? '#4CAF50' : '#666666'}
        />
        <View style={styles.completionTextContainer}>
          <Text style={[styles.completionTitle, journalCompleted && styles.completionTitleDone]}>
            {journalCompleted ? 'Journal Entry Completed' : 'Mark Journal as Complete'}
          </Text>
          <Text style={styles.completionSubtext}>
            {journalCompleted 
              ? 'Great job reflecting on your day!' 
              : 'Tap when you\'ve finished writing in your diary'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Motivational Quote */}
      <View style={styles.quoteContainer}>
        <MaterialCommunityIcons name="format-quote-close" size={24} color="#4CAF50" />
        <Text style={styles.quote}>
          "Your silence becomes your aura."
        </Text>
        <Text style={styles.quoteAuthor}>— Alpha Male</Text>
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
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
  },
  reminderCard: {
    margin: 20,
    marginTop: 10,
    padding: 25,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  icon: {
    marginBottom: 15,
  },
  reminderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  reminderText: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
  },
  reminderTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 10,
  },
  completionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#333333',
  },
  completionCardDone: {
    borderColor: '#4CAF50',
    backgroundColor: '#1a2e1a',
  },
  completionTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 5,
  },
  completionTitleDone: {
    color: '#4CAF50',
  },
  completionSubtext: {
    fontSize: 14,
    color: '#888888',
  },
  quoteContainer: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    alignItems: 'center',
  },
  quote: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#cccccc',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
  },
});
