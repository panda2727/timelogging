import { getLogsFromFirebase } from './firebaseStorage';

export interface CategoryStats {
  category: string;
  totalMinutes: number;
  totalHours: number;
  count: number;
  percentage: number;
}

export interface CategorySubStats {
  category: string;
  subCategory: string;
  totalMinutes: number;
  totalHours: number;
  percentage: number;
  count: number;
}

export interface AnalyticsData {
  totalEntries: number;
  categoryBreakdown: CategoryStats[];
  categorySubBreakdown: CategorySubStats[];
}

function calculateDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export async function getAnalytics(
  uid: string,
  daysBack?: number,
  customRange?: { start: string; end: string }
): Promise<AnalyticsData> {
  let logs = await getLogsFromFirebase(uid);

  // Filter by custom date range
  if (customRange) {
    logs = logs.filter((log) => log.date >= customRange.start && log.date <= customRange.end);
  } else if (daysBack) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const d = cutoffDate;
    const cutoffStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    logs = logs.filter((log) => log.date >= cutoffStr);
  }

  if (logs.length === 0) {
    return {
      totalEntries: 0,
      categoryBreakdown: [],
      categorySubBreakdown: [],
    };
  }

  // Calculate total time
  const totalMinutes = logs.reduce(
    (sum, log) => sum + calculateDuration(log.startTime, log.endTime),
    0
  );

  // Category breakdown
  const categoryMap = new Map<string, { minutes: number; count: number }>();
  logs.forEach((log) => {
    const duration = calculateDuration(log.startTime, log.endTime);
    const existing = categoryMap.get(log.category) || { minutes: 0, count: 0 };
    categoryMap.set(log.category, {
      minutes: existing.minutes + duration,
      count: existing.count + 1,
    });
  });

  const categoryBreakdown: CategoryStats[] = Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      totalMinutes: stats.minutes,
      totalHours: Math.round((stats.minutes / 60) * 10) / 10,
      count: stats.count,
      percentage: Math.round((stats.minutes / totalMinutes) * 100),
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  // Category + sub-category combination breakdown
  const catSubMap = new Map<string, { category: string; subCategory: string; minutes: number; count: number }>();
  logs.forEach((log) => {
    const sub = log.subCategory || '(no sub-category)';
    const key = `${log.category}|${sub}`;
    const duration = calculateDuration(log.startTime, log.endTime);
    const existing = catSubMap.get(key) || { category: log.category, subCategory: sub, minutes: 0, count: 0 };
    catSubMap.set(key, {
      ...existing,
      minutes: existing.minutes + duration,
      count: existing.count + 1,
    });
  });

  const categorySubBreakdown: CategorySubStats[] = Array.from(catSubMap.values())
    .map((stats) => ({
      category: stats.category,
      subCategory: stats.subCategory,
      totalMinutes: stats.minutes,
      totalHours: Math.round((stats.minutes / 60) * 10) / 10,
      percentage: Math.round((stats.minutes / totalMinutes) * 100),
      count: stats.count,
    }))
    .sort((a, b) => {
      const catOrder = categoryBreakdown.map((c) => c.category);
      const catDiff = catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
      if (catDiff !== 0) return catDiff;
      return b.totalMinutes - a.totalMinutes;
    });

  return {
    totalEntries: logs.length,
    categoryBreakdown,
    categorySubBreakdown,
  };
}
