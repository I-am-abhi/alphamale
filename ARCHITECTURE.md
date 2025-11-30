# 🏗️ Alpha Male App - Architecture & Technology Stack

## 📱 Technology Stack Decision

### **Chosen: React Native + Expo**

**Why React Native + Expo?**
- ✅ **Easy APK building** - Can build APK without Play Store
- ✅ **Cross-platform** - Works on Android (and iOS if needed later)
- ✅ **Rich ecosystem** - Tons of libraries for notifications, storage, UI
- ✅ **Fast development** - Hot reload, easy debugging
- ✅ **Native features** - Access to notifications, local storage, device features
- ✅ **No Play Store needed** - Can build standalone APK

**Alternative considered: Flutter**
- More performant but steeper learning curve
- React Native is more accessible and has better JS ecosystem

---

## 🎯 Core Features & Requirements

### **Must-Have Features:**
1. **Daily Task Checklist** - Tick off items as you complete them
2. **Time-based Notifications** - Remind user when it's time for activities
3. **Workout Tracker** - Track exercises, sets, reps
4. **Progress Tracking** - Weekly/monthly progress visualization
5. **Motivational UI** - Dark theme, inspiring quotes, progress animations
6. **Offline-first** - Works without internet (local storage)
7. **Habit Streaks** - Visual streak counters
8. **Journal** - Daily reflection space

### **Nice-to-Have Features:**
- Statistics dashboard
- Photo uploads for progress
- Export data
- Widget for home screen
- Customizable reminders

---

## 📐 App Architecture

### **Tech Stack Breakdown:**

```
Frontend Framework: React Native (Expo)
State Management: React Context API + AsyncStorage
Notifications: expo-notifications
Storage: AsyncStorage (local) + SQLite (optional for complex queries)
UI Components: React Native Paper / NativeBase
Navigation: React Navigation
Date/Time: date-fns
Icons: @expo/vector-icons
```

### **Project Structure:**

```
alphamale/
├── app/                    # Expo Router (navigation)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Today's tasks (home)
│   │   ├── workout.tsx    # Workout tracker
│   │   ├── progress.tsx   # Progress dashboard
│   │   └── journal.tsx    # Daily journal
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── TaskItem.tsx       # Checkbox task component
│   ├── WorkoutCard.tsx    # Workout exercise card
│   ├── ProgressChart.tsx  # Progress visualization
│   ├── MotivationalQuote.tsx
│   └── NotificationBadge.tsx
├── context/              # State management
│   ├── TaskContext.tsx   # Task state & actions
│   ├── WorkoutContext.tsx
│   └── ProgressContext.tsx
├── services/             # Business logic
│   ├── notifications.ts  # Notification scheduling
│   ├── storage.ts        # Local storage operations
│   └── scheduler.ts      # Task scheduling logic
├── data/                 # Static data
│   ├── dailyTasks.ts     # Daily routine tasks
│   ├── workouts.ts       # Workout plans
│   └── quotes.ts         # Motivational quotes
├── utils/                # Helper functions
│   ├── dateHelpers.ts
│   └── validators.ts
├── types/                # TypeScript types
│   └── index.ts
├── assets/               # Images, fonts
│   ├── images/
│   └── fonts/
├── app.json              # Expo config
├── package.json
└── tsconfig.json
```

---

## 🔔 Notification System

### **How Notifications Work:**

1. **Scheduled Notifications:**
   - Set up recurring notifications for daily tasks
   - Example: "6:30 AM - Wake up, make bed, drink detox water"
   - Example: "6:50 AM - Time for GYM!"

2. **Notification Types:**
   - **Time-based reminders** - "It's 6:30 AM, time to wake up!"
   - **Task completion prompts** - "Did you complete your morning routine?"
   - **Motivational messages** - "Day 15 - You're becoming unstoppable!"
   - **Streak reminders** - "Don't break your 7-day streak!"

3. **Implementation:**
   - Use `expo-notifications` for local notifications
   - Schedule notifications on app start
   - Cancel/reschedule when tasks are completed early
   - Allow user to customize notification times

---

## 💾 Data Storage Strategy

### **Local Storage (AsyncStorage):**
- Daily task completions
- Workout logs
- Journal entries
- User preferences
- Streak counters
- Progress data

### **Data Structure:**

