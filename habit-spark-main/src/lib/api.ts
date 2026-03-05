import { Habit, HabitCompletion } from '@/types/habit';
import { Goal } from '@/types/goal';
import { initNotifications, scheduleHabitNotification, cancelHabitNotification, scheduleEndOfDaySummary } from './notifications';
import { getLocalIsoDate } from './habitUtils';

const HABITS_KEY = 'habitflow_habits';
const COMPLETIONS_KEY = 'habitflow_completions';
const GOALS_KEY = 'habitflow_goals';

const readStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

const writeStorage = <T>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage error', error);
  }
};

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const initializeAuth = async () => {
    // App is now 100% offline-first. No cloud migration.
    // Run the notification startup routines every time the app loads.
    initNotifications();
    scheduleEndOfDaySummary();
};

export const api = {
  getHabits: async () => {
    const habits = readStorage<Habit[]>(HABITS_KEY, []);
    const completions = readStorage<HabitCompletion[]>(COMPLETIONS_KEY, []);
    return { habits, completions };
  },

  createHabit: async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const habits = readStorage<Habit[]>(HABITS_KEY, []);
    const newHabit: Habit = { ...habit, id: generateId(), createdAt: getLocalIsoDate() };
    habits.push(newHabit);
    writeStorage(HABITS_KEY, habits);
    scheduleHabitNotification(newHabit);
    return newHabit;
  },

  updateHabit: async (habit: Habit) => {
    const habits = readStorage<Habit[]>(HABITS_KEY, []);
    const index = habits.findIndex(h => h.id === habit.id);
    if (index !== -1) {
      habits[index] = habit;
      writeStorage(HABITS_KEY, habits);
      scheduleHabitNotification(habit);
    }
    return habit;
  },

  deleteHabit: async (id: string) => {
    const habits = readStorage<Habit[]>(HABITS_KEY, []);
    writeStorage(HABITS_KEY, habits.filter(h => h.id !== id));

    const completions = readStorage<HabitCompletion[]>(COMPLETIONS_KEY, []);
    writeStorage(COMPLETIONS_KEY, completions.filter(c => c.habitId !== id));
    
    cancelHabitNotification(id);
  },

  toggleCompletion: async (habitId: string, date: string) => {
    const completions = readStorage<HabitCompletion[]>(COMPLETIONS_KEY, []);
    const index = completions.findIndex(c => c.habitId === habitId && c.date === date);

    if (index !== -1) {
      if (completions[index].completed) completions.splice(index, 1);
      else {
          completions[index].completed = true;
          // User completed the habit! We can cancel its notification for today!
          cancelHabitNotification(habitId);
          // Normally we'd want to re-schedule exactly for tomorrow.. but a daily repeating interval can just tick naturally
      }
    } else {
      completions.push({ habitId, date, completed: true });
      cancelHabitNotification(habitId);
    }

    writeStorage(COMPLETIONS_KEY, completions);
  },

  getGoals: async () => readStorage<Goal[]>(GOALS_KEY, []),

  createGoal: async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const goals = readStorage<Goal[]>(GOALS_KEY, []);
    const newGoal: Goal = { ...goal, id: generateId(), createdAt: getLocalIsoDate() };
    goals.push(newGoal);
    writeStorage(GOALS_KEY, goals);
    return newGoal;
  },

  updateGoal: async (goal: Goal) => {
    const goals = readStorage<Goal[]>(GOALS_KEY, []);
    const index = goals.findIndex(g => g.id === goal.id);
    if (index !== -1) {
      goals[index] = goal;
      writeStorage(GOALS_KEY, goals);
    }
    return goal;
  },

  deleteGoal: async (id: string) => {
    const goals = readStorage<Goal[]>(GOALS_KEY, []);
    writeStorage(GOALS_KEY, goals.filter(g => g.id !== id));
    
    const habits = readStorage<Habit[]>(HABITS_KEY, []);
    const habitsToDelete = habits.filter(h => h.goalId === id);
    
    if (habitsToDelete.length > 0) {
      // Remove the habits entirely
      const updatedHabits = habits.filter(h => h.goalId !== id);
      writeStorage(HABITS_KEY, updatedHabits);
      
      const completions = readStorage<HabitCompletion[]>(COMPLETIONS_KEY, []);
      const habitIdsToDelete = new Set(habitsToDelete.map(h => h.id));
      
      // Remove completions for those deleted habits
      const updatedCompletions = completions.filter(c => !habitIdsToDelete.has(c.habitId));
      writeStorage(COMPLETIONS_KEY, updatedCompletions);
      
      // Cancel notifications for deleted habits
      habitsToDelete.forEach(h => cancelHabitNotification(h.id));
    }
  },

  // Removes goal link from habits but keeps the habits intact
  unlinkHabitsFromGoal: async (goalId: string) => {
    const goals = readStorage<Goal[]>(GOALS_KEY, []);
    writeStorage(GOALS_KEY, goals.filter(g => g.id !== goalId));

    const habits = readStorage<Habit[]>(HABITS_KEY, []);
    const updatedHabits = habits.map(h =>
      h.goalId === goalId ? { ...h, goalId: null } : h
    );
    writeStorage(HABITS_KEY, updatedHabits);
  }
};
