# Debugging App Crash on Android

## Steps to Debug

### 1. Check Logcat Logs
Connect your Android device via USB and run:
```bash
adb logcat | grep -i "alphamale\|react\|error\|exception"
```

### 2. Check for Common Issues

**AsyncStorage Issues:**
- Make sure AsyncStorage is properly initialized
- Check if storage permissions are granted

**Notification Issues:**
- The app now has better error handling for notifications
- Notifications won't crash the app if they fail

**Missing Dependencies:**
- All dependencies should be bundled in the APK
- Check if any native modules are missing

### 3. Test in Development Mode First

Before building APK, test in Expo Go:
```bash
npm start
```

### 4. Common Crash Causes Fixed

✅ Added Error Boundary to catch React errors
✅ Added try-catch around all async operations
✅ Delayed initialization to prevent race conditions
✅ Better error handling for notifications
✅ Non-blocking error handling for storage

### 5. If Still Crashing

Check the logcat output for:
- JavaScript errors
- Native module errors
- Permission errors
- Memory issues

## Next Build

The updated code with error boundaries should prevent most crashes. Rebuild the APK and test again.

