const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getActivities: () => ipcRenderer.invoke('get-activities'),
  saveActivities: (activities) => ipcRenderer.invoke('save-activities', activities),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  selectPhoto: () => ipcRenderer.invoke('select-photo'),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