```typescript
// Daily Task Completion
{
  date: "2025-10-26",
  tasks: {
    "wake-up": { completed: true, completedAt: "2025-10-26T06:30:00" },
    "gym": { completed: true, completedAt: "2025-10-26T07:00:00" },
    // ...
  }
}

// Workout Log
{
  date: "2025-10-26",
  workoutType: "chest-triceps-core",
  exercises: [
    {
      name: "Flat Barbell Bench Press",
      sets: [
        { set: 1, reps: 10, weight: null },
        { set: 2, reps: 9, weight: null }
      ]
    }
  ]
}

// Progress
{
  currentDay: 15,
  startDate: "2025-10-11",
  streaks: {
    gym: 12,
    cardio: 15,
    detoxWater: 14
  }
}
```

---

## 🎨 UI/UX Design Principles

### **Design Philosophy:**
- **Dark theme** - Easy on eyes, modern, masculine
- **Minimalist** - Clean, focused, no clutter
- **Motivational** - Inspiring quotes, progress visuals
- **Fast** - Instant feedback, smooth animations
- **Clear** - Large touch targets, readable text

### **Key Screens:**

1. **Home Screen (Today's Tasks)**
   - Current day counter (Day X of 90)
   - Today's tasks with checkboxes
   - Motivational quote
   - Quick stats (streaks, completion %)

2. **Workout Screen**
   - Current workout plan (based on day of week)
   - Exercise list with sets/reps
   - Check off exercises as you complete
   - Timer for rest periods

3. **Progress Screen**
   - Weekly/monthly charts
   - Streak counters
   - Completion percentages
   - Transformation timeline

4. **Journal Screen**
   - Daily reflection prompts
   - Gratitude list
   - Notes section
   - Previous entries

---

## 🔄 App Flow

### **First Launch:**
1. Welcome screen
2. Set start date
3. Request notification permissions
4. Schedule all notifications
5. Show onboarding tutorial

### **Daily Flow:**
1. User opens app
2. Sees today's tasks
3. Receives notifications at scheduled times
4. Ticks off tasks as completed
5. App tracks progress automatically
6. Motivational messages appear

### **Weekly Flow:**
1. Sunday: Reset day reminder
2. Weekly progress summary
3. Next week's goals preview

---

## 📦 Building APK (Without Play Store)

### **Using Expo:**

1. **Development Build:**
   ```bash
   npx expo run:android
   ```

2. **Production APK:**
   ```bash
   eas build --platform android --profile production
   ```
   OR
   ```bash
   npx expo build:android
   ```

3. **Install APK:**
   - Download APK file
   - Enable "Install from unknown sources" on Android
   - Install APK directly

### **Alternative: React Native CLI**
- More control but more setup
- Can build APK with `./gradlew assembleRelease`

---

## 🚀 Development Roadmap

### **Phase 1: MVP (Week 1)**
- [ ] Project setup (Expo + TypeScript)
- [ ] Basic navigation
- [ ] Daily tasks screen with checkboxes
- [ ] Local storage for task completion
- [ ] Basic notifications

### **Phase 2: Core Features (Week 2)**
- [ ] Workout tracker
- [ ] Progress tracking
- [ ] Journal screen
- [ ] Streak counters
- [ ] Motivational quotes

### **Phase 3: Polish (Week 3)**
- [ ] Beautiful UI/animations
- [ ] Statistics dashboard
- [ ] Notification customization
- [ ] Data export
- [ ] Testing & bug fixes

### **Phase 4: Advanced (Future)**
- [ ] Widget support
- [ ] Photo progress tracking
- [ ] Social sharing
- [ ] Cloud backup (optional)

---

## 🔐 Security & Privacy

- **No cloud storage** - Everything stays on device
- **No tracking** - No analytics, no data collection
- **Local only** - Complete privacy
- **Export option** - User can export their data anytime

---

## 📱 Device Requirements

- **Android 6.0+** (API level 23+)
- **Storage:** ~50MB
- **Permissions:**
  - Notifications (required)
  - Storage (optional, for future features)

---

## 🛠️ Development Setup

### **Prerequisites:**
- Node.js 18+
- npm or yarn
- Android Studio (for Android emulator)
- Physical Android device (for testing)

### **Installation:**
```bash
cd alphamale
npm install
npx expo start
```

### **Run on Device:**
- Install Expo Go app on Android
- Scan QR code from terminal
- OR build APK and install directly

---

## 📝 Next Steps

1. ✅ Set up Expo project
2. ✅ Install dependencies
3. ✅ Create basic navigation
4. ✅ Build home screen with tasks
5. ✅ Implement notifications
6. ✅ Add workout tracker
7. ✅ Build progress dashboard
8. ✅ Polish UI/UX
9. ✅ Build APK
10. ✅ Test on device

---

**Let's build something that transforms you. 🐺**


