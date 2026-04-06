import { useMemo, useState } from 'react';
import { Plus, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { Activity } from '@types';
import { theme } from '../../styles/theme';
import AddActivityModal from '../AddActivityModal';
import SuggestionModal from '../SuggestionModal';
import { getLastUsedCategory } from '../../utils/activityDefaults';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { getPhotoSrc } from '../../services/platformApi';

interface TimelineViewProps {
  activities: Activity[];
  loading: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'photos'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  completeActivity: (id: string) => Promise<void>;
}

export default function TimelineView({ 
  activities, 
  loading, 
  addActivity,
}: TimelineViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const completedActivities = activities
    .filter(a => a.status === 'completed' && a.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  const filteredActivities = selectedDate
    ? completedActivities.filter(a => isSameDay(new Date(a.completedAt!), selectedDate))
    : completedActivities;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getActivitiesForDay = (day: Date) => {
    return completedActivities.filter(a => isSameDay(new Date(a.completedAt!), day));
  };

  const renderCalendar = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const firstDayOfWeek = monthStart.getDay();

    return (
      <div style={{
        background: theme.colors.surface,
        borderRadius: theme.borderRadius.large,
        padding: '20px',
        boxShadow: theme.shadows.small,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            style={{
              padding: '8px 16px',
              background: theme.colors.background,
              border: 'none',
              borderRadius: theme.borderRadius.medium,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            ←
          </button>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.colors.text }}>
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            style={{
              padding: '8px 16px',
              background: theme.colors.background,
              border: 'none',
              borderRadius: theme.borderRadius.medium,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            →
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
        }}>
          {weekDays.map(day => (
            <div key={day} style={{
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '700',
              color: theme.colors.textSecondary,
              padding: '8px',
            }}>
              {day}
            </div>
          ))}

          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {daysInMonth.map(day => {
            const dayActivities = getActivitiesForDay(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(isSelected ? null : day)}
                style={{
                  padding: '12px',
                  background: isSelected ? theme.colors.primary : dayActivities.length > 0 ? theme.colors.accent + '20' : 'transparent',
                  color: isSelected ? 'white' : isToday ? theme.colors.primary : theme.colors.text,
                  border: isToday ? `2px solid ${theme.colors.primary}` : 'none',
                  borderRadius: theme.borderRadius.small,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: dayActivities.length > 0 ? '700' : '500',
                  position: 'relative',
                }}
              >
                {format(day, 'd')}
                {dayActivities.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    color: isSelected ? 'white' : theme.colors.accent,
                  }}>
                    {dayActivities.length} ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '24px',
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.text }}>
            Timeline
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
        overflowY: 'auto',
        padding: '24px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
          {renderCalendar()}

          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <CalendarIcon size={20} />
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'All Completed Activities'}
            </h3>

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
                {selectedDate 
                  ? 'No activities completed on this date.'
                  : 'No completed activities yet. Start checking off your summer bucket list!'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredActivities.map(activity => (
                  <div
                    key={activity.id}
                    style={{
                      background: theme.colors.surface,
                      borderRadius: theme.borderRadius.large,
                      padding: '20px',
                      boxShadow: theme.shadows.small,
                      borderLeft: `4px solid ${theme.colors.success}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      {activity.photos.length > 0 && (
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: theme.borderRadius.medium,
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}>
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

                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: theme.colors.text,
                          marginBottom: '4px',
                        }}>
                          {activity.title}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: theme.colors.textSecondary,
                          marginBottom: '8px',
                        }}>
                          {activity.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '13px',
                            color: theme.colors.success,
                            fontWeight: '600',
                          }}>
                            ✓ {format(new Date(activity.completedAt!), 'MMM d, yyyy')}
                          </span>
                          {activity.category && (
                            <span style={{
                              padding: '2px 8px',
                              background: theme.colors.background,
                              color: theme.colors.text,
                              borderRadius: theme.borderRadius.full,
                              fontSize: '12px',
                            }}>
                              {activity.category}
                            </span>
                          )}
                          {activity.photos.length > 1 && (
                            <span style={{
                              fontSize: '12px',
                              color: theme.colors.textSecondary,
                            }}>
                              📷 {activity.photos.length} photos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
