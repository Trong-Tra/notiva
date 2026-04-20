# Trello Clone - Deployment Guide (For Web Developers)

Since you only know web development, this guide explains everything in web terms.

## What You Built

This is a **React Native** app. Think of it like this:

| Web Concept | Mobile Equivalent |
|-------------|-------------------|
| Browser | **Expo Go** app (free from App Store) |
| `npm run dev` | `npx expo start` |
| Localhost URL | **QR code** that opens the app |
| Build / Deploy | **EAS Build** (Expo's build service) |

## Option 1: Run on Your iPhone (Easiest - No Mac Needed)

This is like "previewing on your phone." Perfect for class demos.

1. **Install Expo Go** on your iPhone from the App Store (it's free)
2. **Start the dev server** on your Mac:
   ```bash
   cd /Users/tron/Private-Project/trello-clone
   npx expo start
   ```
3. **Scan the QR code** with your iPhone camera
4. The app opens inside Expo Go automatically

> **Web analogy:** This is like running `npm run dev` and opening the localhost link on your phone. The app lives on your computer and streams to your phone.

## Option 2: Run on iOS Simulator (Mac Only)

This is like opening your web app in a virtual iPhone on your Mac.

**Prerequisite:** You need **Xcode** fully installed from the App Store.

1. Open the App Store, search "Xcode," and install it (it's large - ~10GB)
2. Open Xcode once to finish installation
3. Run in terminal:
   ```bash
   cd /Users/tron/Private-Project/trello-clone
   npx expo start --ios
   ```
4. The iOS Simulator will open automatically

> **Note:** If you see "Xcode must be fully installed," just open Xcode from Applications and wait for it to finish setup.

## Option 3: Build a Standalone App (For Class Submission)

If your professor wants you to submit an actual `.ipa` file or install it on your phone without Expo Go:

### The Problem
Apple requires a **$99/year Apple Developer Account** to install apps on a real iPhone outside of Expo Go.

### Free Workaround: Build for iOS Simulator
You can create an `.app` file that runs on the iOS Simulator (not a physical phone):

```bash
npm install -g eas-cli
eas build -p ios --profile preview
```

This uses Expo's free cloud build service.

### Alternative: Build for Android (even without an Android phone)
You can build an Android APK that friends with Android phones can install:

```bash
eas build -p android --profile preview
```

The APK will be available for download from Expo's website. This is completely free and doesn't require any Google developer account for testing.

## How to Demo for Class

**Recommended approach:**
1. Record a screen recording of the app working on your iPhone via Expo Go
2. OR demo it live in class by running `npx expo start` and showing it on your iPhone

Most professors accept Expo Go demos for mobile development classes.

## Common Issues

### "Cannot find module" errors
```bash
rm -rf node_modules
npm install
npx expo start -c
```

### App crashes on start
Make sure you have the `babel.config.js` file in your project root.

### Notifications don't work in Expo Go
Local notifications **do work** in Expo Go! But scheduled notifications might be slightly delayed by iOS.

## Quick Start Checklist

- [ ] Open terminal
- [ ] `cd /Users/tron/Private-Project/trello-clone`
- [ ] `npx expo start`
- [ ] Install Expo Go on iPhone
- [ ] Scan QR code
- [ ] App is running!
