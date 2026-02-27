# HabitFlow Planner

A full-stack, cross-platform Habit Tracking application built with the MERN stack (MongoDB, Express, React (Vite), Node.js) and wrapped into a native Android app using Capacitor.

## Architecture

This project is split into two primary folders:

1. **`habit-spark-main`** (Frontend & Mobile App): The user interface built with React, Vite, and Tailwind CSS. It connects to the mobile hardware natively using Capacitor and Android Studio.
2. **`habit-planner-backend`** (Backend Server): The Node.js Express API that connects to MongoDB. It is fully deployed to Render, providing a live cloud-database connection.

## Key Features

- **Cloud Synchronization**: Create habits on your phone, and they are instantly synced and stored in MongoDB securely through the live Render deployment.
- **Native Android APK Integration**: The application compiles straight into `.apk` installer files natively, giving it access to phone hardware, safe-area inserts, and full-screen displays.
- **Smart Mobile Sidebars**: Responsive hamburger-navigation sliding drawer menus with blur backdrops and dynamic screen sizing for cell phones.
- **Real-Time Statistics**: Live visualizations of your current completion rates, streaks, and overall tracked activity.

## Important Commands

To manage and edit the project, navigate into the respective directories. For detailed instructions on both components, check their individual `README.md` files:

- [Backend Instructions (habit-planner-backend)](./habit-planner-backend/README.md)
- [Frontend/Android Instructions (habit-spark-main)](./habit-spark-main/README.md)
