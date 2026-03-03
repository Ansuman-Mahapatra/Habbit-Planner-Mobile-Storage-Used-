import { useState, useMemo } from 'react';
import { useHabits } from '@/context/HabitContext';
import { getHabitStats, generateId, getToday } from '@/lib/habitUtils';
import { Goal } from '@/types/goal';
import { Plus, Target, Flame, Calendar, Trash2, Pencil, BarChart, Link as LinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CATEGORY_CONFIG, FREQUENCY_LABELS } from '@/types/habit';

export default function Goals() {
  const { habits, completions, goals, addGoal, updateGoal, deleteGoal, unlinkHabitsFromGoal } = useHabits();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Goal>>({});
  const [confirmGoalId, setConfirmGoalId] = useState<string | null>(null);

  // Compute all habit stats required for rendering
  const stats = useMemo(() => habits.map(h => getHabitStats(h, completions)), [habits, completions]);

  const openAdd = () => { 
    setEditing({ name: '', startDate: '', endDate: '', description: '' }); 
    setModalOpen(true); 
  };
  
  const openEdit = (g: Goal) => { 
    setEditing(g); 
    setModalOpen(true); 
  };

  const handleSave = () => {
    if (!editing.name) return;
    
    if (editing.id) {
      updateGoal(editing as Goal);
    } else {
      addGoal({ ...editing, id: generateId(), createdAt: getToday() } as Goal);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display mb-1">Goals</h1>
          <p className="text-muted-foreground text-sm">Create overarching timelines and attach habits to them</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      <div className="space-y-6 stagger-children">
        {[...goals].sort((a, b) => {
          if (!a.startDate) return 1;
          if (!b.startDate) return -1;
          return a.startDate.localeCompare(b.startDate);
        }).map(goal => {
          // Find all habits assigned to this specific Goal
          const goalStats = stats.filter(s => s.habit.goalId === goal.id);
          
          return (
            <div key={goal.id} className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm flex flex-col gap-4 transition-all hover:border-primary/20">
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> {goal.name}
                  </h3>
                  {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
                  
                  <div className="flex items-center gap-2 mt-3 text-xs font-mono text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-md w-fit">
                    <Calendar className="w-3.5 h-3.5" />
                    {goal.startDate || goal.endDate ? (
                      <>
                        <span>{goal.startDate || 'No start'}</span>
                        <span className="opacity-50">→</span>
                        <span>{goal.endDate || 'No end'}</span>
                      </>
                    ) : (
                      <span>Permanent Goal</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(goal)} className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmGoalId(goal.id)} className="p-2 rounded-md bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Linked Habits UI within the Goal */}
              <div className="mt-2 pt-4 border-t border-border border-dashed">
                <h4 className="text-xs font-mono uppercase text-muted-foreground tracking-wider mb-3 flex justify-between items-center">
                  <span>Linked Habits ({goalStats.length})</span>
                </h4>
                
                {goalStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground/60 italic p-4 bg-secondary/30 rounded-lg text-center border border-border">
                    No habits linked. Create a habit in the Habits tab and assign it to this Goal.
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {goalStats.map(s => {
                      const cfg = CATEGORY_CONFIG[s.habit.category];
                      const progress = s.habit.weeklyGoal > 0 ? Math.min(100, Math.round((s.weekRate / s.habit.weeklyGoal) * 100)) : 0;
                      
                      return (
                        <div key={s.habit.id} className="flex flex-col gap-3 bg-secondary/40 border border-border/50 rounded-lg p-3 relative overflow-hidden">
                          <div className={`absolute top-0 left-0 bottom-0 w-1 bg-${cfg.color}`} />
                          
                          <div className="flex justify-between items-start pl-2">
                            <div>
                              <div className="flex items-center gap-1.5 text-sm font-medium">
                                <span>{cfg.emoji}</span> {s.habit.name}
                              </div>
                              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                {s.habit.frequency === 'times_per_month' 
                                  ? `${s.habit.timesPerMonth}x / month` 
                                  : FREQUENCY_LABELS[s.habit.frequency]}
                              </div>
                              {s.habit.actionLink && (
                                <a 
                                  href={s.habit.actionLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex mt-2 items-center gap-1 text-[10px] text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md hover:bg-blue-500/20 transition-colors max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <LinkIcon className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">Action Link</span>
                                </a>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1 text-primary">
                                <Flame className="w-3.5 h-3.5" />
                                <span className="text-sm font-mono font-bold">{s.streak}</span>
                              </div>
                            </div>
                          </div>

                          {/* Mini Progress Bar for Weekly Target */}
                          {(() => {
                            // Calculate how far along they are for this week's goal
                            const progress = Math.min(100, Math.round((s.weekRate / s.habit.weeklyGoal) * 100) || 0);
                            return (
                              <div className="pl-2 pr-1">
                                <div className="flex justify-between text-[10px] mb-1">
                                  <span className="text-muted-foreground">Weekly Target</span>
                                  <span className="font-mono text-foreground">{progress}%</span>
                                </div>
                                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-primary h-full transition-all duration-700" style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            );
                          })()}
                          
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-24 text-muted-foreground border border-dashed border-border rounded-xl bg-card/50">
            <Target className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-lg font-medium text-foreground">No goals set</p>
            <p className="text-sm mt-1 max-w-[250px] mx-auto">Create a goal with a timeline, then assign habits to help you reach it.</p>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{editing.id ? 'Edit Goal' : 'New Goal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground font-mono mb-1 block">Goal Name</label>
              <input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Marathon Prep" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-mono mb-1 block">Description</label>
              <textarea value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20" placeholder="Optional details..." />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-mono mb-1 block">Start Date</label>
                <input type="date" value={editing.startDate || ''} onChange={e => setEditing(p => ({ ...p, startDate: e.target.value }))} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-mono mb-1 block">End Date</label>
                <input type="date" value={editing.endDate || ''} onChange={e => setEditing(p => ({ ...p, endDate: e.target.value }))} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              {editing.id && (
                <button 
                  onClick={() => {
                    setConfirmGoalId(editing.id!);
                    setModalOpen(false);
                  }}
                  className="w-full bg-destructive/10 text-destructive border border-destructive/20 py-2.5 rounded-lg text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-all"
                >
                  Delete
                </button>
              )}
              <button onClick={handleSave} disabled={!editing.name} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                {editing.id ? 'Update' : 'Create'} Goal
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmGoalId} onOpenChange={open => { if (!open) setConfirmGoalId(null); }}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">Delete Goal?</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              This goal has <strong className="text-foreground">{habits.filter(h => h.goalId === confirmGoalId).length} linked habit(s)</strong>. What should happen to them?
            </p>
            {/* Default focus = Delete habits (Yes) */}
            <button
              autoFocus
              onClick={() => {
                if (confirmGoalId) deleteGoal(confirmGoalId);
                setConfirmGoalId(null);
              }}
              className="w-full bg-destructive text-destructive-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              🗑️ Yes — Delete Goal + All Linked Habits
            </button>
            <button
              onClick={() => {
                if (confirmGoalId) unlinkHabitsFromGoal(confirmGoalId);
                setConfirmGoalId(null);
              }}
              className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
            >
              🔓 No — Delete Goal Only (Keep Habits)
            </button>
            <button
              onClick={() => setConfirmGoalId(null)}
              className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
