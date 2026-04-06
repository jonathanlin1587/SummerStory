import { List, Grid, Columns, Calendar, BarChart3, Image as ImageIcon, Settings } from 'lucide-react';
import { theme } from '../styles/theme';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: 'list' | 'cards' | 'kanban' | 'timeline' | 'recap' | 'memories' | 'settings') => void;
}

const navItems = [
  { id: 'list', label: 'List', icon: List },
  { id: 'cards', label: 'Cards', icon: Grid },
  { id: 'kanban', label: 'Kanban', icon: Columns },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'recap', label: 'Recap', icon: BarChart3 },
  { id: 'memories', label: 'Memories', icon: ImageIcon },
];

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside style={{
      width: '240px',
      background: theme.colors.surface,
      borderRight: `1px solid ${theme.colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: theme.colors.primary,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          ☀️ Summer Activities
        </h1>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: isActive ? theme.colors.background : 'transparent',
                color: isActive ? theme.colors.primary : theme.colors.textSecondary,
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = theme.colors.background;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => onViewChange('settings')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: currentView === 'settings' ? theme.colors.background : 'transparent',
          color: currentView === 'settings' ? theme.colors.primary : theme.colors.textSecondary,
          borderRadius: theme.borderRadius.medium,
          fontSize: '14px',
          fontWeight: currentView === 'settings' ? '600' : '500',
          transition: 'all 0.2s',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </aside>
  );
}
