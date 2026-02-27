import { useMemo } from 'react';
import { useHabits } from '@/context/HabitContext';
import { getHabitStats } from '@/lib/habitUtils';
import { CATEGORY_CONFIG } from '@/types/habit';
import { Trophy, AlertTriangle, Heart } from 'lucide-react';

export default function Insights() {
  const { habits, completions } = useHabits();

  const stats = useMemo(() => habits.map(h => getHabitStats(h, completions)), [habits, completions]);
  const sorted = useMemo(() => [...stats].sort((a, b) => b.streak - a.streak), [stats]);
  const best = useMemo(() => [...stats].sort((a, b) => b.monthRate - a.monthRate)[0], [stats]);
  const worst = useMemo(() => [...stats].filter(s => !s.isExpired).sort((a, b) => a.monthRate - b.monthRate)[0], [stats]);

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-danger';
  };

  const getHealthBg = (score: number) => {
    if (score >= 70) return 'bg-success/10 border-success/20';
    if (score >= 40) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  if (stats.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">No data yet</p>
        <p className="text-sm mt-1">Add and track habits to see insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display mb-1">Insights</h1>
        <p className="text-muted-foreground text-sm">Smart analytics about your habits</p>
      </div>

      {/* Highlights */}
      <div className="grid lg:grid-cols-2 gap-4 stagger-children">
        {best && (
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-up">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg">Best Performing</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CATEGORY_CONFIG[best.habit.category].emoji}</span>
              <div>
                <div className="font-medium">{best.habit.name}</div>
                <div className="text-sm font-mono text-primary">{best.monthRate}% monthly rate</div>
              </div>
            </div>
          </div>
        )}

        {worst && (
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-up">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-display text-lg">Needs Attention</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CATEGORY_CONFIG[worst.habit.category].emoji}</span>
              <div>
                <div className="font-medium">{worst.habit.name}</div>
                <div className="text-sm font-mono text-destructive">{worst.monthRate}% monthly rate</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Streak Leaderboard */}
      <div className="bg-card border border-border rounded-xl p-5 animate-fade-up">
        <h3 className="font-display text-lg mb-4">Streak Leaderboard</h3>
        <div className="space-y-3">
          {sorted.map((s, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
            const maxStreak = Math.max(1, sorted[0]?.streak || 1);
            return (
              <div key={s.habit.id} className="flex items-center gap-3">
                <span className="w-8 text-center text-sm">{medal}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.habit.name}</div>
                  <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(s.streak / maxStreak) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-mono text-primary shrink-0">{s.streak}d</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health Scores */}
      <div className="bg-card border border-border rounded-xl p-5 animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg">Habit Health Scores</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4 font-mono">40% weekly rate + 40% monthly rate + 20% streak consistency</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.habit.id} className={`border rounded-lg p-3 ${getHealthBg(s.healthScore)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_CONFIG[s.habit.category].emoji}</span>
                  <span className="text-sm font-medium truncate">{s.habit.name}</span>
                </div>
                <span className={`font-mono text-lg font-bold ${getHealthColor(s.healthScore)}`}>{s.healthScore}</span>
              </div>
              <div className="flex gap-4 mt-2 text-[10px] font-mono text-muted-foreground">
                <span>7d: {s.weekRate}%</span>
                <span>30d: {s.monthRate}%</span>
                <span>🔥 {s.streak}d</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
