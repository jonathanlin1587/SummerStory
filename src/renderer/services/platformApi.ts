import { Activity, UserSettings } from '@types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, getCurrentUser, isFirebaseEnabled, storage } from './firebaseClient';

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

function canUseCloudSync() {
  return Boolean(isFirebaseEnabled && db && storage && getCurrentUser());
}

function getUserDataDocRef() {
  const user = getCurrentUser();
  if (!db || !user) return null;
  return doc(db, 'users', user.uid, 'app', 'data');
}

async function getCloudData() {
  const ref = getUserDataDocRef();
  if (!ref) return null;

  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data() as Partial<{ activities: Activity[]; settings: UserSettings }>;
}

async function saveCloudData(partialData: Partial<{ activities: Activity[]; settings: UserSettings }>) {
  const ref = getUserDataDocRef();
  if (!ref) return false;

  await setDoc(
    ref,
    {
      ...partialData,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  return true;
}

async function selectPhotoFilesInBrowser(): Promise<File[]> {
  if (typeof document === 'undefined') return [];

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      resolve(files);
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

    if (canUseCloudSync()) {
      const cloudData = await getCloudData();
      if (cloudData?.activities) return cloudData.activities;

      const localActivities = readLocalJson<Activity[]>(ACTIVITIES_KEY, []);
      if (localActivities.length > 0) {
        await saveCloudData({ activities: localActivities });
      }
      return localActivities;
    }

    return readLocalJson<Activity[]>(ACTIVITIES_KEY, []);
  },

  async saveActivities(activities: Activity[]): Promise<boolean> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.saveActivities(activities);

    if (canUseCloudSync()) {
      try {
        return await saveCloudData({ activities });
      } catch (e) {
        console.error('Cloud save failed; saving to browser storage instead.', e);
        saveLocalJson(ACTIVITIES_KEY, activities);
        return true;
      }
    }

    saveLocalJson(ACTIVITIES_KEY, activities);
    return true;
  },

  async getSettings(): Promise<UserSettings> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.getSettings();

    if (canUseCloudSync()) {
      const cloudData = await getCloudData();
      if (cloudData?.settings) return cloudData.settings;

      const localSettings = readLocalJson<UserSettings>(SETTINGS_KEY, defaultSettings);
      await saveCloudData({ settings: localSettings });
      return localSettings;
    }

    return readLocalJson<UserSettings>(SETTINGS_KEY, defaultSettings);
  },

  async saveSettings(settings: UserSettings): Promise<boolean> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.saveSettings(settings);

    if (canUseCloudSync()) {
      try {
        return await saveCloudData({ settings });
      } catch (e) {
        console.error('Cloud settings save failed; saving locally.', e);
        saveLocalJson(SETTINGS_KEY, settings);
        return true;
      }
    }

    saveLocalJson(SETTINGS_KEY, settings);
    return true;
  },

  async selectPhoto(): Promise<string[]> {
    const electronAPI = getElectronAPI();
    if (electronAPI) return electronAPI.selectPhoto();

    const files = await selectPhotoFilesInBrowser();
    if (!files.length) return [];

    if (!canUseCloudSync() || !storage) {
      return Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            })
        )
      );
    }

    const user = getCurrentUser();
    if (!user) return [];

    return Promise.all(
      files.map(async (file) => {
        const safeName = file.name.replace(/\s+/g, '-');
        const objectPath = `users/${user.uid}/photos/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
        const fileRef = ref(storage, objectPath);
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
      })
    );
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

  isCloudSyncAvailable() {
    return isFirebaseEnabled;
  },
};
