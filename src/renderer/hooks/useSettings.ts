import { useState, useEffect } from 'react';
import { UserSettings } from '@types';
import { platformApi } from '../services/platformApi';
import { onAuthStateChange } from '../services/firebaseClient';

const fallbackSettings: UserSettings = {
  notificationEnabled: true,
  notificationTime: '10:00',
  theme: 'summer',
  cloudSyncEnabled: false,
  activeHoursStart: '10:00',
  activeHoursEnd: '20:00',
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(fallbackSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(() => {
      void loadSettings();
    });

    return unsubscribe;
  }, []);

  const loadSettings = async () => {
    try {
      const data = await platformApi.getSettings();
      setSettings(data ?? fallbackSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings(fallbackSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await platformApi.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return {
    settings,
    loading,
    saveSettings,
  };
}
