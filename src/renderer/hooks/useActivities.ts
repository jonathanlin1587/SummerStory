import { useState, useEffect } from 'react';
import { Activity } from '@types';
import { platformApi } from '../services/platformApi';
import { onAuthStateChange } from '../services/firebaseClient';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(() => {
      void loadActivities();
    });

    return unsubscribe;
  }, []);

  const loadActivities = async () => {
    try {
      const data = await platformApi.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveActivities = async (newActivities: Activity[]) => {
    try {
      await platformApi.saveActivities(newActivities);
      setActivities(newActivities);
    } catch (error) {
      console.error('Failed to save activities:', error);
    }
  };

  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt' | 'photos'>) => {
    const newActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      photos: [],
    };
    let next: Activity[] = [];
    setActivities((prev) => {
      next = [...prev, newActivity];
      return next;
    });
    try {
      await platformApi.saveActivities(next);
    } catch (error) {
      console.error('Failed to save activities:', error);
      setActivities((prev) => prev.filter((a) => a.id !== newActivity.id));
      throw error;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    let next: Activity[] = [];
    setActivities((prev) => {
      next = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
      return next;
    });
    try {
      await platformApi.saveActivities(next);
    } catch (error) {
      console.error('Failed to save activities:', error);
      await loadActivities();
    }
  };

  const deleteActivity = async (id: string) => {
    let next: Activity[] = [];
    setActivities((prev) => {
      next = prev.filter((a) => a.id !== id);
      return next;
    });
    try {
      await platformApi.saveActivities(next);
    } catch (error) {
      console.error('Failed to save activities:', error);
      await loadActivities();
    }
  };

  const completeActivity = async (id: string) => {
    await updateActivity(id, { 
      status: 'completed', 
      completedAt: new Date().toISOString() 
    });
  };

  return {
    activities,
    loading,
    addActivity,
    updateActivity,
    deleteActivity,
    completeActivity,
    refreshActivities: loadActivities,
  };
}
