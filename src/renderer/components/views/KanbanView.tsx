import { useMemo, useState } from 'react';
import { Plus, GripVertical, Sparkles } from 'lucide-react';
import { Activity } from '@types';
import { theme } from '../../styles/theme';
import AddActivityModal from '../AddActivityModal';
import SuggestionModal from '../SuggestionModal';
import { getLastUsedCategory } from '../../utils/activityDefaults';

interface KanbanViewProps {
  activities: Activity[];
  loading: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'photos'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  completeActivity: (id: string) => Promise<void>;
}

export default function KanbanView({ 
  activities, 
  loading, 
  addActivity,
  updateActivity,
}: KanbanViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null);

  const lastCategory = getLastUsedCategory(activities) ?? '';

  const allCategories = useMemo(() => {
    const s = new Set<string>();
    for (const a of activities) {
      if (a.category) s.add(a.category);
    }
    return Array.from(s).sort();
  }, [activities]);

  const effectiveQuickCategory = quickCategory || lastCategory;

  const handleQuickAdd = async () => {
    if (!quickTitle.trim()) return;
    await addActivity({
      title: quickTitle.trim(),
      description: '',
      category: effectiveQuickCategory || undefined,
      status: 'todo',
      tags: [],
    });
    setQuickTitle('');
  };

  const todoActivities = activities.filter(a => a.status === 'todo');
  const inProgressActivities = activities.filter(a => a.status === 'in-progress');
  const completedActivities = activities.filter(a => a.status === 'completed');

  const handleDragStart = (activity: Activity) => {
    setDraggedActivity(activity);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: Activity['status']) => {
    if (draggedActivity) {
      const updates: Partial<Activity> = { status };
      if (status === 'completed' && draggedActivity.status !== 'completed') {
        updates.completedAt = new Date().toISOString();
      } else if (status !== 'completed') {
        updates.completedAt = undefined;
      }
      updateActivity(draggedActivity.id, updates);
      setDraggedActivity(null);
    }
  };

  const renderColumn = (title: string, activities: Activity[], status: Activity['status'], color: string) => (
    <div 
      style={{ 
        flex: 1, 
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onDragOver={handleDragOver}
      onDrop={() => handleDrop(status)}
    >
      <div style={{
        padding: '16px',
        background: color + '20',
        borderRadius: theme.borderRadius.medium,
        marginBottom: '16px',
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: theme.colors.text,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {title}
          <span style={{
            background: color,
            color: 'white',
            padding: '2px 8px',
            borderRadius: theme.borderRadius.full,
            fontSize: '12px',
          }}>
            {activities.length}
          </span>
        </h3>
      </div>

      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: '200px',
      }}>
        {activities.map(activity => (
          <div
            key={activity.id}
            draggable
            onDragStart={() => handleDragStart(activity)}
            style={{
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.medium,
              padding: '16px',
              boxShadow: theme.shadows.small,
              cursor: 'grab',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = theme.shadows.medium;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = theme.shadows.small;
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <GripVertical size={16} style={{ color: theme.colors.textSecondary, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: '4px',
                }}>
                  {activity.title}
                </h4>
                {activity.description && (
                  <p style={{
                    fontSize: '13px',
                    color: theme.colors.textSecondary,
                    lineHeight: '1.4',
                  }}>
                    {activity.description}
                  </p>
                )}

                {(activity.category || activity.photos.length > 0) && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginTop: '8px',
                    flexWrap: 'wrap',
                  }}>
                    {activity.category && (
                      <span style={{
                        padding: '2px 8px',
                        background: theme.colors.background,
                        color: theme.colors.text,
                        borderRadius: theme.borderRadius.full,
                        fontSize: '11px',
                      }}>
                        {activity.category}
                      </span>
                    )}
                    {activity.photos.length > 0 && (
                      <span style={{
                        padding: '2px 8px',
                        background: theme.colors.accent + '20',
                        color: theme.colors.accent,
                        borderRadius: theme.borderRadius.full,
                        fontSize: '11px',
                      }}>
                        📷 {activity.photos.length}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '24px',
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.text }}>
            Kanban Board
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowSuggestionModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: theme.colors.accent,
                color: 'white',
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: theme.shadows.small,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={20} />
              Get Suggestions
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: theme.colors.primary,
                color: 'white',
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: theme.shadows.small,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus size={20} />
              Add Activity
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Quick add: title…"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleQuickAdd();
              }
            }}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 12px',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.medium,
              fontSize: '14px',
              outline: 'none',
            }}
          />
          {allCategories.length > 0 && (
            <select
              value={effectiveQuickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              style={{
                padding: '10px 16px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                background: 'white',
              }}
            >
              <option value="">No category</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => void handleQuickAdd()}
            style={{
              padding: '10px 20px',
              background: theme.colors.primary,
              color: 'white',
              borderRadius: theme.borderRadius.medium,
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: theme.shadows.small,
              border: 'none',
              cursor: quickTitle.trim() ? 'pointer' : 'not-allowed',
              opacity: quickTitle.trim() ? 1 : 0.6,
              whiteSpace: 'nowrap',
            }}
          >
            Quick Add
          </button>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '24px',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textSecondary }}>
            Loading activities...
          </div>
        ) : (
          <div style={{ 
            display: 'flex',
            gap: '24px',
            height: '100%',
          }}>
            {renderColumn('To Do', todoActivities, 'todo', theme.colors.textSecondary)}
            {renderColumn('In Progress', inProgressActivities, 'in-progress', theme.colors.secondary)}
            {renderColumn('Completed', completedActivities, 'completed', theme.colors.success)}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddActivityModal
          onClose={() => setShowAddModal(false)}
          onAdd={addActivity}
          initialCategory={lastCategory || undefined}
          existingActivities={activities}
        />
      )}

      {showSuggestionModal && (
        <SuggestionModal
          onClose={() => setShowSuggestionModal(false)}
          onAdd={addActivity}
          existingActivities={activities}
        />
      )}
    </div>
  );
}
