import { useMemo } from 'react';
import { useHabits } from '@/context/HabitContext';
import { getHabitStats, getToday, isDueOnDate } from '@/lib/habitUtils';
import { CATEGORY_CONFIG } from '@/types/habit';
import { Bell, X } from 'lucide-react';
import { useState } from 'react';

export default function ReminderBanner() {
  const { habits, completions } = useHabits();
  const [dismissed, setDismissed] = useState(false);

  const pending = useMemo(() => {
    const today = getToday();
    return habits.filter(h => {
      if (h.type === 'temporary' && h.endDate && h.endDate < today) return false;
      if (!isDueOnDate(h, today)) return false;
      const done = completions.some(c => c.habitId === h.id && c.date === today && c.completed);
      return !done;
    });
  }, [habits, completions]);

  if (dismissed || pending.length === 0) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-6 animate-fade-up flex items-center gap-3">
      <Bell className="w-4 h-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-primary">{pending.length} habit{pending.length > 1 ? 's' : ''} left today: </span>
        <span className="text-sm text-foreground">
          {pending.slice(0, 3).map(h => `${CATEGORY_CONFIG[h.category].emoji} ${h.name}`).join(', ')}
          {pending.length > 3 && ` +${pending.length - 3} more`}
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="p-1 rounded-md hover:bg-primary/10 transition-colors shrink-0">
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
