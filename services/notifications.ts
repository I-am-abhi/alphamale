import * as Notifications from 'expo-notifications';
import { Task } from '../types';
import { getNextOccurrence, parseTime } from '../utils/dateHelpers';
import { logWaterIntake, logWaterSkipped } from './storage';

// Configure notification behavior with actions
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Handle water reminder with actions
    if (notification.request.content.data?.type === 'water_reminder') {
      return {
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    }
    
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

// Set up notification categories for actions
export async function setupNotificationCategories(): Promise<void> {
  try {
    await Notifications.setNotificationCategoryAsync('WATER_REMINDER', [
      {
        identifier: 'WATER_YES',
        buttonTitle: '✅ Yes, I drank',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'WATER_LATER',
        buttonTitle: '⏰ Remind me later',
        options: {
          opensAppToForeground: false,
        },
      },
    ], {
      intentIdentifiers: [],
      hiddenPreviewsBodyPlaceholder: '',
      categorySummaryFormat: '',
    });
    console.log('Notification categories set up successfully');
  } catch (error) {
    console.error('Error setting up notification categories:', error);
  }
}

// Request permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    // In Expo Go, local notifications should still work even if there's a warning
    // about remote notifications being unavailable
    console.warn('Notification permissions warning (local notifications should still work):', error);
    // Return true to continue - local notifications work without explicit permission in many cases
    return true;
  }
}

// Schedule a single notification
export async function scheduleNotification(
  task: Task,
  identifier?: string
): Promise<string> {
  try {
    const { hours, minutes } = parseTime(task.time);
    const trigger: Notifications.NotificationTriggerInput = {
      hour: hours,
      minute: minutes,
      repeats: true,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🐺 Alpha Male Reminder',
        body: task.title,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { taskId: task.id },
      },
      trigger,
      identifier: identifier || `task_${task.id}`,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

// Schedule all daily task notifications
export async function scheduleAllNotifications(tasks: Task[], forceReschedule: boolean = false): Promise<void> {
  try {
    // Check if notifications are already scheduled for today
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    const taskNotifications = existing.filter(n => n.identifier.startsWith('task_'));
    
    // Only reschedule if forced or if no task notifications exist
    if (!forceReschedule && taskNotifications.length > 0) {
      console.log(`Notifications already scheduled (${taskNotifications.length} found). Skipping.`);
      return;
    }
    
    // Cancel all existing task notifications first
    for (const notif of taskNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
    
    // Schedule new ones
    for (const task of tasks) {
      await scheduleNotification(task);
    }
    
    console.log(`Scheduled ${tasks.length} task notifications`);
  } catch (error) {
    console.error('Error scheduling all notifications:', error);
    throw error;
  }
}

// Cancel a specific notification
export async function cancelNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

// Get all scheduled notifications
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

// Schedule a one-time notification for a specific date/time
export async function scheduleOneTimeNotification(
  title: string,
  body: string,
  date: Date
): Promise<string> {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: date,
    });
  } catch (error) {
    console.error('Error scheduling one-time notification:', error);
    throw error;
  }
}

// Schedule motivational notification
export async function scheduleMotivationalNotification(day: number): Promise<void> {
  const messages = [
    `Day ${day} - You're becoming unstoppable! 💪`,
    `Day ${day} - Keep going, warrior! 🐺`,
    `Day ${day} - Your future self is watching. Make him proud. 🔥`,
    `Day ${day} - Discipline is choosing between what you want now and what you want most. ⚡`,
  ];
  
  const message = messages[day % messages.length];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(6, 30, 0, 0);
  
  await scheduleOneTimeNotification('🐺 Alpha Male', message, tomorrow);
}

// Schedule hourly water reminder
export async function scheduleWaterReminder(triggerTime: Date): Promise<string> {
  try {
    const identifier = `water_reminder_${triggerTime.getTime()}`;
    
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Time to Drink Water!',
        body: 'Stay hydrated, warrior. Did you drink water?',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { 
          type: 'water_reminder',
          identifier,
        },
        categoryId: 'WATER_REMINDER',
      },
      trigger: triggerTime,
      identifier,
    });
  } catch (error) {
    console.error('Error scheduling water reminder:', error);
    throw error;
  }
}

