// Core Types for Alpha Male App

export interface Task {
  id: string;
  title: string;
  time: string;
  category: 'morning' | 'commute' | 'office' | 'evening' | 'grooming' | 'food' | 'behavior';
  completed: boolean;
  completedAt?: string;
  explanation?: string; // Detailed explanation for dropdown
  weekdaysOnly?: boolean; // Only show on Monday-Friday
  isCustom?: boolean; // User-created custom task
}

export interface DailyTasks {
  date: string;
  tasks: Record<string, Task>;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  muscleGroup: string;
  completed: boolean;
  setsCompleted?: Array<{
    set: number;
    reps?: number;
    weight?: number;
  }>;
}

export interface Workout {
  id: string;
  name: string;
  day: number; // 1-6 (Monday-Saturday)
  exercises: WorkoutExercise[];
}

export interface JournalEntry {
  date: string;
  whatWentWell: string;
  whatToImprove: string;
  gratitude: string[];
  tomorrowFocus: string;
}

export interface Progress {
  currentDay: number;
  startDate: string;
  totalDays: number;
  streaks: {
    gym: number;
    cardio: number;
    detoxWater: number;
    grooming: number;
  };
  completionRate: number;
}

export interface NotificationSchedule {
  id: string;
  taskId: string;
  time: string; // HH:mm format
  message: string;
  enabled: boolean;
}

