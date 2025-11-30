import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions, scheduleAllNotifications, scheduleDailyWaterReminders, setupNotificationCategories, setupWaterReminderListener } from '../services/notifications';
import { dailyTasks } from '../data/dailyTasks';
import { initializeTodayTasks, getNotificationsInitializedDate, setNotificationsInitializedDate } from '../services/storage';
import { formatDate } from '../utils/dateHelpers';

export default function RootLayout() {
  useEffect(() => {
    let responseListener: Notifications.NotificationResponseListener | null = null;
    
    // Initialize app
    const initializeApp = async () => {
      try {
        // Request notification permissions first (with error handling for Expo Go)
        try {
          await requestNotificationPermissions();
        } catch (permError) {
          // In Expo Go, local notifications may show warnings but still work
          console.warn('Notification permission warning (continuing anyway):', permError);
        }
        
        // Set up notification categories with action buttons
        try {
          await setupNotificationCategories();
        } catch (categoryError) {
          console.warn('Notification category setup warning (continuing anyway):', categoryError);
        }
        
        // Check if notifications were already initialized today
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
        
        // Initialize today's tasks
        await initializeTodayTasks(dailyTasks);
        
        // Set up water reminder listener (always set up, but only one instance)
        try {
          responseListener = setupWaterReminderListener();
        } catch (listenerError) {
          console.warn('Error setting up notification listener:', listenerError);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
    
    // Cleanup function
    return () => {
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  return (
    <>
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
    </>
  );
}

