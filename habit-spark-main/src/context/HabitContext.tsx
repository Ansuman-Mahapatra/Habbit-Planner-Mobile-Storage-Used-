import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Habit, HabitCompletion } from '@/types/habit';
import { Goal } from '@/types/goal';
import { getToday } from '@/lib/habitUtils';
import { api, initializeAuth } from '@/lib/api';

interface HabitContextType {
  habits: Habit[];
  goals: Goal[];
  completions: HabitCompletion[];
  addHabit: (habit: Habit) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date?: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  unlinkHabitsFromGoal: (goalId: string) => void;
}

const HabitContext = createContext<HabitContextType | null>(null);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      const [{ habits: backendHabits, completions: backendCompletions }, backendGoals] = await Promise.all([
        api.getHabits(),
        api.getGoals()
      ]);
      
      setHabits(backendHabits);
      setCompletions(backendCompletions);
      setGoals(backendGoals);
    };
    init();
  }, []);

  const addHabit = useCallback(async (habit: Habit) => {
    const createdHabit = await api.createHabit(habit);
    setHabits(prev => [...prev, createdHabit]);
  }, []);

  const updateHabit = useCallback(async (habit: Habit) => {
    const updatedHabit = await api.updateHabit(habit);
    setHabits(prev => prev.map(h => h.id === habit.id ? updatedHabit : h));
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    await api.deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
    setCompletions(prev => prev.filter(c => c.habitId !== id));
  }, []);

  const toggleCompletion = useCallback(async (habitId: string, date?: string) => {
    const d = date || getToday();
    await api.toggleCompletion(habitId, d);

    setCompletions(prev => {
      const existing = prev.find(c => c.habitId === habitId && c.date === d);
      if (existing) {
        return prev.map(c => c.habitId === habitId && c.date === d ? { ...c, completed: !c.completed } : c);
      } else {
        return [...prev, { habitId, date: d, completed: true }];
      }
    });
  }, []);

  const addGoal = useCallback(async (goal: Goal) => {
    const created = await api.createGoal(goal);
    setGoals(prev => [...prev, created]);
  }, []);

  const updateGoal = useCallback(async (goal: Goal) => {
    const updated = await api.updateGoal(goal);
    setGoals(prev => prev.map(g => g.id === goal.id ? updated : g));
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await api.deleteGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
    // Also reflect deleted habits in React state
    setHabits(prev => prev.filter(h => h.goalId !== id));
    setCompletions(prev => prev.filter(c => {
      const habit = habits.find(h => h.id === c.habitId);
      return !habit || habit.goalId !== id;
    }));
  }, [habits]);

  const unlinkHabitsFromGoal = useCallback(async (goalId: string) => {
    await api.unlinkHabitsFromGoal(goalId);
    setGoals(prev => prev.filter(g => g.id !== goalId));
    setHabits(prev => prev.map(h => h.goalId === goalId ? { ...h, goalId: null } : h));
  }, []);

  return (
    <HabitContext.Provider value={{
      habits, goals, completions, addHabit, updateHabit, deleteHabit, toggleCompletion, addGoal, updateGoal, deleteGoal, unlinkHabitsFromGoal
    }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error('useHabits must be used within HabitProvider');
  return ctx;
}
