import { useMemo, useState } from 'react';
import { Activity } from '@types';
import { theme } from '../../styles/theme';
import { generateRecap } from '../../services/recapService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { Download, Image as ImageIcon, BookOpen } from 'lucide-react';
import EditActivityModal from '../EditActivityModal';
import { getPhotoSrc, platformApi } from '../../services/platformApi';

interface RecapViewProps {
  activities: Activity[];
  loading: boolean;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
}

const BAR_COLORS = [
  theme.colors.primary,
  theme.colors.accent,
  theme.colors.secondary,
  theme.colors.success,
  '#A29BFE',
  '#FD79A8',
];

export default function RecapView({ activities, loading, updateActivity }: RecapViewProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'summer'>('week');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const recap = useMemo(() => generateRecap(activities, period), [activities, period]);

  const categoryChartData = useMemo(
    () =>
      Object.entries(recap.categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    [recap.categoryCounts]
  );

  const photoGridItems = useMemo(() => {
    const items: { photo: Activity['photos'][number]; activity: Activity }[] = [];
    for (const a of recap.periodActivities) {
      for (const p of a.photos ?? []) {
        items.push({ photo: p, activity: a });
      }
    }
    return items.sort(
      (x, y) =>
        new Date(x.photo.uploadedAt).getTime() - new Date(y.photo.uploadedAt).getTime()
    );
  }, [recap.periodActivities]);

  if (loading) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.textSecondary,
        }}
      >
        Loading recap...
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '24px',
          background: theme.colors.surface,
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.text }}>
              Your summer story
            </h2>
            <p style={{ marginTop: '6px', fontSize: '14px', color: theme.colors.textSecondary, maxWidth: '520px' }}>
              A photo-first recap of completed moments in this period, plus a quick read on how you spent your time.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'summer')}
              style={{
                padding: '10px 16px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
                background: 'white',
              }}
            >
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="summer">Summer {new Date().getFullYear()}</option>
            </select>
            <button
              type="button"
              onClick={() => {
                platformApi.showNotification(
                  'Recap export',
                  'Export functionality coming soon!'
                );
              }}
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
              <Download size={20} />
              Export
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
        }}
      >
        {/* Simplified stats: three numbers that support the scrapbook story */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.large,
              padding: '20px',
              boxShadow: theme.shadows.small,
            }}
          >
            <p style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 600 }}>Moments</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: theme.colors.text, marginTop: '4px' }}>
              {recap.completedActivities}
            </p>
            <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>completed this period</p>
          </div>
          <div
            style={{
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.large,
              padding: '20px',
              boxShadow: theme.shadows.small,
            }}
          >
            <p style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 600 }}>Photos</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: theme.colors.text, marginTop: '4px' }}>
              {recap.photos.length}
            </p>
            <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>from those moments</p>
          </div>
          <div
            style={{
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.large,
              padding: '20px',
              boxShadow: theme.shadows.small,
            }}
          >
            <p style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 600 }}>Best streak</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: theme.colors.text, marginTop: '4px' }}>
              {recap.longestStreak}d
            </p>
            <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>all-time active days in a row</p>
          </div>
        </div>

        {recap.favoriteCategory && (
          <p
            style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              marginBottom: '20px',
              fontWeight: 600,
            }}
          >
            Favorite vibe this period:{' '}
            <span style={{ color: theme.colors.primary }}>{recap.favoriteCategory}</span>
          </p>
        )}

        {categoryChartData.length > 0 && (
          <div
            style={{
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.large,
              padding: '24px',
              boxShadow: theme.shadows.small,
              marginBottom: '28px',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '800',
                color: theme.colors.text,
                marginBottom: '16px',
              }}
            >
              By category
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
                <XAxis type="number" allowDecimals={false} stroke={theme.colors.textSecondary} style={{ fontSize: '12px' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  stroke={theme.colors.textSecondary}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.small,
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {categoryChartData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chronological story timeline */}
        <div
          style={{
            background: theme.colors.surface,
            borderRadius: theme.borderRadius.large,
            padding: '24px',
            boxShadow: theme.shadows.small,
            marginBottom: '28px',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: theme.colors.text,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <BookOpen size={22} />
            Story timeline
          </h3>
          <p style={{ fontSize: '13px', color: theme.colors.textSecondary, marginBottom: '20px' }}>
            Oldest to newest — tap a moment to edit details or add captions to photos.
          </p>

          {recap.periodActivities.length === 0 ? (
            <p style={{ color: theme.colors.textSecondary, textAlign: 'center', padding: '32px 0' }}>
              No completed activities in this window yet. Check some off and come back for your story.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {recap.periodActivities.map((activity) => {
                const cover = activity.photos?.[0];
                const when = activity.completedAt
                  ? format(new Date(activity.completedAt), 'EEEE, MMM d')
                  : '';
                return (
                  <button
                    key={activity.id}
                    type="button"
                    onClick={() => setEditingActivity(activity)}
                    style={{
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'stretch',
                      textAlign: 'left',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.large,
                      overflow: 'hidden',
                      background: theme.colors.background,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 'min(200px, 38%)',
                        minHeight: '140px',
                        background: theme.colors.border,
                        flexShrink: 0,
                      }}
                    >
                      {cover ? (
                        <img
                          src={getPhotoSrc(cover.path)}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div
                          style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.colors.textSecondary,
                          }}
                        >
                          <ImageIcon size={40} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, padding: '16px 18px 16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 600 }}>{when}</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: theme.colors.text }}>{activity.title}</div>
                      {activity.description ? (
                        <div style={{ fontSize: '14px', color: theme.colors.textSecondary, lineHeight: 1.5 }}>
                          {activity.description}
                        </div>
                      ) : null}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                        {activity.category && (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: theme.borderRadius.full,
                              background: theme.colors.primary + '22',
                              color: theme.colors.primary,
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            {activity.category}
                          </span>
                        )}
                        {activity.photos.length > 0 && (
                          <span style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 600 }}>
                            {activity.photos.length} photo{activity.photos.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Photo grid with light metadata */}
        <div
          style={{
            background: theme.colors.surface,
            borderRadius: theme.borderRadius.large,
            padding: '24px',
            boxShadow: theme.shadows.small,
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: theme.colors.text,
              marginBottom: '20px',
            }}
          >
            Every photo
          </h3>
          {photoGridItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: theme.colors.textSecondary }}>
              <ImageIcon size={44} style={{ margin: '0 auto 12px', display: 'block' }} />
              No photos in this period yet. Edit a completed activity and attach memories.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '12px',
              }}
            >
              {photoGridItems.map(({ photo, activity }) => (
                <button
                  key={`${activity.id}-${photo.id}`}
                  type="button"
                  onClick={() => setEditingActivity(activity)}
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: theme.borderRadius.medium,
                    overflow: 'hidden',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    background: theme.colors.border,
                  }}
                >
                  <img
                    src={getPhotoSrc(photo.path)}
                    alt={photo.caption || activity.title}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: '10px 10px 8px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                      {activity.completedAt
                        ? format(new Date(activity.completedAt), 'MMM d')
                        : ''}
                      {activity.category ? ` · ${activity.category}` : ''}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#fff',
                        fontWeight: 800,
                        marginTop: '2px',
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {activity.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onSave={async (updates) => {
            await updateActivity(editingActivity.id, updates);
            setEditingActivity(null);
          }}
        />
      )}
    </div>
  );
}
