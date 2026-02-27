# HabitFlow — Mobile Habit Planner

A fully **offline-first**, cross-platform Habit & Goal tracking application built with **React + Vite + TypeScript**, wrapped into a native Android app using **Capacitor**. No backend. No database. No internet required. Everything is stored securely on your device using **mobile local storage**.

---

## 🚀 Tech Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| UI Framework  | React 18 + TypeScript               |
| Build Tool    | Vite                                |
| Styling       | Tailwind CSS + shadcn/ui            |
| Native Mobile | Capacitor (Android)                 |
| Storage       | Device Local Storage (100% offline) |
| Notifications | @capacitor/local-notifications      |
| Charts        | Recharts                            |

---

## ✨ Features

### 📅 Today View

- Shows only habits scheduled **strictly for today** (permanent routines + active goal habits)
- Never shows future habits — only what's relevant right now
- **Overdue section** highlights any missed habits from the past 7 days
- Live progress bar showing how many habits are done today

### 📋 Habits

- Create **Permanent** (ongoing) or **Temporary** (date-bound) habits
- Assign habits to Goals — enforces that habit end date cannot exceed goal end date
- Categories: Health, Mind, Work, Lifestyle, Social
- Frequencies: Daily, Weekly, Monthly, Times per Month, Custom interval
- Set reminder times for local push notifications
- Full habit name displayed — no truncation
- Delete habits directly from the edit modal

### 🎯 Goals

- Create goals with optional start/end date timelines
- Attach multiple habits to a single goal
- When deleting a goal, a **confirmation popup** asks:
  - 🗑️ **Yes** — Delete the goal AND all linked habits
  - 🔓 **No** — Delete the goal only; linked habits are kept and unlinked
- View all linked habits with completion rates directly on each goal card

### 📊 Dashboard

- Last 7 days bar chart
- Category breakdown pie chart
- Monthly trend area chart
- Yearly overview line chart
- 365-day activity heatmap

### 💡 Insights

- Best performing & needs-attention habit highlights
- Streak leaderboard
- Habit health scores (7d rate + 30d rate + streak)

### ⚙️ Settings

- Update your **Name** and **Age** — stored locally on your device

### 🔔 Notifications

- Permission is only requested when you set a reminder on a habit (not at startup)
- End-of-day summary notification at 9:00 PM (if permission was granted)

---

## 📁 Project Structure

```
Habbit Planner/
└── habit-spark-main/       ← The entire app lives here
    ├── src/
    │   ├── pages/          ← Today, Habits, Goals, Dashboard, Insights, Settings
    │   ├── components/     ← Layout, AppSidebar, ReminderBanner, UI components
    │   ├── context/        ← HabitContext (React state + localStorage sync)
    │   ├── lib/            ← api.ts, habitUtils.ts, notifications.ts
    │   └── types/          ← Habit and Goal TypeScript interfaces
    ├── android/            ← Capacitor Android native project
    └── capacitor.config.ts
```

---

## 🏗️ Getting Started

### Prerequisites

- Node.js 18+
- Android Studio (for building the APK)

### Install & Run (Web Dev)

```bash
cd habit-spark-main
npm install
npm run dev
```

### Build & Sync to Android

```bash
npm run build
npx cap sync android
```

Then open `habit-spark-main/android` in Android Studio and run on a device or emulator.

---

## 💾 Data Storage

All data is stored **100% locally** on the device using the browser's `localStorage` API (persisted natively through Capacitor's WebView):

| Key                     | Contents              |
| ----------------------- | --------------------- |
| `habitflow_habits`      | All habit records     |
| `habitflow_completions` | Daily completion logs |
| `habitflow_goals`       | All goal records      |
| `habitflow_profile`     | User name & age       |

No accounts. No cloud. No data leaves your device.

---

## 📱 Android APK

To generate a release APK, open the `android/` folder in Android Studio, connect a device or use an emulator, and click **Run**.

---

_Built with ❤️ by Ansuman Mahapatra_
