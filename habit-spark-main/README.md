# HabitFlow Frontend & Mobile App

This directory holds the React (Vite) User Interface and houses the Capacitor-wrapped Native Android application source code.

## Tech Stack

- **Framework**: React.js with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Mobile Container**: Capacitor (Ionic) + Android Studio

## The API Connection

The frontend communicates directly with the live server. Inside `src/lib/api.ts`, the connection is hardcoded to:
`https://habit-planner.onrender.com/api`

## How to run locally (Web Browser)

1. In the terminal, run `npm install`
2. Run `npm run dev`
3. Click the localhost port link to see the web version. Hot-reloading is fully enabled for any UI tweaks in React.

## How to Compile Physics Mobile App (.APK)

Any time you make a change in the React `.tsx` files that you want to see permanently on your phone, follow these steps exactly:

1. **Build the Production code:**

   ```bash
   npm run build
   ```

   _This minifies your React frontend into an optimized `dist/` folder._

2. **Sync the Native Android Project:**

   ```bash
   npx cap sync android
   ```

   _This commands Capacitor to inject your newest `dist/` changes into the native Android Studio source files._

3. **Generate the Installable APK:**
   Using the Command Line (while inside this folder):

   ```bash
   cd android
   .\gradlew assembleDebug
   ```

   _(Note: The terminal command requires Java JDK 17 to be installed on your machine)._

   **Alternative UI Method:**
   1. Open **Android Studio**
   2. Open the `android` folder in this project mapping.
   3. Hit **Build > Build Bundle(s) / APK(s) > Build APK(s)** in the top menu.

The final installer file will be outputted to:
`android\app\build\outputs\apk\debug\app-debug.apk`

Send this file to any Android device using Email, Google Drive, or Web Chat apps to natively install your custom application!
