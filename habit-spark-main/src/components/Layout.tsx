import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import ReminderBanner from '@/components/ReminderBanner';
import { Menu } from 'lucide-react';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 md:ml-[220px] overflow-auto h-screen relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 pb-4 pt-[max(env(safe-area-inset-top),3rem)] border-b border-border/40 bg-background/95 backdrop-blur z-30 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="p-2 -ml-2 rounded-md hover:bg-accent text-foreground transition-colors"
             >
               <Menu className="w-6 h-6" />
             </button>
             <h1 className="font-display text-xl text-foreground tracking-tight">Habit<span className="text-primary">Flow</span></h1>
          </div>
        </div>

        <div className="p-4 md:p-8 flex-1 w-full max-w-full overflow-x-hidden">
          <ReminderBanner />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
