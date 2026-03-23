# 📱 Attire Planner - Mobile App Guide

Your Attire Planner is now a native iOS & Android mobile app using Capacitor!

## 🛠️ Project Structure

```
attire-planner/
├── src/                      # Angular source code
│   └── app/
├── dist/                      # Built web files
├── ios/                       # iOS native project (Xcode)
├── android/                   # Android native project (Android Studio)
├── capacitor.config.ts       # Capacitor configuration
└── package.json
```

## 🚀 Building & Running

### 1. Build the Web Assets (Always do this first!)

```bash
npm run build
```

This creates optimized files in `dist/attire-planner/browser` that get bundled into the native apps.

### 2. Sync Web Assets to Native Projects

After building, sync the web assets:

```bash
npx cap sync
```

Or for a specific platform:
```bash
npx cap sync ios
npx cap sync android
```

### 3. Run on iOS (macOS required)

```bash
npx cap open ios
```

This opens Xcode. Then:
1. Select a simulator or device
2. Click the Play button to build and run
3. Or use keyboard shortcut: `Cmd + R`

**Requirements:**
- macOS
- Xcode installed
- iOS simulator or physical iPhone/iPad

### 4. Run on Android (Windows/Mac/Linux)

```bash
npx cap open android
```

This opens Android Studio. Then:
1. Select an emulator or connected device
2. Click the Play button to build and run
3. Or use keyboard shortcut: `Shift + F10`

**Requirements:**
- Android Studio installed
- Android SDK (API 24+)
- Emulator or physical Android device

## 📝 Development Workflow

### For Quick Web Testing
```bash
npm start
```
Runs the Angular dev server at `http://localhost:4200`

### For Mobile Testing
1. Make changes to your Angular code
2. Build: `npm run build`
3. Sync: `npx cap sync`
4. Rebuild in Xcode/Android Studio
5. Run on device/simulator

## 🔨 Updating Native Code

If you need to modify native iOS/Android code:

```bash
# iOS: Edit files in ios/ directory, then open Xcode
npx cap open ios

# Android: Edit files in android/ directory, then open Android Studio
npx cap open android
```

## 📦 Package Scripts

Add these to your `package.json` for convenience:

```json
{
  "scripts": {
    "build:mobile": "npm run build && npx cap sync",
    "open:ios": "npm run build && npx cap sync ios && npx cap open ios",
    "open:android": "npm run build && npx cap sync android && npx cap open android"
  }
}
```

Then you can just run:
```bash
npm run open:ios
npm run open:android
```

## 🔌 Native Plugins

You can add Capacitor plugins for device features:

```bash
# Example: Camera plugin
npm install @capacitor/camera
npx cap sync

# Then use in your Angular code:
import { Camera } from '@capacitor/camera';

const photo = await Camera.getPhoto({
  quality: 90,
  allowEditing: true,
  resultType: CameraResultType.Uri
});
```

Available plugins:
- `@capacitor/camera` - Camera/photos
- `@capacitor/filesystem` - File storage
- `@capacitor/geolocation` - GPS location
- `@capacitor/storage` - Local data storage
- `@capacitor/network` - Network status
- `@capacitor/share` - Share files/links
- And many more on [Capacitor Plugin Registry](https://capacitorjs.com/docs/plugins)

## ⚙️ Capacitor Configuration

Edit `capacitor.config.ts` to customize:

```typescript
const config: CapacitorConfig = {
  appId: 'com.attireplanner.app',        // Bundle ID
  appName: 'Attire Planner',             // App name
  webDir: 'dist/attire-planner/browser', // Web assets location
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInsetAdjustmentBehavior: 'never'
  }
};
```

## 🐛 Troubleshooting

### Build fails after code changes
```bash
npm run build
npx cap sync
```

### iOS simulator won't start
```bash
# Reset iOS simulator
xcrun simctl erase all
npx cap open ios
```

### Android emulator issues
- Make sure Android SDK is installed via Android Studio
- Create a virtual device: Tools > AVD Manager

### Web assets not updating
```bash
rm -rf dist/
npm run build
npx cap sync
```

## 📱 Creating Release Builds

### iOS Release
1. In Xcode: Product > Scheme > Edit Scheme
2. Set to Release build
3. Product > Archive
4. Use Organizer to upload to App Store

### Android Release
1. In Android Studio: Build > Generate Signed Bundle/APK
2. Create signing key
3. Upload to Google Play Console

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [iOS Development Guide](https://developer.apple.com/develop/)
- [Android Development Guide](https://developer.android.com/develop)

## 💡 Tips

- Always build web assets before syncing to native
- Use `npx cap update` to update Capacitor platforms
- Test on physical devices for real performance
- Use browser dev tools: `right-click > Inspect` in web view
- Check console logs: Xcode/Android Studio logcat

Happy coding! 🎨✨
