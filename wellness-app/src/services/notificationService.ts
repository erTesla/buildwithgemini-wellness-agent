export interface DailyCheckInReminder {
  slot: 'morning' | 'midday' | 'evening' | 'bedtime';
  name: string;
  time: string; // "08:30"
  title: string;
  body: string;
}

export const DAILY_CHECKIN_SCHEDULE: DailyCheckInReminder[] = [
  {
    slot: 'morning',
    name: 'Morning Intention',
    time: '08:30 AM',
    title: 'Good morning! ☀️',
    body: 'How did you sleep? Take 30 seconds with Who-Hum to set a gentle intention for your day.'
  },
  {
    slot: 'midday',
    name: 'Midday Reset',
    time: '01:00 PM',
    title: 'Midday Reset 🌿',
    body: 'Time for a breather. How is your energy holding up? Step away from screens for 5 minutes.'
  },
  {
    slot: 'evening',
    name: 'Evening Recharge',
    time: '06:00 PM',
    title: 'Evening Wind-Down 🌅',
    body: 'Work wrap-up! Transition into evening mode with your favorite restorative hobby.'
  },
  {
    slot: 'bedtime',
    name: 'Bedtime Reflection',
    time: '09:30 PM',
    title: 'Quiet Reflection 🌙',
    body: 'Ready for bed? Unload today\'s thoughts with your companion so you can sleep peacefully.'
  }
];

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
};

export const sendLocalNotification = (title: string, body: string): void => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/manifest.json',
          badge: '/manifest.json',
          tag: 'whohum-daily-checkin'
        });
      });
    } else {
      new Notification(title, {
        body,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="25" fill="%23059669"/><text x="50%" y="65%" font-size="60" text-anchor="middle" fill="white">🌱</text></svg>'
      });
    }
  } catch (err) {
    console.warn('Failed to send notification:', err);
  }
};

export const testScheduleCheckInNotification = (): void => {
  sendLocalNotification(
    'Who-Hum Wellness Companion 🌱',
    'Timely Mental Health Check-In active! 4 daily pings scheduled at 8:30 AM, 1:00 PM, 6:00 PM, and 9:30 PM before bed.'
  );
};
