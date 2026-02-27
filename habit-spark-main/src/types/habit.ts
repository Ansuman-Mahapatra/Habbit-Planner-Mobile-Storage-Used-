export type HabitCategory = 'health' | 'mind' | 'work' | 'lifestyle' | 'social';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'times_per_month';
export type HabitType = 'permanent' | 'temporary';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  type: HabitType;
  startDate: string;
  endDate?: string;
  weeklyGoal: number; // target % per week (0-100)
  note?: string;
  createdAt: string;
  timesPerMonth?: number;
  goalId?: string | null;
  reminder?: string; // "HH:mm"
  /** Keep for backwards compatibility if needed */
  repeatEvery?: number;
  repeatUnit?: 'days' | 'weeks';
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface HabitStats {
  habit: Habit;
  todayDone: boolean;
  weekRate: number;
  monthRate: number;
  streak: number;
  healthScore: number;
  isExpired: boolean;
  isDueToday: boolean;
}

export const CATEGORY_CONFIG: Record<HabitCategory, { label: string; emoji: string; color: string }> = {
  health: { label: 'Health', emoji: '🏃', color: 'habit-health' },
  mind: { label: 'Mind', emoji: '🧠', color: 'habit-mind' },
  work: { label: 'Work', emoji: '💼', color: 'habit-work' },
  lifestyle: { label: 'Lifestyle', emoji: '✨', color: 'habit-lifestyle' },
  social: { label: 'Social', emoji: '🤝', color: 'habit-social' },
};

export const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  times_per_month: 'Times per month',
};
