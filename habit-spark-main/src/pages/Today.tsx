import { useMemo } from 'react';
import { useHabits } from '@/context/HabitContext';
import { getHabitStats, getToday, isDueOnDate } from '@/lib/habitUtils';
import { CATEGORY_CONFIG, FREQUENCY_LABELS } from '@/types/habit';
import { Check, Flame, Target, Clock, AlertCircle, CalendarCheck, Link as LinkIcon } from 'lucide-react';

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getDaysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export default function Today() {
  const { habits, goals, completions, toggleCompletion } = useHabits();
  const today = getToday();

  const stats = useMemo(() => habits.map(h => getHabitStats(h, completions)), [habits, completions]);

  // Habits due strictly today (permanent routine OR temporary/goal habit within date range today)
  const todayHabits = useMemo(() => {
    return stats.filter(s => {
      const h = s.habit;
      // Must not be expired
      if (s.isExpired) return false;
      // Must have started
      if (h.startDate && h.startDate > today) return false;
      // Must be due today (custom interval check)
      if (!isDueOnDate(h, today)) return false;
      // For goal-linked habits: only show if goal is active today
      if (h.goalId) {
        const goal = goals.find(g => g.id === h.goalId);
        if (goal && goal.startDate && goal.endDate) {
          if (today < goal.startDate || today > goal.endDate) return false;
        }
      }
      return true;
    });
  }, [stats, goals, today]);

  // Overdue: habits from past days that were not completed (up to 7 days back)
  const overdueHabits = useMemo(() => {
    const overdue: Array<{ date: string; stat: ReturnType<typeof getHabitStats> }> = [];
    for (let i = 1; i <= 7; i++) {
      const date = getDaysAgoStr(i);
      stats.forEach(s => {
        const h = s.habit;
        if (!isDueOnDate(h, date)) return;
        if (h.startDate && h.startDate > date) return;
        if (h.type === 'temporary' && h.endDate && h.endDate < date) return;
        // If goal-linked, only count overdue if goal was active that day
        if (h.goalId) {
          const goal = goals.find(g => g.id === h.goalId);
          if (goal && goal.startDate && goal.endDate) {
            if (date < goal.startDate || date > goal.endDate) return;
          }
        }
        const wasCompleted = completions.some(c => c.habitId === h.id && c.date === date && c.completed);
        if (!wasCompleted) {
          overdue.push({ date, stat: s });
        }
      });
    }
    // Sort: most recent overdue first
    return overdue.sort((a, b) => b.date.localeCompare(a.date));
  }, [stats, goals, completions]);

  const doneCount = todayHabits.filter(s => s.todayDone).length;
  const totalCount = todayHabits.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display mb-1">Today</h1>
        <p className="text-muted-foreground text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
              <span className="font-medium">Daily Progress</span>
            </div>
            <span className="text-2xl font-display text-primary">{progressPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-2 text-right">
            {doneCount} / {totalCount} done
          </div>
        </div>
      )}

      {/* Today's Habits */}
      <section>
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
          📅 Today's Habits ({totalCount})
        </h2>

        {totalCount === 0 ? (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl text-muted-foreground">
            <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No habits scheduled for today</p>
            <p className="text-sm mt-1">Create habits in the Habits tab to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayHabits.map(s => {
              const cfg = CATEGORY_CONFIG[s.habit.category];
              const linkedGoal = goals.find(g => g.id === s.habit.goalId);
              return (
                <div
                  key={s.habit.id}
                  className={`bg-card border rounded-xl p-4 transition-all ${
                    s.todayDone
                      ? 'border-primary/40 bg-primary/5 opacity-70'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleCompletion(s.habit.id)}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                        s.todayDone
                          ? 'bg-primary border-primary'
                          : 'border-border hover:border-primary/60'
                      }`}
                    >
                      {s.todayDone && <Check className="w-4 h-4 text-primary-foreground" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className={`text-base font-semibold leading-snug ${s.todayDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {s.habit.name}
                      </div>

                      {/* Type + Frequency */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-mono bg-${cfg.color}/10 text-${cfg.color}`}>
                          {cfg.emoji} {cfg.label}
                        </span>
                        <span className="text-xs font-mono bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                          {s.habit.frequency === 'times_per_month'
                            ? `${s.habit.timesPerMonth}x / month`
                            : FREQUENCY_LABELS[s.habit.frequency]}
                        </span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                          s.habit.type === 'permanent'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-orange-500/10 text-orange-400'
                        }`}>
                          {s.habit.type}
                        </span>
                      </div>

                      {/* Goal Tag */}
                      {linkedGoal && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-md w-fit">
                          <Target className="w-3.5 h-3.5 shrink-0" />
                          <span>{linkedGoal.name}</span>
                        </div>
                      )}

                      {/* Goal Description */}
                      {linkedGoal?.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {linkedGoal.description}
                        </p>
                      )}

                      {/* Reminder + Streak */}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {s.habit.reminder && (
                          <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Reminder: {s.habit.reminder}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-primary font-mono">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{s.streak}d streak</span>
                        </div>
                        {s.habit.actionLink && (
                          <a 
                            href={s.habit.actionLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-1 rounded-md hover:bg-blue-500/20 transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>Action Link</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Overdue Section */}
      {overdueHabits.length > 0 && (
        <section>
          <h2 className="text-sm font-mono text-destructive uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Overdue from Previous Days ({overdueHabits.length})
          </h2>
          <div className="space-y-3">
            {overdueHabits.map(({ date, stat: s }) => {
              const cfg = CATEGORY_CONFIG[s.habit.category];
              const linkedGoal = goals.find(g => g.id === s.habit.goalId);
              const daysAgo = Math.round((new Date(today).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  key={`${s.habit.id}-${date}`}
                  className="bg-card border border-destructive/20 rounded-xl p-4 opacity-80"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full border-2 border-destructive/40 flex items-center justify-center shrink-0 mt-0.5 bg-destructive/5">
                      <AlertCircle className="w-4 h-4 text-destructive/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-foreground">{s.habit.name}</div>
                      <div className="text-xs text-destructive font-mono mt-1">
                        Missed {daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`} · {date}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs font-mono bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                          {cfg.emoji} {cfg.label}
                        </span>
                        {linkedGoal && (
                          <div className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-md">
                            <Target className="w-3 h-3" />
                            {linkedGoal.name}
                          </div>
                        )}
                        {s.habit.actionLink && (
                          <a 
                            href={s.habit.actionLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md hover:bg-blue-500/20 transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>Action Link</span>
                          </a>
                        )}
                      </div>
                      {linkedGoal?.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {linkedGoal.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
