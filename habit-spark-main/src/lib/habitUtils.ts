import { Habit, HabitCompletion, HabitStats } from '@/types/habit';

export function getLocalIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getToday(): string {
  return getLocalIsoDate(new Date());
}

function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return getLocalIsoDate(d);
}

function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  const s = new Date(start);
  const e = new Date(end);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    days.push(getLocalIsoDate(d));
  }
  return days;
}

export function isExpired(habit: Habit): boolean {
  if (habit.type !== 'temporary' || !habit.endDate) return false;
  return habit.endDate < getToday();
}

/** Check if a habit with a custom interval is due on a given date */
export function isDueOnDate(habit: Habit, date: string): boolean {
  if (!habit.repeatEvery || !habit.repeatUnit) return true; // No custom interval → always due
  const start = new Date(habit.startDate);
  const target = new Date(date);
  const diffMs = target.getTime() - start.getTime();
  if (diffMs < 0) return false;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const intervalDays = habit.repeatUnit === 'weeks' ? habit.repeatEvery * 7 : habit.repeatEvery;
  return diffDays % intervalDays === 0;
}

function getCompletionRate(habitId: string, completions: HabitCompletion[], days: string[]): number {
  if (days.length === 0) return 0;
  const done = days.filter(d => completions.some(c => c.habitId === habitId && c.date === d && c.completed)).length;
  return Math.round((done / days.length) * 100);
}

export function getStreak(habitId: string, completions: HabitCompletion[]): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = completions.find(c => c.habitId === habitId && c.date === dateStr && c.completed);
    if (found) streak++;
    else if (i > 0) break;
    else break;
  }
  return streak;
}

export function getHabitStats(habit: Habit, completions: HabitCompletion[]): HabitStats {
  const today = getToday();
  const todayDone = completions.some(c => c.habitId === habit.id && c.date === today && c.completed);
  const last7 = Array.from({ length: 7 }, (_, i) => getDaysAgo(i));
  const last30 = Array.from({ length: 30 }, (_, i) => getDaysAgo(i));
  const weekRate = getCompletionRate(habit.id, completions, last7);
  const monthRate = getCompletionRate(habit.id, completions, last30);
  const streak = getStreak(habit.id, completions);
  const healthScore = Math.round(weekRate * 0.4 + monthRate * 0.4 + Math.min(streak * 5, 100) * 0.2);
  const dueToday = isDueOnDate(habit, today);

  return { habit, todayDone, weekRate, monthRate, streak, healthScore, isExpired: isExpired(habit), isDueToday: dueToday };
}

export function getLast7DaysData(habits: Habit[], completions: HabitCompletion[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = getDaysAgo(6 - i);
    const done = habits.filter(h =>
      completions.some(c => c.habitId === h.id && c.date === date && c.completed)
    ).length;
    const label = new Date(date).toLocaleDateString('en', { weekday: 'short' });
    return { date, label, completed: done, total: habits.length };
  });
}

export function getCategoryBreakdown(habits: Habit[]) {
  const cats: Record<string, number> = {};
  habits.forEach(h => { cats[h.category] = (cats[h.category] || 0) + 1; });
  return Object.entries(cats).map(([name, value]) => ({ name, value }));
}

export function getMonthlyTrend(habits: Habit[], completions: HabitCompletion[]) {
  return Array.from({ length: 4 }, (_, i) => {
    const weekStart = getDaysAgo((3 - i) * 7 + 6);
    const weekEnd = getDaysAgo((3 - i) * 7);
    const days = getDaysBetween(weekStart, weekEnd);
    const totalPossible = habits.length * days.length;
    const totalDone = habits.reduce((sum, h) =>
      sum + days.filter(d => completions.some(c => c.habitId === h.id && c.date === d && c.completed)).length, 0);
    const rate = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
    return { week: `Week ${i + 1}`, rate };
  });
}

export function getYearlyTrend(habits: Habit[], completions: HabitCompletion[]) {
  const months: { month: string; rate: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, j) => {
      const dd = new Date(year, month, j + 1);
      return dd.toISOString().split('T')[0];
    }).filter(day => day <= getToday());
    const totalPossible = habits.length * days.length;
    const totalDone = habits.reduce((sum, h) =>
      sum + days.filter(day => completions.some(c => c.habitId === h.id && c.date === day && c.completed)).length, 0);
    const rate = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
    months.push({ month: d.toLocaleDateString('en', { month: 'short' }), rate });
  }
  return months;
}

export function getHeatmapData(habits: Habit[], completions: HabitCompletion[]) {
  const data: { date: string; count: number; level: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const date = getDaysAgo(i);
    const count = habits.filter(h =>
      completions.some(c => c.habitId === h.id && c.date === date && c.completed)
    ).length;
    const maxH = habits.length || 1;
    const ratio = count / maxH;
    const level = ratio === 0 ? 0 : ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.75 ? 3 : 4;
    data.push({ date, count, level });
  }
  return data;
}

export function getTodayCompletionRate(habits: Habit[], completions: HabitCompletion[]): number {
  if (habits.length === 0) return 0;
  const today = getToday();
  const done = habits.filter(h => completions.some(c => c.habitId === h.id && c.date === today && c.completed)).length;
  return Math.round((done / habits.length) * 100);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
