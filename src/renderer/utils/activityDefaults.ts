import { Activity } from '@types';

/** Most recently created activity's category (for smart defaults). */
export function getLastUsedCategory(activities: Activity[]): string | undefined {
  const withCat = activities.filter((a) => a.category);
  if (withCat.length === 0) return undefined;
  const sorted = [...withCat].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted[0].category;
}

/** Top N categories by how often they appear on activities (for biasing suggestions). */
export function getTopCategoriesByCount(activities: Activity[], limit = 3): string[] {
  const counts: Record<string, number> = {};
  for (const a of activities) {
    if (!a.category) continue;
    counts[a.category] = (counts[a.category] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([c]) => c);
}
