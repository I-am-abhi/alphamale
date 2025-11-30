import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task } from '../../types';
import { dailyTasks, weeklyCreativeTasks } from '../../data/dailyTasks';
import { getDailyTasks, updateTaskCompletion, initializeTodayTasks, saveDailyTasks, getCustomTasks, saveCustomTask, deleteCustomTask } from '../../services/storage';
import { formatDate, getDayName, formatDateWithDay, getDayNameFull, formatTimeWithSeconds } from '../../utils/dateHelpers';
import { getQuoteForDate } from '../../data/quotes';

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Record<string, Task>>({});
  const [completionRate, setCompletionRate] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [quote, setQuote] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [dayName, setDayName] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  useEffect(() => {
    loadTodayData();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(formatTimeWithSeconds(new Date()));
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  const loadTodayData = async () => {
    try {
      const today = formatDate(new Date());
      
      // Initialize tasks if needed
      await initializeTodayTasks(dailyTasks);
      
      // Load today's tasks
      const dailyData = await getDailyTasks(today);
      const tasksMap: Record<string, Task> = {};
      
      if (dailyData) {
        // Use existing tasks but ensure all current tasks are present
        Object.assign(tasksMap, dailyData.tasks);
      }
      
      // Always ensure all daily tasks are present (with latest definitions)
      // Filter out weekday-only tasks on weekends
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      dailyTasks.forEach(task => {
        // Skip weekday-only tasks on weekends
        if (isWeekend && task.weekdaysOnly) {
          // Remove from tasksMap if it exists
          if (tasksMap[task.id]) {
            delete tasksMap[task.id];
          }
          return;
        }
        
        if (!tasksMap[task.id]) {
          tasksMap[task.id] = { ...task };
        } else {
          // Update task definition but preserve completion status
          const existing = tasksMap[task.id];
          tasksMap[task.id] = {
            ...task,
            completed: existing.completed,
            completedAt: existing.completedAt,
          };
        }
      });
      
      // Always add weekly creative tasks for today
      const dayName = getDayName(new Date());
      const creativeTasks = weeklyCreativeTasks[dayName] || [];
      creativeTasks.forEach(task => {
        if (!tasksMap[task.id]) {
          tasksMap[task.id] = { ...task };
        } else {
          // Update task definition but preserve completion status
          const existing = tasksMap[task.id];
          tasksMap[task.id] = {
            ...task,
            completed: existing.completed,
            completedAt: existing.completedAt,
          };
        }
      });
      
      // Load custom tasks for today
      const customTasks = await getCustomTasks(today);
      customTasks.forEach(customTask => {
        tasksMap[customTask.id] = customTask;
      });
      
      // Save updated tasks
      await saveDailyTasks(today, tasksMap);
      
      setTasks(tasksMap);
      calculateCompletionRate(tasksMap);
      
      // Set date and day name (reuse 'now' from above)
      setTodayDate(formatDateWithDay(now));
      setDayName(getDayNameFull(now));
      
      // Get daily quote (rotates based on date)
      setQuote(getQuoteForDate(now));
      
      // Set current time
      setCurrentTime(formatTimeWithSeconds(now));
    } catch (error) {
      console.error('Error loading today data:', error);
    }
  };

  const calculateCompletionRate = (taskList: Record<string, Task>) => {
    const taskArray = Object.values(taskList);
    const completed = taskArray.filter(t => t.completed).length;
    const rate = taskArray.length > 0 ? (completed / taskArray.length) * 100 : 0;
    setCompletionRate(Math.round(rate));
  };

  const toggleTask = async (taskId: string) => {
    try {
      const today = formatDate(new Date());
      const task = tasks[taskId];
      const newCompleted = !task.completed;
      
      await updateTaskCompletion(today, taskId, newCompleted);
      
      const updatedTasks = {
        ...tasks,
        [taskId]: {
          ...task,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : undefined,
        },
      };
      
      setTasks(updatedTasks);
      calculateCompletionRate(updatedTasks);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodayData();
    setRefreshing(false);
  };

  const handleAddCustomTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      const today = formatDate(new Date());
      const taskId = `custom-${Date.now()}`;
      const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      const customTask: Task = {
        id: taskId,
        title: newTaskTitle.trim(),
        time: timeString,
        category: 'evening', // Default category
        completed: false,
        isCustom: true,
      };

      await saveCustomTask(today, customTask);
      
      // Add to current tasks
      const updatedTasks = {
        ...tasks,
        [taskId]: customTask,
      };
      setTasks(updatedTasks);
      calculateCompletionRate(updatedTasks);
      
      // Reset form
      setNewTaskTitle('');
      setSelectedHour(12);
      setSelectedMinute(0);
      setShowAddTaskModal(false);
    } catch (error) {
      console.error('Error adding custom task:', error);
      Alert.alert('Error', 'Failed to add custom task');
    }
  };

  // Generate hour and minute options
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleDeleteCustomTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this custom task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const today = formatDate(new Date());
              await deleteCustomTask(today, taskId);
              
              const updatedTasks = { ...tasks };
              delete updatedTasks[taskId];
              setTasks(updatedTasks);
              calculateCompletionRate(updatedTasks);
            } catch (error) {
              console.error('Error deleting custom task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  // Helper functions
  const getTaskDateTime = (time: string, forToday: boolean = true): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const taskTime = new Date();
    taskTime.setHours(hours, minutes, 0, 0);
    taskTime.setSeconds(0, 0);
    
    // For "past" check, use today's date
    // For "upcoming" check, if task time passed today, consider it for tomorrow
    if (!forToday) {
      const now = new Date();
      if (taskTime < now) {
        taskTime.setDate(taskTime.getDate() + 1);
      }
    }
    
    return taskTime;
  };

  const isTaskPast = (time: string): boolean => {
    const taskTime = getTaskDateTime(time, true); // Use today's date
    const now = new Date();
    return taskTime < now;
  };

  const isTaskUpcoming = (time: string, taskId: string, allTasks: Task[]): boolean => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const taskTime = new Date();
    taskTime.setHours(hours, minutes, 0, 0);
    taskTime.setSeconds(0, 0);
    
    // Only highlight tasks that are TODAY and in the future
    // If task time has passed today, it's not upcoming
    if (taskTime < now) return false;
    
    // Find the next upcoming incomplete tasks (only today's tasks)
    const upcomingTasks = allTasks
      .filter(t => {
        if (t.completed) return false;
        const [tHours, tMinutes] = t.time.split(':').map(Number);
        const tTime = new Date();
        tTime.setHours(tHours, tMinutes, 0, 0);
        tTime.setSeconds(0, 0);
        return tTime >= now; // Only tasks that haven't passed today
      })
      .map(t => {
        const [tHours, tMinutes] = t.time.split(':').map(Number);
        const tTime = new Date();
        tTime.setHours(tHours, tMinutes, 0, 0);
        tTime.setSeconds(0, 0);
        return {
          task: t,
          dateTime: tTime,
        };
      })
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    
    if (upcomingTasks.length === 0) return false;
    
    // Only highlight the single next upcoming task
    const nextTask = upcomingTasks[0];
    return nextTask.task.id === taskId;
  };

  const formatTaskTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getTaskIcon = (taskId: string, category: string, isCustom?: boolean) => {
    // Custom tasks get a unique icon
    if (isCustom) {
      return 'star-circle';
    }
    
    // Task-specific icons for better visual representation
    const taskIcons: Record<string, string> = {
      // Morning routine
      'wake-up': 'weather-sunny',
      'make-bed': 'bed',
      'floor-cleaning': 'broom',
      'warm-water-lemon': 'cup-water',
      'toilet-freshen': 'shower',
      'stretching': 'yoga',
      'gym': 'dumbbell',
      'cold-shower': 'shower',
      'morning-grooming': 'face-man',
      'breakfast': 'food',
      // Commute
      'morning-commute': 'car',
      'evening-commute': 'car',
      // Office
      'office': 'briefcase',
      // Evening routine
      'cardio': 'run',
      'dinner': 'silverware-fork-knife',
      'creative': 'palette',
      'night-grooming': 'face-man',
      'journal': 'book-open-variant',
      'sleep': 'sleep',
      // Weekly creative tasks
      'guitar': 'guitar-electric',
      'review-goals': 'target',
      'art': 'draw',
      'photography': 'camera',
      'videography': 'video',
      'reading': 'book-open-page-variant',
      'career-growth': 'code-tags',
      // Saturday tasks
      'saturday-morning-skill': 'school',
      'saturday-adventure': 'map-marker-path',
      'saturday-social': 'account-group',
      'saturday-creative': 'palette',
      // Sunday tasks
      'sunday-deep-grooming': 'face-man',
      'sunday-meal-prep': 'chef-hat',
      'sunday-planning': 'calendar-check',
      'sunday-reflection': 'meditation',
      'sunday-light-activity': 'walk',
      'sunday-evening-prep': 'briefcase-check',
    };
    
    // If task has specific icon, use it
    if (taskIcons[taskId]) {
      return taskIcons[taskId];
    }
    
    // Fallback to category-based icons
    const categoryIcons: Record<string, string> = {
      morning: 'weather-sunny',
      food: 'food',
      commute: 'car',
      office: 'briefcase',
      evening: 'moon-waning-crescent',
      grooming: 'face-man',
      behavior: 'brain',
    };
    
    return categoryIcons[category] || 'circle';
  };

  // Sort tasks by time (sequentially) - exclude water reminder task and filter by day
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  const sortedTasks = Object.values(tasks)
    .filter(task => {
      // Exclude water reminder from main list
      if (task.id === 'water-reminder') return false;
      // Exclude weekday-only tasks on weekends
      if (isWeekend && task.weekdaysOnly) return false;
      return true;
    })
    .sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(':').map(Number);
      const [bHours, bMinutes] = b.time.split(':').map(Number);
      const aTime = aHours * 60 + aMinutes;
      const bTime = bHours * 60 + bMinutes;
      return aTime - bTime;
    });

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const renderTask = (task: Task) => {
    const isPast = isTaskPast(task.time);
    const isUpcoming = isTaskUpcoming(task.time, task.id, sortedTasks);
    const isExpanded = expandedTasks.has(task.id);
    const hasExplanation = !!task.explanation;
    const isCustom = task.isCustom || false;
    
    return (
      <View key={task.id} style={styles.taskWrapper}>
        <TouchableOpacity
          style={[
            styles.taskItem,
            task.completed && styles.taskCompleted,
            isPast && !task.completed && styles.taskPast,
            isUpcoming && !task.completed && styles.taskUpcoming,
            isCustom && styles.taskCustom,
          ]}
          onPress={() => toggleTask(task.id)}
          onLongPress={() => isCustom && handleDeleteCustomTask(task.id)}
          activeOpacity={0.7}
        >
          <View style={styles.taskContent}>
            <View style={[styles.taskIconContainer, task.completed && styles.taskIconContainerCompleted]}>
                    <MaterialCommunityIcons
                      name={task.completed ? 'check-circle' : getTaskIcon(task.id, task.category, task.isCustom)}
                      size={28}
                      color={task.completed ? '#4CAF50' : isUpcoming ? '#FFD700' : isCustom ? '#9C27B0' : '#666666'}
                    />
            </View>
            <View style={styles.taskTextContainer}>
              <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                {task.title}
              </Text>
              <View style={styles.taskTimeContainer}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#888888" />
                <Text style={[styles.taskTime, isUpcoming && styles.taskTimeUpcoming]}>
                  {formatTaskTime(task.time)}
                </Text>
              </View>
            </View>
            <View style={styles.taskActions}>
              {hasExplanation && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleExpand(task.id);
                  }}
                  style={styles.expandButton}
                >
                  <MaterialCommunityIcons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#888888"
                  />
                </TouchableOpacity>
              )}
              {task.completed && (
                <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        {hasExplanation && isExpanded && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationText}>{task.explanation}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.dateTimeSection}>
            <View style={styles.dayContainer}>
              <Text style={styles.dayName}>{dayName}</Text>
            </View>
            <Text style={styles.dateText}>{todayDate}</Text>
            <View style={styles.timeBadge}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#4CAF50" />
              <Text style={styles.currentTime}>{currentTime}</Text>
            </View>
          </View>
          <View style={styles.progressSection}>
            <View style={styles.completionBadge}>
              <Text style={styles.completionRate}>{completionRate}%</Text>
              <Text style={styles.completionLabel}>Complete</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Motivational Quote */}
      {quote && (
        <View style={styles.quoteContainer}>
          <MaterialCommunityIcons name="format-quote-open" size={24} color="#4CAF50" style={styles.quoteIcon} />
          <Text style={styles.quote}>"{quote}"</Text>
        </View>
      )}

      {/* Tasks Sequentially by Time */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="calendar-clock" size={24} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddTaskModal(true)}
          >
            <MaterialCommunityIcons name="plus-circle" size={28} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        {sortedTasks.length > 0 ? (
          sortedTasks.map(renderTask)
        ) : (
          <Text style={styles.emptyText}>No tasks scheduled for today</Text>
        )}
      </View>

      {/* Add Custom Task Modal */}
      <Modal
        visible={showAddTaskModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Task</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddTaskModal(false);
                  setNewTaskTitle('');
                  setSelectedHour(12);
                  setSelectedMinute(0);
                }}
              >
                <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Task Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter task title"
                placeholderTextColor="#666666"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                autoFocus
              />

              <Text style={styles.inputLabel}>Time</Text>
              <View style={styles.timePickerContainer}>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Hour</Text>
                  <ScrollView
                    style={styles.pickerScrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.pickerContent}
                  >
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.pickerItem,
                          selectedHour === hour && styles.pickerItemSelected,
                        ]}
                        onPress={() => setSelectedHour(hour)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedHour === hour && styles.pickerItemTextSelected,
                          ]}
                        >
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Minute</Text>
                  <ScrollView
                    style={styles.pickerScrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.pickerContent}
                  >
                    {minutes.map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.pickerItem,
                          selectedMinute === minute && styles.pickerItemSelected,
                        ]}
                        onPress={() => setSelectedMinute(minute)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedMinute === minute && styles.pickerItemTextSelected,
                          ]}
                        >
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <View style={styles.selectedTimeDisplay}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#4CAF50" />
                <Text style={styles.selectedTimeText}>
                  Selected: {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowAddTaskModal(false);
                    setNewTaskTitle('');
                    setSelectedHour(12);
                    setSelectedMinute(0);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonAdd]}
                  onPress={handleAddCustomTask}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextAdd]}>Add Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 24,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateTimeSection: {
    flex: 1,
  },
  dayContainer: {
    marginBottom: 8,
  },
  dayName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  currentTime: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 8,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  progressSection: {
    alignItems: 'flex-end',
  },
  completionBadge: {
    backgroundColor: '#1a2e1a',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    minWidth: 80,
  },
  completionRate: {
    fontSize: 28,
    color: '#4CAF50',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  completionLabel: {
    fontSize: 11,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteContainer: {
    margin: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  quoteIcon: {
    marginBottom: 8,
    alignSelf: 'center',
  },
  quote: {
    fontSize: 17,
    fontStyle: 'italic',
    color: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  addButton: {
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  taskWrapper: {
    marginBottom: 10,
  },
  taskItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  taskCompleted: {
    backgroundColor: '#1a2e1a',
    borderColor: '#4CAF50',
    opacity: 0.8,
  },
  taskPast: {
    borderColor: '#444444',
    opacity: 0.6,
  },
  taskUpcoming: {
    borderColor: '#FFD700',
    backgroundColor: '#2a2a1a',
    shadowColor: '#FFD700',
    shadowOpacity: 0.2,
  },
  taskCustom: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskIconContainerCompleted: {
    backgroundColor: '#1a4a1a',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 17,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  taskTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 13,
    color: '#888888',
    marginLeft: 6,
    fontWeight: '500',
  },
  taskTimeUpcoming: {
    color: '#FFD700',
    fontWeight: '600',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    padding: 4,
    marginRight: 4,
  },
  explanationContainer: {
    backgroundColor: '#151515',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    marginLeft: 4,
    marginRight: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  explanationText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 14,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  modalButtonAdd: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalButtonTextAdd: {
    color: '#000000',
  },
  timePickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  pickerScrollView: {
    maxHeight: 200,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  pickerContent: {
    paddingVertical: 10,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: '#4CAF50',
  },
  pickerItemText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  selectedTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1a2e1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedTimeText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
});

