# Android APK Build Instructions

## Prerequisites
1. EAS account (free tier works)
2. Icon file in `assets/icon.png` ✅ (Already done)

## Build Steps

### 1. Login to EAS (if not already logged in)
```bash
cd "/Users/abhisekh/Documents/Alpha Male/alphamale"
npx eas-cli login
```
This will open a browser to authenticate with your Expo account.

### 2. Build the APK
```bash
npx eas-cli build --platform android --profile production
```

Or use the npm script:
```bash
npm run build:android
```

### 3. Download the APK
- The build will run on Expo's servers (takes 10-20 minutes)
- You'll get a download link when it's complete
- Download the APK file
- Transfer it to your Android phone
- Install it (you may need to enable "Install from unknown sources")

## Build Configuration

The `eas.json` file is configured to build an APK (not AAB) which can be installed directly without Google Play Store.

## Notes
- First build may take longer (20-30 minutes)
- Subsequent builds are faster (10-15 minutes)
- The APK will be around 30-50 MB
- You can install it directly on any Android device

