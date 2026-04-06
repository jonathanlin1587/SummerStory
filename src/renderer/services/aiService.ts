import { Activity, PresetActivity } from '../../types';
import presetActivities from '../../../presets/summer-activities.json';

export class AIService {
  private presets: PresetActivity[] = presetActivities;

  getSuggestions(
    existingActivities: Activity[],
    count: number = 3,
    options?: {
      preferredCategories?: string[];
      excludeCategories?: string[];
    }
  ): PresetActivity[] {
    const existingTitles = new Set(
      existingActivities.map(a => a.title.toLowerCase())
    );

    let availableActivities = this.presets.filter(
      preset => !existingTitles.has(preset.title.toLowerCase())
    );

    if (options?.preferredCategories && options.preferredCategories.length > 0) {
      const preferred = availableActivities.filter(a =>
        options.preferredCategories!.includes(a.category)
      );
      if (preferred.length > 0) {
        availableActivities = preferred;
      }
    }

    if (options?.excludeCategories && options.excludeCategories.length > 0) {
      availableActivities = availableActivities.filter(
        a => !options.excludeCategories!.includes(a.category)
      );
    }

    const shuffled = this.shuffleArray([...availableActivities]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  getSuggestionByCategory(category: string, existingActivities: Activity[]): PresetActivity | null {
    const existingTitles = new Set(
      existingActivities.map(a => a.title.toLowerCase())
    );

    const categoryActivities = this.presets.filter(
      preset =>
        preset.category === category &&
        !existingTitles.has(preset.title.toLowerCase())
    );

    if (categoryActivities.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * categoryActivities.length);
    return categoryActivities[randomIndex];
  }

  getRandomSuggestion(existingActivities: Activity[]): PresetActivity | null {
    const suggestions = this.getSuggestions(existingActivities, 1);
    return suggestions.length > 0 ? suggestions[0] : null;
  }

  getDailySuggestion(existingActivities: Activity[]): PresetActivity | null {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const hour = now.getHours();
    const isMorning = hour >= 6 && hour < 12;
    const isAfternoon = hour >= 12 && hour < 18;
    const isEvening = hour >= 18;

    let preferredCategories: string[] = [];

    if (isWeekend) {
      preferredCategories = ['Adventure', 'Social', 'Outdoor'];
    } else {
      if (isMorning) {
        preferredCategories = ['Outdoor', 'Relaxation'];
      } else if (isAfternoon) {
        preferredCategories = ['Food', 'Creative'];
      } else if (isEvening) {
        preferredCategories = ['Social', 'Relaxation'];
      }
    }

    const suggestions = this.getSuggestions(existingActivities, 1, {
      preferredCategories,
    });

    return suggestions.length > 0 ? suggestions[0] : this.getRandomSuggestion(existingActivities);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getAllCategories(): string[] {
    return Array.from(new Set(this.presets.map(p => p.category)));
  }

  getActivitiesByCategory(category: string): PresetActivity[] {
    return this.presets.filter(p => p.category === category);
  }
}

export const aiService = new AIService();
