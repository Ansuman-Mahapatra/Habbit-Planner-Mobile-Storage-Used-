import { LocalNotifications } from '@capacitor/local-notifications';
import { Habit } from '@/types/habit';

// Startup: silently check — no dialog shown here.
export const initNotifications = async () => {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display === 'denied') {
      console.warn('Notifications were previously denied by user.');
    }
  } catch {
    // Plugin not available in browser — silently ignore
  }
};

// Request permission ONLY when a user saves a habit with a reminder time.
// This way the user understands WHY the permission is needed.
const ensurePermission = async (): Promise<boolean> => {
  try {
    let { display } = await LocalNotifications.checkPermissions();
    if (display === 'prompt' || display === 'prompt-with-rationale') {
      const result = await LocalNotifications.requestPermissions();
      display = result.display;
    }
    return display === 'granted';
  } catch {
    return false;
  }
};

// Maps a habit's "HH:mm" to the upcoming Date 1 hour prior.
const getNextReminderDate = (timeString: string): Date | null => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':').map(Number);

  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

  // Trigger 1 hour BEFORE the actual reminder time
  target.setHours(target.getHours() - 1);

  // If that moment has already passed today, push to tomorrow
  if (target.getTime() < now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target;
};

/** Schedule a reminder notification for a habit.
 *  Asks for permission only if the habit actually has a reminder time set. */
export const scheduleHabitNotification = async (habit: Habit) => {
  try {
    await cancelHabitNotification(habit.id); // Clear existing

    if (!habit.reminder) return; // No time set → nothing to schedule

    // Permission prompt happens here — user just saved a reminder, context is clear
    const granted = await ensurePermission();
    if (!granted) return;

    const nextDate = getNextReminderDate(habit.reminder);
    if (!nextDate) return;

    const notificationId = Math.abs(
      habit.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)
    );

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: `⏰ Reminder: ${habit.name}`,
          body: `Your habit is set for ${habit.reminder}. Keep your streak going!`,
          schedule: { at: nextDate, allowWhileIdle: true },
          smallIcon: 'ic_stat_icon_config_sample',
        }
      ]
    });
  } catch (error) {
    console.error('Schedule Habit Notification Error', error);
  }
};

export const cancelHabitNotification = async (habitId: string) => {
  try {
    const notificationId = Math.abs(
      habitId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)
    );
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
  } catch {
    // Ignore
  }
};

/** End-of-day summary — only fires if user has already granted permission via a habit reminder */
export const scheduleEndOfDaySummary = async () => {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') return; // Silently skip if no permission yet

    const now = new Date();
    const eod = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0); // 9:00 PM
    if (eod.getTime() < now.getTime()) {
      eod.setDate(eod.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 99999,
          title: 'End of Day Summary 🌙',
          body: "Check off your remaining habits before bed! Let's maintain that streak.",
          schedule: { at: eod, allowWhileIdle: true, repeats: true, every: 'day' }
        }
      ]
    });
  } catch {
    // Ignore
  }
};
