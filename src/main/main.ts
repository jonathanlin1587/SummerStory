import { app, BrowserWindow, ipcMain, Notification, protocol, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import Store from 'electron-store';
import { Activity, UserSettings } from '../types';
import { notificationManager } from './notifications';

const store = new Store();

let mainWindow: BrowserWindow | null = null;

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function createWindow() {
  const isDev = !app.isPackaged;
  const shouldOpenDevTools =
    isDev && (process.env.OPEN_DEVTOOLS === '1' || process.argv.includes('--devtools'));
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#FFF9E6',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    if (shouldOpenDevTools) {
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  notificationManager.setMainWindow(mainWindow);
  notificationManager.startDailyNotifications();
}

app.whenReady().then(() => {
  protocol.handle('local', async (request) => {
    try {
      const url = new URL(request.url);
      const rawPath = url.searchParams.get('path');
      if (!rawPath) return new Response('Missing path', { status: 400 });

      const filePath = decodeURIComponent(rawPath);
      const data = await fs.promises.readFile(filePath);

      const ext = path.extname(filePath).toLowerCase();
      const contentType =
        ext === '.png' ? 'image/png' :
        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
        ext === '.gif' ? 'image/gif' :
        ext === '.webp' ? 'image/webp' :
        'application/octet-stream';

      return new Response(data, {
        headers: { 'content-type': contentType },
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for data persistence
ipcMain.handle('get-activities', () => {
  return store.get('activities', []);
});

ipcMain.handle('save-activities', (_event, activities: Activity[]) => {
  store.set('activities', activities);
  return true;
});

ipcMain.handle('get-settings', () => {
  return store.get('settings', {
    notificationEnabled: true,
    notificationTime: '10:00',
    theme: 'summer',
    cloudSyncEnabled: false,
    activeHoursStart: '10:00',
    activeHoursEnd: '20:00',
  });
});

ipcMain.handle('save-settings', (_event, settings: UserSettings) => {
  store.set('settings', settings);
  notificationManager.startDailyNotifications();
  return true;
});

ipcMain.handle('select-photo', async () => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
    ]
  });
  
  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});

ipcMain.handle('show-notification', (_event, title: string, body: string) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      silent: false,
    });
    
    notification.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
    
    notification.show();
  }
});

ipcMain.handle('open-external', (_event, url: string) => {
  shell.openExternal(url);
});
