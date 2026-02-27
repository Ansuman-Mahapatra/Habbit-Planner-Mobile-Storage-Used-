import { NavLink, useLocation } from 'react-router-dom';
import { CalendarCheck, LayoutDashboard, ListChecks, Target, Lightbulb, Settings, X } from 'lucide-react';
import { useHabits } from '@/context/HabitContext';
import { getTodayCompletionRate } from '@/lib/habitUtils';

const NAV_ITEMS = [
  { to: '/', icon: CalendarCheck, label: 'Today' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits', icon: ListChecks, label: 'Habits' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface AppSidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

export default function AppSidebar({ isOpen, setIsOpen }: AppSidebarProps) {
  const { habits, completions } = useHabits();
  const location = useLocation();
  const todayRate = getTodayCompletionRate(habits, completions);

  return (
    <aside className={`fixed left-0 top-0 bottom-0 w-[240px] md:w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform duration-300 ease-in-out ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    } md:translate-x-0`}>
      <div className="px-5 pb-3 pt-[max(env(safe-area-inset-top),3rem)] md:pt-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-foreground tracking-tight">Habit<span className="text-primary">Flow</span></h1>
          <p className="text-xs text-muted-foreground font-mono mt-1 hidden md:block">Track · Build · Grow</p>
        </div>
        <button 
          className="md:hidden p-2 -mr-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Today's progress */}
      <div className="px-5 py-3 mt-4 md:mt-0">
        <div className="text-xs text-muted-foreground mb-1.5 font-mono">Today's Progress</div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${todayRate}%` }}
          />
        </div>
        <div className="text-right text-xs font-mono text-primary mt-1">{todayRate}%</div>
      </div>

      <nav className="flex-1 px-3 mt-4 md:mt-2 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm transition-all duration-200 ${
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className="w-5 h-5 md:w-4 md:h-4" />
              <span className="text-base md:text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-5 pt-3 mb-6 md:mb-0">
        <div className="text-[10px] text-muted-foreground font-mono text-center">
          {habits.length} habits tracked
        </div>
      </div>
    </aside>
  );
}
