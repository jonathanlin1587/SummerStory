import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getActivities: () => ipcRenderer.invoke('get-activities'),
  saveActivities: (activities: any) => ipcRenderer.invoke('save-activities', activities),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  selectPhoto: () => ipcRenderer.invoke('select-photo'),
  showNotification: (title: string, body: string) => ipcRenderer.invoke('show-notification', title, body),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
});
