import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions, scheduleAllNotifications, scheduleDailyWaterReminders, setupNotificationCategories, setupWaterReminderListener } from '../services/notifications';
import { dailyTasks } from '../data/dailyTasks';
import { initializeTodayTasks, getNotificationsInitializedDate, setNotificationsInitializedDate } from '../services/storage';
import { formatDate } from '../utils/dateHelpers';

// Simple Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  useEffect(() => {
    let responseListener: Notifications.NotificationResponseListener | null = null;
    
    // Initialize app with comprehensive error handling
    const initializeApp = async () => {
      try {
        // Request notification permissions first (with error handling)
        try {
          await requestNotificationPermissions();
        } catch (permError) {
          console.warn('Notification permission warning (continuing anyway):', permError);
        }
        
        // Set up notification categories with action buttons
        try {
          await setupNotificationCategories();
        } catch (categoryError) {
          console.warn('Notification category setup warning (continuing anyway):', categoryError);
        }
        
        // Check if notifications were already initialized today
        try {
          const today = formatDate(new Date());
          const initializedDate = await getNotificationsInitializedDate();
          const needsInitialization = initializedDate !== today;
          
          if (needsInitialization) {
            console.log('Initializing notifications for today...');
            
            try {
              // Schedule notifications (only if not already scheduled)
              await scheduleAllNotifications(dailyTasks, false);
            } catch (notifError) {
              console.warn('Error scheduling task notifications (local notifications may still work):', notifError);
            }
            
            try {
              // Schedule hourly water reminders (only if not already scheduled)
              await scheduleDailyWaterReminders(false);
            } catch (waterError) {
              console.warn('Error scheduling water reminders (local notifications may still work):', waterError);
            }
            
            // Mark as initialized for today
            await setNotificationsInitializedDate(today);
          } else {
            console.log('Notifications already initialized for today. Skipping.');
          }
        } catch (initError) {
          console.warn('Error initializing notifications (app will continue):', initError);
        }
        
        // Initialize today's tasks (critical - must not crash)
        try {
          await initializeTodayTasks(dailyTasks);
        } catch (taskError) {
          console.error('Error initializing tasks:', taskError);
          // Don't throw - app should still load
        }
        
        // Set up water reminder listener (always set up, but only one instance)
        try {
          responseListener = setupWaterReminderListener();
        } catch (listenerError) {
          console.warn('Error setting up notification listener:', listenerError);
        }
      } catch (error) {
        console.error('Error initializing app (non-critical):', error);
        // Don't crash the app - continue anyway
      }
    };
    
    // Delay initialization slightly to ensure app loads first
    setTimeout(() => {
      initializeApp();
    }, 100);
    
    // Cleanup function
    return () => {
      if (responseListener) {
        try {
          responseListener.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

