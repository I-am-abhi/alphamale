# 🐺 Alpha Male - 90-Day Transformation App

A highly motivating, easy-to-use mobile app to track your 90-day transformation journey. Built with React Native and Expo.

## ✨ Features

- ✅ **Daily Task Checklist** - Tick off items as you complete them
- 🔔 **Time-based Notifications** - Get reminded when it's time for activities
- 🏋️ **Workout Tracker** - Track exercises, sets, and reps
- 📊 **Progress Dashboard** - Visualize your transformation progress
- 📝 **Daily Journal** - Reflect on your day
- 🔥 **Streak Tracking** - Track your consistency
- 💪 **Motivational UI** - Dark theme with inspiring quotes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Android Studio (for Android emulator) OR physical Android device
- Expo CLI (will be installed automatically)

### Installation

1. **Install dependencies:**
   ```bash
   cd alphamale
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on Android:**
   - **Option A (Expo Go - Quick Testing):**
     - Install "Expo Go" app from Play Store on your Android device
     - Scan the QR code from the terminal
   
   - **Option B (Development Build):**
     ```bash
     npm run android
     ```
     This will open Android emulator or install on connected device

## 📱 Building APK (Without Play Store)

### Method 1: Using EAS Build (Recommended)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure build:**
   ```bash
   eas build:configure
   ```

4. **Build APK:**
   ```bash
   eas build --platform android --profile production
   ```

5. **Download APK:**
   - After build completes, download the APK from the provided link
   - Transfer to your Android device
   - Enable "Install from unknown sources" in Android settings
   - Install the APK

### Method 2: Local Build (Advanced)

1. **Generate Android project:**
   ```bash
   npx expo prebuild
   ```

2. **Build APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **Find APK:**
   - APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## 📂 Project Structure

```
alphamale/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Today's tasks (home)
│   │   ├── workout.tsx    # Workout tracker
│   │   ├── progress.tsx   # Progress dashboard
│   │   └── journal.tsx    # Daily journal
│   └── _layout.tsx        # Root layout
├── data/                  # Static data
│   ├── dailyTasks.ts      # Daily routine tasks
│   ├── workouts.ts        # Workout plans
│   └── quotes.ts          # Motivational quotes
├── services/              # Business logic
│   ├── notifications.ts   # Notification scheduling
│   └── storage.ts         # Local storage
├── types/                 # TypeScript types
├── utils/                 # Helper functions
└── package.json
```

## 🔔 Notification Setup

The app automatically requests notification permissions on first launch and schedules reminders for:
- Wake up (6:30 AM)
- Gym time (6:50 AM)
- Cardio (6:45 PM)
- And all other daily tasks

**Note:** Make sure to allow notification permissions when prompted.

## 💾 Data Storage

All data is stored locally on your device using AsyncStorage. No cloud sync, complete privacy.

- Daily task completions
- Workout logs
- Journal entries
- Progress tracking
- Streak counters

## 🎨 Customization

### Modify Daily Tasks

Edit `data/dailyTasks.ts` to customize your daily routine.

### Modify Workouts

Edit `data/workouts.ts` to customize your workout split.

### Modify Quotes

Edit `data/quotes.ts` to add your own motivational quotes.

## 🐛 Troubleshooting

### Notifications not working?

1. Check notification permissions in Android settings
2. Make sure app is not in battery optimization mode
3. Restart the app

### Build errors?

1. Clear cache: `npx expo start -c`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Clear Expo cache: `expo start -c`

### App crashes on startup?

1. Check that all dependencies are installed: `npm install`
2. Make sure you're using Node.js 18+
3. Check console for error messages

## 📝 Development Notes

- **First Launch:** App will set today as start date automatically
- **Notifications:** Scheduled daily at task times
- **Storage:** All data persists locally
- **Offline:** App works completely offline

## 🎯 Next Steps

1. Install dependencies: `npm install`
2. Start development: `npm start`
3. Test on device or emulator
4. Build APK when ready: `eas build --platform android`

## 📄 License

Private - Personal use only

---

**Stay disciplined. Stay focused. Transform. 🐺**
