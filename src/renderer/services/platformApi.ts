import { Activity, UserSettings } from '@types';

const ACTIVITIES_KEY = 'summer-checklist.activities';
const SETTINGS_KEY = 'summer-checklist.settings';

const defaultSettings: UserSettings = {
  notificationEnabled: true,
  notificationTime: '10:00',
  theme: 'summer',
  cloudSyncEnabled: false,
  activeHoursStart: '10:00',
  activeHoursEnd: '20:00',
};

type ElectronAPI = {
  getActivities: () => Promise<Activity[]>;
  saveActivities: (activities: Activity[]) => Promise<boolean>;
  getSettings: () => Promise<UserSettings>;
  saveSettings: (settings: UserSettings) => Promise<boolean>;
  selectPhoto: () => Promise<string[]>;
  showNotification: (title: string, body: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
};

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

function getElectronAPI(): ElectronAPI | null {
  if (typeof window === 'undefined') return null;
  return window.electronAPI ?? null;
}

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function selectPhotosInBrowser(): Promise<string[]> {
  if (typeof document === 'undefined') return [];

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      const dataUrls = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
      resolve(dataUrls.filter(Boolean));
    };

    input.click();
  });
}

export function getPhotoSrc(path: string): string {
  if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http')) {
    return path;
  }

  return `local://file?path=${encodeURIComponent(path)}`;
}

export const platformApi = {
  async getActivities(): Promise<Activity[]> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.getActivities();
    return readLocalJson<Activity[]>(ACTIVITIES_KEY, []);
  },

  async saveActivities(activities: Activity[]): Promise<boolean> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.saveActivities(activities);
    saveLocalJson(ACTIVITIES_KEY, activities);
    return true;
  },

  async getSettings(): Promise<UserSettings> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.getSettings();
    return readLocalJson<UserSettings>(SETTINGS_KEY, defaultSettings);
  },

  async saveSettings(settings: UserSettings): Promise<boolean> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.saveSettings(settings);
    saveLocalJson(SETTINGS_KEY, settings);
    return true;
  },

  async selectPhoto(): Promise<string[]> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.selectPhoto();
    return selectPhotosInBrowser();
  },

  async showNotification(title: string, body: string): Promise<void> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.showNotification(title, body);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
        return;
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
          return;
        }
      }
    }

    console.info(`${title}: ${body}`);
  },

  async openExternal(url: string): Promise<void> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.openExternal(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  },
};
