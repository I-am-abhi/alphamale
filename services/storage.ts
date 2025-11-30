import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, DailyTasks, Workout, JournalEntry, Progress } from '../types';
import { formatDate } from '../utils/dateHelpers';

const STORAGE_KEYS = {
  DAILY_TASKS: 'daily_tasks',
  WORKOUTS: 'workouts',
  JOURNAL: 'journal',
  PROGRESS: 'progress',
  START_DATE: 'start_date',
  SETTINGS: 'settings',
  WATER_LOGS: 'water_logs',
  WATER_SKIPPED: 'water_skipped',
  LAST_WATER_TIME: 'last_water_time',
  CUSTOM_TASKS: 'custom_tasks',
  NOTIFICATIONS_INITIALIZED: 'notifications_initialized',
};

// Daily Tasks Storage
export async function saveDailyTasks(date: string, tasks: Record<string, Task>): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.DAILY_TASKS}_${date}`;
    await AsyncStorage.setItem(key, JSON.stringify({ date, tasks }));
  } catch (error) {
    console.error('Error saving daily tasks:', error);
    throw error;
  }
}

export async function getDailyTasks(date: string): Promise<DailyTasks | null> {
  try {
    const key = `${STORAGE_KEYS.DAILY_TASKS}_${date}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting daily tasks:', error);
    return null;
  }
}

export async function updateTaskCompletion(
  date: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  try {
    const dailyTasks = await getDailyTasks(date);
    if (dailyTasks && dailyTasks.tasks[taskId]) {
      dailyTasks.tasks[taskId].completed = completed;
      dailyTasks.tasks[taskId].completedAt = completed ? new Date().toISOString() : undefined;
      await saveDailyTasks(date, dailyTasks.tasks);
    }
  } catch (error) {
    console.error('Error updating task completion:', error);
    throw error;
  }
}

// Workout Storage
export async function saveWorkout(date: string, workout: Workout): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.WORKOUTS}_${date}`;
    await AsyncStorage.setItem(key, JSON.stringify({ date, workout }));
  } catch (error) {
    console.error('Error saving workout:', error);
    throw error;
  }
}

export async function getWorkout(date: string): Promise<Workout | null> {
  try {
    const key = `${STORAGE_KEYS.WORKOUTS}_${date}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.workout;
    }
    return null;
  } catch (error) {
    console.error('Error getting workout:', error);
    return null;
  }
}

// Journal Storage
export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.JOURNAL}_${entry.date}`;
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
}

export async function getJournalEntry(date: string): Promise<JournalEntry | null> {
  try {
    const key = `${STORAGE_KEYS.JOURNAL}_${date}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting journal entry:', error);
    return null;
  }
}

// Progress Storage
export async function saveProgress(progress: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
    throw error;
  }
}

export async function getProgress(): Promise<Progress | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting progress:', error);
    return null;
  }
}

// Start Date Storage
export async function setStartDate(date: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.START_DATE, date);
  } catch (error) {
    console.error('Error setting start date:', error);
    throw error;
  }
}

export async function getStartDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.START_DATE);
  } catch (error) {
    console.error('Error getting start date:', error);
    return null;
  }
}

// Initialize today's tasks - always merge with latest task definitions
export async function initializeTodayTasks(tasks: Task[]): Promise<void> {
  const today = formatDate(new Date());
  const existing = await getDailyTasks(today);
  
  const tasksMap: Record<string, Task> = {};
  
  // Check if today is a weekend
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Always use the latest task definitions, but filter weekday-only tasks on weekends
  tasks.forEach(task => {
    // Skip weekday-only tasks on weekends
    if (isWeekend && task.weekdaysOnly) {
      return;
    }
    tasksMap[task.id] = { ...task };
  });
  
  // If existing data, preserve completion status for tasks that still exist
  if (existing) {
    Object.keys(existing.tasks).forEach(taskId => {
      if (tasksMap[taskId] && existing.tasks[taskId].completed) {
        tasksMap[taskId].completed = existing.tasks[taskId].completed;
        tasksMap[taskId].completedAt = existing.tasks[taskId].completedAt;
      }
    });
  }
  
  await saveDailyTasks(today, tasksMap);
}

