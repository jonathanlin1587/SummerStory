import { RecapData, Activity } from '@types';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  format,
  differenceInDays,
} from 'date-fns';

export function generateRecap(
  activities: Activity[], 
  period: 'week' | 'month' | 'summer'
): RecapData {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'week':
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      break;
    case 'month':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'summer':
      const year = now.getFullYear();
      startDate = new Date(year, 5, 1);
      endDate = new Date(year, 8, 30);
      break;
  }

  const periodActivities = activities.filter(a => {
    if (!a.completedAt) return false;
    const completedDate = new Date(a.completedAt);
    return isWithinInterval(completedDate, { start: startDate, end: endDate });
  });

  const allPhotos = periodActivities.flatMap(a => a.photos);

  const completionsByDate: Record<string, number> = {};
  periodActivities.forEach(a => {
    if (a.completedAt) {
      const dateKey = format(new Date(a.completedAt), 'yyyy-MM-dd');
      completionsByDate[dateKey] = (completionsByDate[dateKey] || 0) + 1;
    }
  });

  const longestStreak = calculateLongestStreak(activities);

  const categoryCounts: Record<string, number> = {};
  periodActivities.forEach(a => {
    if (a.category) {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    }
  });
  
  const favoriteCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const totalActivities = activities.length;
  const completedActivities = periodActivities.length;
  const inProgressActivities = activities.filter(a => a.status === 'in-progress').length;

  return {
    period,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalActivities,
    completedActivities,
    inProgressActivities,
    photos: allPhotos,
    completionsByDate,
    longestStreak,
    favoriteCategory,
    periodActivities: [...periodActivities].sort(
      (a, b) =>
        new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime()
    ),
    categoryCounts,
  };
}

function calculateLongestStreak(activities: Activity[]): number {
  const completedDates = activities
    .filter(a => a.status === 'completed' && a.completedAt)
    .map(a => format(new Date(a.completedAt!), 'yyyy-MM-dd'))
    .sort();

  if (completedDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < completedDates.length; i++) {
    const prevDate = new Date(completedDates[i - 1]);
    const currDate = new Date(completedDates[i]);
    const daysDiff = differenceInDays(currDate, prevDate);

    if (daysDiff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (daysDiff > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}
