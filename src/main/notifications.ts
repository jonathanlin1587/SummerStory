import { BrowserWindow } from 'electron';
import Store from 'electron-store';
import { UserSettings } from '../types';
import { aiService } from '../renderer/services/aiService';

const store = new Store();

export class NotificationManager {
  private mainWindow: BrowserWindow | null = null;
  private notificationTimer: NodeJS.Timeout | null = null;

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  startDailyNotifications() {
    this.stopNotifications();
    
    const settings: UserSettings = store.get('settings') as any || {
      notificationEnabled: true,
      notificationTime: '10:00',
      activeHoursStart: '10:00',
      activeHoursEnd: '20:00',
    };

    if (!settings.notificationEnabled) {
      return;
    }

    const checkAndNotify = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const [startHour] = settings.activeHoursStart.split(':').map(Number);
      const [endHour] = settings.activeHoursEnd.split(':').map(Number);

      if (currentHour >= startHour && currentHour < endHour) {
        const shouldNotify = Math.random() < 0.3;
        
        if (shouldNotify) {
          this.sendDailyPrompt();
        }
      }
    };

    checkAndNotify();
    this.notificationTimer = setInterval(checkAndNotify, 60 * 60 * 1000);
  }

  stopNotifications() {
    if (this.notificationTimer) {
      clearInterval(this.notificationTimer);
      this.notificationTimer = null;
    }
  }

  private async sendDailyPrompt() {
    const activities = store.get('activities', []) as any[];
    
    const messages = [
      'Time for a summer adventure! 🌞',
      'Ready to check something off your list?',
      'Your summer memories are waiting! ✨',
      'Make today count! What will you do?',
      'Summer vibes calling! 🌴',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    if (this.mainWindow) {
      const { Notification } = require('electron');
      const notification = new Notification({
        title: 'Summer Activity Reminder',
        body: randomMessage,
        silent: false,
      });

      notification.on('click', () => {
        if (this.mainWindow) {
          if (this.mainWindow.isMinimized()) this.mainWindow.restore();
          this.mainWindow.focus();
        }
      });

      notification.show();
    }
  }

  sendCustomNotification(title: string, body: string) {
    if (this.mainWindow) {
      const { Notification } = require('electron');
      const notification = new Notification({
        title,
        body,
        silent: false,
      });

      notification.on('click', () => {
        if (this.mainWindow) {
          if (this.mainWindow.isMinimized()) this.mainWindow.restore();
          this.mainWindow.focus();
        }
      });

      notification.show();
    }
  }
}

export const notificationManager = new NotificationManager();