// Schedule all hourly water reminders for the day
export async function scheduleDailyWaterReminders(forceReschedule: boolean = false): Promise<void> {
  try {
    const now = new Date();
    const today = now.toDateString();
    
    // Check if water reminders are already scheduled for today
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    const waterReminders = existing.filter(n => n.identifier.startsWith('water_reminder_'));
    
    // Only reschedule if forced or if no water reminders exist
    if (!forceReschedule && waterReminders.length > 0) {
      console.log(`Water reminders already scheduled (${waterReminders.length} found). Skipping.`);
      return;
    }
    
    const wakeTime = new Date();
    wakeTime.setHours(6, 30, 0, 0); // 6:30 AM wake up
    wakeTime.setMinutes(0, 0, 0);
    wakeTime.setSeconds(0, 0);
    
    const sleepTime = new Date();
    sleepTime.setHours(23, 30, 0, 0); // 11:30 PM sleep
    sleepTime.setMinutes(0, 0, 0);
    sleepTime.setSeconds(0, 0);
    
    // Cancel existing water reminders
    for (const notif of waterReminders) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
    
    // Calculate start time: first reminder 1 hour after wake time (7:30 AM)
    // Or if already past wake time, start from next hour
    let startTime = new Date();
    if (now < wakeTime) {
      // Before wake time, schedule from 7:30 AM
      startTime = new Date(wakeTime);
      startTime.setHours(7, 30, 0, 0);
    } else {
      // After wake time, start from next hour
      startTime.setMinutes(0, 0, 0);
      startTime.setSeconds(0, 0);
      startTime.setMilliseconds(0);
      startTime.setHours(startTime.getHours() + 1);
    }
    
    // Schedule reminders every hour until sleep time
    let currentTime = new Date(startTime);
    let scheduledCount = 0;
    
    while (currentTime <= sleepTime) {
      if (currentTime > now) {
        await scheduleWaterReminder(new Date(currentTime));
        scheduledCount++;
      }
      currentTime.setHours(currentTime.getHours() + 1);
    }
    
    console.log(`Scheduled ${scheduledCount} water reminders for today`);
  } catch (error) {
    console.error('Error scheduling daily water reminders:', error);
  }
}

// Handle water reminder response from notification action
export async function handleWaterReminderResponse(actionIdentifier: string): Promise<void> {
  try {
    const now = new Date();
    const sleepTime = new Date();
    sleepTime.setHours(23, 30, 0, 0);
    
    // Don't schedule if it's past sleep time
    if (now >= sleepTime) {
      console.log('Past sleep time, no more water reminders today');
      return;
    }
    
    if (actionIdentifier === 'WATER_YES') {
      // Log water intake
      await logWaterIntake();
      
      // User drank - schedule next reminder in 1 hour
      const nextReminder = new Date(now);
      nextReminder.setHours(nextReminder.getHours() + 1);
      nextReminder.setMinutes(0, 0, 0);
      nextReminder.setSeconds(0, 0);
      
      if (nextReminder <= sleepTime) {
        await scheduleWaterReminder(nextReminder);
        console.log('Water reminder: User drank. Next reminder in 1 hour.');
      }
    } else if (actionIdentifier === 'WATER_LATER') {
      // Track as skipped
      await logWaterSkipped();
      
      // User wants reminder later - schedule in 30 minutes
      const nextReminder = new Date(now);
      nextReminder.setMinutes(nextReminder.getMinutes() + 30);
      nextReminder.setSeconds(0, 0);
      
      if (nextReminder <= sleepTime) {
        await scheduleWaterReminder(nextReminder);
        console.log('Water reminder: User wants later. Reminder in 30 minutes.');
      }
    }
  } catch (error) {
    console.error('Error handling water reminder response:', error);
  }
}

// Set up notification listener for water reminder actions
export function setupWaterReminderListener(): Notifications.NotificationResponseListener {
  const listener = Notifications.addNotificationResponseReceivedListener(response => {
    const actionIdentifier = response.actionIdentifier;
    const data = response.notification.request.content.data;
    
    // Only handle water reminder responses
    if (data?.type === 'water_reminder') {
      if (actionIdentifier === 'WATER_YES' || actionIdentifier === 'WATER_LATER') {
        handleWaterReminderResponse(actionIdentifier);
      } else if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        // User tapped notification (not an action button) - remind later
        handleWaterReminderResponse('WATER_LATER');
      }
    }
  });
  
  console.log('Water reminder listener set up');
  return listener;
}

