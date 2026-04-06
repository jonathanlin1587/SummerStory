import { useEffect, useState } from 'react';
import { Bell, BellOff, Clock, Sun, Moon } from 'lucide-react';
import { theme } from '../../styles/theme';
import { useSettings } from '../../hooks/useSettings';
import { platformApi } from '../../services/platformApi';

export default function SettingsView() {
  const { settings, saveSettings, loading } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  if (loading || !settings) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: theme.colors.textSecondary,
      }}>
        Loading settings...
      </div>
    );
  }

  const handleSave = async () => {
    if (localSettings) {
      await saveSettings(localSettings);
      platformApi.showNotification('Settings Saved', 'Your preferences have been updated!');
    }
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '24px',
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.text }}>
          Settings
        </h2>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '24px',
      }}>
        <div style={{ maxWidth: '600px' }}>
          <div style={{
            background: theme.colors.surface,
            borderRadius: theme.borderRadius.large,
            padding: '24px',
            boxShadow: theme.shadows.small,
            marginBottom: '24px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Bell size={20} />
              Notifications
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: theme.colors.background,
                borderRadius: theme.borderRadius.medium,
              }}>
                <div>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: '4px',
                  }}>
                    Enable Notifications
                  </p>
                  <p style={{ 
                    fontSize: '13px', 
                    color: theme.colors.textSecondary,
                  }}>
                    Receive daily activity suggestions
                  </p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
                  <input
                    type="checkbox"
                    checked={localSettings?.notificationEnabled ?? true}
                    onChange={(e) => updateSetting('notificationEnabled', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: localSettings?.notificationEnabled ? theme.colors.primary : theme.colors.border,
                    borderRadius: '28px',
                    transition: '0.3s',
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '20px',
                      width: '20px',
                      left: localSettings?.notificationEnabled ? '28px' : '4px',
                      bottom: '4px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.3s',
                    }} />
                  </span>
                </label>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: '8px',
                }}>
                  <Clock size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Active Hours Start
                </label>
                <input
                  type="time"
                  value={localSettings?.activeHoursStart ?? '10:00'}
                  onChange={(e) => updateSetting('activeHoursStart', e.target.value)}
                  disabled={!localSettings?.notificationEnabled}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.medium,
                    fontSize: '14px',
                    outline: 'none',
                    background: localSettings?.notificationEnabled ? 'white' : theme.colors.background,
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: '8px',
                }}>
                  <Moon size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Active Hours End
                </label>
                <input
                  type="time"
                  value={localSettings?.activeHoursEnd ?? '20:00'}
                  onChange={(e) => updateSetting('activeHoursEnd', e.target.value)}
                  disabled={!localSettings?.notificationEnabled}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.medium,
                    fontSize: '14px',
                    outline: 'none',
                    background: localSettings?.notificationEnabled ? 'white' : theme.colors.background,
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: theme.colors.textSecondary,
                  marginTop: '8px',
                }}>
                  You'll receive random activity suggestions during these hours
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: theme.colors.surface,
            borderRadius: theme.borderRadius.large,
            padding: '24px',
            boxShadow: theme.shadows.small,
            marginBottom: '24px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Sun size={20} />
              Appearance
            </h3>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: '8px',
              }}>
                Theme
              </label>
              <select
                value={localSettings?.theme ?? 'summer'}
                onChange={(e) => updateSetting('theme', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.medium,
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white',
                }}
              >
                <option value="summer">Summer (Default)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <p style={{
                fontSize: '12px',
                color: theme.colors.textSecondary,
                marginTop: '8px',
              }}>
                Theme customization coming soon!
              </p>
            </div>
          </div>

          <div style={{
            background: theme.colors.surface,
            borderRadius: theme.borderRadius.large,
            padding: '24px',
            boxShadow: theme.shadows.small,
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: '12px',
            }}>
              About
            </h3>
            <p style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              lineHeight: '1.6',
            }}>
              Summer Activity Tracker v1.0.0
              <br />
              Built with Electron, React, and TypeScript
              <br />
              <br />
              Track your summer adventures, upload memories, and make this summer unforgettable! 🌞
            </p>
          </div>

          <button
            onClick={handleSave}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '14px',
              background: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.medium,
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: theme.shadows.medium,
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
