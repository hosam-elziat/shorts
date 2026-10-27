export interface AppStat {
  id: string;
  name: string;
  nameAr: string;
  packageName: string;
  color: string;
  iconName: string;
  count: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  totalCount: number;
  apps: Record<string, number>;
}

export interface CounterState {
  todayDate: string;
  dailyGoal: number;
  totalWatchedToday: number;
  appCounts: Record<string, number>;
  vrStyle: 'cyber_vr' | 'minimal_pill' | 'neon_gauge' | 'hologram';
  widgetOpacity: number;
  vibrateOnLimit: boolean;
  dockToEdge: boolean;
}

export const TARGET_APPS: AppStat[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    nameAr: 'تيك توك',
    packageName: 'com.zhiliaoapp.musically',
    color: '#00f2fe',
    iconName: 'Film',
    count: 0,
  },
  {
    id: 'instagram',
    name: 'Instagram Reels',
    nameAr: 'إنستجرام ريلز',
    packageName: 'com.instagram.android',
    color: '#E1306C',
    iconName: 'Instagram',
    count: 0,
  },
  {
    id: 'youtube',
    name: 'YouTube Shorts',
    nameAr: 'يوتيوب شورتس',
    packageName: 'com.google.android.youtube',
    color: '#FF0000',
    iconName: 'PlaySquare',
    count: 0,
  },
  {
    id: 'facebook',
    name: 'Facebook Reels',
    nameAr: 'فيسبوك ريلز',
    packageName: 'com.facebook.katana',
    color: '#1877F2',
    iconName: 'Facebook',
    count: 0,
  },
  {
    id: 'snapchat',
    name: 'Snapchat Spotlight',
    nameAr: 'سناب شات سبوتلايت',
    packageName: 'com.snapchat.android',
    color: '#FFFC00',
    iconName: 'Ghost',
    count: 0,
  },
];

export function getTodayDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function shouldResetDay(lastDate: string, currentDate: string): boolean {
  return lastDate !== currentDate;
}

export function calculateEstimatedMinutes(videoCount: number, avgSecondsPerVideo = 24): number {
  return Math.round((videoCount * avgSecondsPerVideo) / 60);
}

export function calculateGoalProgress(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

export function isGoalExceeded(current: number, goal: number): boolean {
  return current >= goal;
}

/**
 * Accessibility debouncer logic:
 * Multiple scroll events may fire in a fraction of a second.
 * We must debounce by at least 650ms to prevent double counting on one fling.
 */
export function canIncrementScroll(
  lastTimestamp: number,
  currentTimestamp: number,
  debounceMs = 650
): boolean {
  return currentTimestamp - lastTimestamp >= debounceMs;
}

export function matchAppByPackage(packageName: string): AppStat | undefined {
  return TARGET_APPS.find((app) => app.packageName === packageName || packageName.includes(app.id));
}
