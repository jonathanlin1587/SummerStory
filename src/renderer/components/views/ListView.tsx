import { useMemo, useState } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import { Activity } from '@types';
import { theme } from '../../styles/theme';
import ActivityCard from '../ActivityCard';
import AddActivityModal from '../AddActivityModal';
import SuggestionModal from '../SuggestionModal';

interface ListViewProps {
  activities: Activity[];
  loading: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'photos'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  completeActivity: (id: string) => Promise<void>;
}

export default function ListView({ 
  activities, 
  loading, 
  addActivity, 
  updateActivity, 
  deleteActivity,
  completeActivity 
}: ListViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<string>('');

  const lastCategory = useMemo(() => {
    const withCategory = activities.filter(a => a.category);
    if (withCategory.length === 0) return '';
    const sorted = [...withCategory].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted[0].category ?? '';
  }, [activities]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    for (const a of activities) {
      if (a.category) set.add(a.category);
    }
    return Array.from(set).sort();
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

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || activity.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '24px',
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.text }}>
            Activities
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
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
              }}
            >
              <Sparkles size={20} />
              Get Suggestions
            </button>
            <button
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
              }}
            >
              <Plus size={20} />
              Add Activity
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ 
            flex: 1, 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: '12px',
              color: theme.colors.textSecondary,
            }} />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={{ 
          marginTop: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <input
            type="text"
            placeholder="Quick add: title only…"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleQuickAdd();
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
            onClick={handleQuickAdd}
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
        overflowY: 'auto',
        padding: '24px',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textSecondary }}>
            Loading activities...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px',
            color: theme.colors.textSecondary,
          }}>
            {searchTerm || filterStatus !== 'all' 
              ? 'No activities found matching your filters.'
              : 'No activities yet. Add your first summer activity!'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredActivities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onUpdate={updateActivity}
                onDelete={deleteActivity}
                onComplete={completeActivity}
              />
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
    </div>
  );
}
