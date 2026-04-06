import { useState, useEffect } from 'react';
import { UserSettings } from '@types';
import { platformApi } from '../services/platformApi';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await platformApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
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
