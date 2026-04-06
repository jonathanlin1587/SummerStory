import { useMemo, useState } from 'react';
import { Plus, Sparkles, CheckCircle2, Circle, Image as ImageIcon, Edit2, Trash2 } from 'lucide-react';
import { Activity } from '@types';
import { theme } from '../../styles/theme';
import AddActivityModal from '../AddActivityModal';
import SuggestionModal from '../SuggestionModal';
import EditActivityModal from '../EditActivityModal';
import { format } from 'date-fns';
import { getLastUsedCategory } from '../../utils/activityDefaults';
import { getPhotoSrc } from '../../services/platformApi';

interface CardViewProps {
  activities: Activity[];
  loading: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'photos'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  completeActivity: (id: string) => Promise<void>;
}

export default function CardView({
  activities,
  loading,
  addActivity,
  updateActivity,
  deleteActivity,
  completeActivity,
}: CardViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('');

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

  const handleStatusToggle = (activity: Activity) => {
    if (activity.status === 'completed') {
      updateActivity(activity.id, { status: 'todo', completedAt: undefined });
    } else {
      completeActivity(activity.id);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '24px',
          background: theme.colors.surface,
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.text }}>Card View</h2>
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
                <option key={c} value={c}>
                  {c}
                </option>
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

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textSecondary }}>
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              color: theme.colors.textSecondary,
            }}
          >
            No activities yet. Add your first summer activity!
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {activities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  background: theme.colors.surface,
                  borderRadius: theme.borderRadius.large,
                  padding: '20px',
                  boxShadow: theme.shadows.medium,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = theme.shadows.large;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = theme.shadows.medium;
                }}
              >
                {activity.photos.length > 0 && (
                  <div
                    style={{
                      width: '100%',
                      height: '160px',
                      background: theme.colors.background,
                      borderRadius: theme.borderRadius.medium,
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={getPhotoSrc(activity.photos[0].path)}
                      alt={activity.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(activity)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      color: activity.status === 'completed' ? theme.colors.success : theme.colors.textSecondary,
                    }}
                  >
                    {activity.status === 'completed' ? (
                      <CheckCircle2 size={20} fill="currentColor" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: theme.colors.text,
                        marginBottom: '4px',
                        textDecoration: activity.status === 'completed' ? 'line-through' : 'none',
                      }}
                    >
                      {activity.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: theme.colors.textSecondary,
                        lineHeight: '1.5',
                      }}
                    >
                      {activity.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {activity.category && (
                    <span
                      style={{
                        padding: '4px 12px',
                        background: theme.colors.background,
                        color: theme.colors.text,
                        borderRadius: theme.borderRadius.full,
                        fontSize: '12px',
                      }}
                    >
                      {activity.category}
                    </span>
                  )}

                  {activity.photos.length > 1 && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: theme.colors.textSecondary,
                      }}
                    >
                      <ImageIcon size={14} />
                      {activity.photos.length}
                    </span>
                  )}

                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingActivity(activity)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: theme.colors.textSecondary,
                        borderRadius: theme.borderRadius.small,
                      }}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteActivity(activity.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: theme.colors.textSecondary,
                        borderRadius: theme.borderRadius.small,
                      }}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {activity.completedAt && (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: `1px solid ${theme.colors.border}`,
                      fontSize: '12px',
                      color: theme.colors.success,
                    }}
                  >
                    ✓ {format(new Date(activity.completedAt), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            ))}
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

      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onSave={async (updates) => {
            await updateActivity(editingActivity.id, updates);
          }}
        />
      )}
    </div>
  );
}
