import { useState } from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Activity } from '@types';
import { theme } from '../styles/theme';
import { format } from 'date-fns';
import EditActivityModal from './EditActivityModal';

interface ActivityCardProps {
  activity: Activity;
  onUpdate: (id: string, updates: Partial<Activity>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
}

const statusColors = {
  'todo': theme.colors.textSecondary,
  'in-progress': theme.colors.secondary,
  'completed': theme.colors.success,
};

export default function ActivityCard({ activity, onUpdate, onDelete, onComplete }: ActivityCardProps) {
  const [showEdit, setShowEdit] = useState(false);

  const handleStatusToggle = () => {
    if (activity.status === 'completed') {
      onUpdate(activity.id, { status: 'todo', completedAt: undefined });
    } else {
      onComplete(activity.id);
    }
  };

  return (
    <div style={{
      background: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      padding: '20px',
      boxShadow: theme.shadows.small,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      transition: 'all 0.2s',
    }}>
      <button
        onClick={handleStatusToggle}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          color: statusColors[activity.status],
        }}
      >
        {activity.status === 'completed' ? (
          <CheckCircle2 size={24} fill="currentColor" />
        ) : (
          <Circle size={24} />
        )}
      </button>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: '4px',
              textDecoration: activity.status === 'completed' ? 'line-through' : 'none',
            }}>
              {activity.title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              marginBottom: '8px',
            }}>
              {activity.description}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 12px',
            background: statusColors[activity.status] + '20',
            color: statusColors[activity.status],
            borderRadius: theme.borderRadius.full,
            fontSize: '12px',
            fontWeight: '600',
          }}>
            {activity.status.replace('-', ' ').toUpperCase()}
          </span>

          {activity.category && (
            <span style={{
              padding: '4px 12px',
              background: theme.colors.background,
              color: theme.colors.text,
              borderRadius: theme.borderRadius.full,
              fontSize: '12px',
            }}>
              {activity.category}
            </span>
          )}

          {activity.photos.length > 0 && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: theme.colors.textSecondary,
            }}>
              <ImageIcon size={14} />
              {activity.photos.length}
            </span>
          )}

          {activity.completedAt && (
            <span style={{
              fontSize: '12px',
              color: theme.colors.textSecondary,
            }}>
              Completed {format(new Date(activity.completedAt), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setShowEdit(true)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: theme.colors.textSecondary,
            borderRadius: theme.borderRadius.small,
          }}
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(activity.id)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: theme.colors.textSecondary,
            borderRadius: theme.borderRadius.small,
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {showEdit && (
        <EditActivityModal
          activity={activity}
          onClose={() => setShowEdit(false)}
          onSave={async (updates) => {
            await onUpdate(activity.id, updates);
          }}
        />
      )}
    </div>
  );
}
