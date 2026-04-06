import { useState, useEffect } from 'react';
import { Activity } from '@types';
import { platformApi } from '../services/platformApi';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
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
    await saveActivities([...activities, newActivity]);
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    const updated = activities.map(a => 
      a.id === id ? { ...a, ...updates } : a
    );
    await saveActivities(updated);
  };

  const deleteActivity = async (id: string) => {
    const filtered = activities.filter(a => a.id !== id);
    await saveActivities(filtered);
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