// Get all dates with data (for progress tracking)
export async function getAllDatesWithData(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const taskKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.DAILY_TASKS));
    return taskKeys.map(key => key.replace(`${STORAGE_KEYS.DAILY_TASKS}_`, ''));
  } catch (error) {
    console.error('Error getting all dates:', error);
    return [];
  }
}

// Water Tracking Functions
export async function logWaterIntake(): Promise<void> {
  try {
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Save last water time
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_WATER_TIME, timestamp);
    
    // Also log to daily water logs
    const today = formatDate(now);
    const key = `${STORAGE_KEYS.WATER_LOGS}_${today}`;
    const existingLogs = await AsyncStorage.getItem(key);
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(timestamp);
    await AsyncStorage.setItem(key, JSON.stringify(logs));
    
    console.log('Water intake logged at:', timestamp);
  } catch (error) {
    console.error('Error logging water intake:', error);
    throw error;
  }
}

export async function getLastWaterTime(): Promise<Date | null> {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_WATER_TIME);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Error getting last water time:', error);
    return null;
  }
}

export async function getTodayWaterCount(): Promise<number> {
  try {
    const today = formatDate(new Date());
    const key = `${STORAGE_KEYS.WATER_LOGS}_${today}`;
    const logs = await AsyncStorage.getItem(key);
    return logs ? JSON.parse(logs).length : 0;
  } catch (error) {
    console.error('Error getting today water count:', error);
    return 0;
  }
}

export async function logWaterSkipped(): Promise<void> {
  try {
    const today = formatDate(new Date());
    const key = `${STORAGE_KEYS.WATER_SKIPPED}_${today}`;
    const existing = await AsyncStorage.getItem(key);
    const skipped = existing ? JSON.parse(existing) : [];
    skipped.push(new Date().toISOString());
    await AsyncStorage.setItem(key, JSON.stringify(skipped));
  } catch (error) {
    console.error('Error logging water skipped:', error);
    throw error;
  }
}

export async function getTodayWaterSkipped(): Promise<number> {
  try {
    const today = formatDate(new Date());
    const key = `${STORAGE_KEYS.WATER_SKIPPED}_${today}`;
    const skipped = await AsyncStorage.getItem(key);
    return skipped ? JSON.parse(skipped).length : 0;
  } catch (error) {
    console.error('Error getting today water skipped:', error);
    return 0;
  }
}

// Custom Tasks Storage
export async function getCustomTasks(date: string): Promise<Task[]> {
  try {
    const key = `${STORAGE_KEYS.CUSTOM_TASKS}_${date}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting custom tasks:', error);
    return [];
  }
}

export async function saveCustomTask(date: string, task: Task): Promise<void> {
  try {
    const customTasks = await getCustomTasks(date);
    customTasks.push(task);
    const key = `${STORAGE_KEYS.CUSTOM_TASKS}_${date}`;
    await AsyncStorage.setItem(key, JSON.stringify(customTasks));
  } catch (error) {
    console.error('Error saving custom task:', error);
    throw error;
  }
}

export async function deleteCustomTask(date: string, taskId: string): Promise<void> {
  try {
    const customTasks = await getCustomTasks(date);
    const filtered = customTasks.filter(t => t.id !== taskId);
    const key = `${STORAGE_KEYS.CUSTOM_TASKS}_${date}`;
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting custom task:', error);
    throw error;
  }
}

// Notification initialization tracking
export async function getNotificationsInitializedDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_INITIALIZED);
  } catch (error) {
    console.error('Error getting notifications initialized date:', error);
    return null;
  }
}

export async function setNotificationsInitializedDate(date: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_INITIALIZED, date);
  } catch (error) {
    console.error('Error setting notifications initialized date:', error);
    throw error;
  }
}

