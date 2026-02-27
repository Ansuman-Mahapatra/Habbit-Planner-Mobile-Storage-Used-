import { useState, useMemo } from 'react';
import { useHabits } from '@/context/HabitContext';
import { getLast7DaysData, getCategoryBreakdown, getMonthlyTrend, getYearlyTrend, getHeatmapData, getTodayCompletionRate, getHabitStats } from '@/lib/habitUtils';
import { CATEGORY_CONFIG } from '@/types/habit';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { TrendingUp, Flame, Target, ListChecks } from 'lucide-react';

const CHART_COLORS = ['hsl(38,92%,50%)', 'hsl(142,71%,45%)', 'hsl(220,70%,55%)', 'hsl(280,60%,55%)', 'hsl(340,65%,55%)'];
const HEATMAP_COLORS = ['hsl(240,10%,12%)', 'hsl(38,60%,20%)', 'hsl(38,70%,30%)', 'hsl(38,80%,40%)', 'hsl(38,92%,50%)'];

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-display text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function HeatmapGrid({ data }: { data: { date: string; count: number; level: number }[] }) {
  const weeks: typeof data[] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-up">
      <h3 className="font-display text-lg mb-4">Activity Heatmap</h3>
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.count} habits`}
                className="w-[13px] h-[13px] rounded-[2px] transition-colors"
                style={{ backgroundColor: HEATMAP_COLORS[day.level] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        {HEATMAP_COLORS.map((c, i) => (
          <div key={i} className="w-[13px] h-[13px] rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-muted-foreground text-xs">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-mono text-foreground">{p.value}{typeof p.value === 'number' && p.dataKey?.includes('rate') ? '%' : ''}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { habits, completions } = useHabits();
  const [range, setRange] = useState<'week' | 'month' | 'year' | 'all'>('week');

  const todayRate = useMemo(() => getTodayCompletionRate(habits, completions), [habits, completions]);
  const stats = useMemo(() => habits.map(h => getHabitStats(h, completions)), [habits, completions]);
  const avgStreak = useMemo(() => {
    if (stats.length === 0) return 0;
    return Math.round(stats.reduce((s, st) => s + st.streak, 0) / stats.length);
  }, [stats]);
  const bestRate = useMemo(() => Math.max(0, ...stats.map(s => s.weekRate)), [stats]);

  const barData = useMemo(() => getLast7DaysData(habits, completions), [habits, completions]);
  const catData = useMemo(() => getCategoryBreakdown(habits), [habits]);
  const monthData = useMemo(() => getMonthlyTrend(habits, completions), [habits, completions]);
  const yearData = useMemo(() => getYearlyTrend(habits, completions), [habits, completions]);
  const heatmap = useMemo(() => getHeatmapData(habits, completions), [habits, completions]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-display mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your habit performance at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard icon={Target} label="Today" value={`${todayRate}%`} sub="completion rate" />
        <StatCard icon={Flame} label="Avg Streak" value={`${avgStreak}d`} sub="days average" />
        <StatCard icon={TrendingUp} label="Best Rate" value={`${bestRate}%`} sub="weekly best" />
        <StatCard icon={ListChecks} label="Total" value={`${habits.length}`} sub="habits tracked" />
      </div>

      {/* Range Picker */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {(['week', 'month', 'year', 'all'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-md text-xs font-mono capitalize transition-all ${
              range === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-5 animate-fade-up">
          <h3 className="font-display text-lg mb-4">Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="label" tick={{ fill: 'hsl(240,5%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(240,5%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" fill="hsl(38,92%,50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="bg-card border border-border rounded-xl p-5 animate-fade-up">
          <h3 className="font-display text-lg mb-4">By Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {catData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {catData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="capitalize">{CATEGORY_CONFIG[c.name as keyof typeof CATEGORY_CONFIG]?.emoji} {c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Area Chart */}
        <div className="bg-card border border-border rounded-xl p-5 animate-fade-up">
          <h3 className="font-display text-lg mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthData}>
              <defs>
                <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(38,92%,50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(38,92%,50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: 'hsl(240,5%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(240,5%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" stroke="hsl(38,92%,50%)" fill="url(#amberGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-card border border-border rounded-xl p-5 animate-fade-up">
          <h3 className="font-display text-lg mb-4">Yearly Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={yearData}>
              <XAxis dataKey="month" tick={{ fill: 'hsl(240,5%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(240,5%,50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="rate" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={{ fill: 'hsl(38,92%,50%)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <HeatmapGrid data={heatmap} />
    </div>
  );
}
