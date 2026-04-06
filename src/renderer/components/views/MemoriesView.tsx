import { useMemo, useState } from 'react';
import { Activity, Photo } from '@types';
import { theme } from '../../styles/theme';
import { format } from 'date-fns';
import { Image as ImageIcon, Shuffle, Sparkles, Plus } from 'lucide-react';
import PhotoGallery from '../PhotoGallery';
import AddActivityModal from '../AddActivityModal';
import SuggestionModal from '../SuggestionModal';
import { getLastUsedCategory } from '../../utils/activityDefaults';
import { getPhotoSrc } from '../../services/platformApi';

interface MemoriesViewProps {
  activities: Activity[];
  loading: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'photos'>) => Promise<void>;
}

type PhotoWithMeta = Photo & {
  activityId: string;
  activityTitle: string;
  completedAt?: string;
  category?: string;
};

export default function MemoriesView({ activities, loading, addActivity }: MemoriesViewProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'todo'>('all');
  const [category, setCategory] = useState<string>('all');
  const [mode, setMode] = useState<'collage' | 'gallery'>('collage');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [highlightSeed, setHighlightSeed] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('');

  const lastCategory = getLastUsedCategory(activities) ?? '';
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

  const allPhotos = useMemo<PhotoWithMeta[]>(() => {
    const flat: PhotoWithMeta[] = [];
    for (const a of activities) {
      for (const p of a.photos ?? []) {
        flat.push({
          ...p,
          activityId: a.id,
          activityTitle: a.title,
          completedAt: a.completedAt,
          category: a.category,
        });
      }
    }
    return flat.sort((x, y) => new Date(y.uploadedAt).getTime() - new Date(x.uploadedAt).getTime());
  }, [activities]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const a of activities) {
      if (a.category) set.add(a.category);
    }
    return Array.from(set).sort();
  }, [activities]);

  const visiblePhotos = useMemo(() => {
    return allPhotos.filter(p => {
      const a = activities.find(x => x.id === p.activityId);
      if (!a) return false;
      const statusOk = filter === 'all' ? true : a.status === filter;
      const categoryOk = category === 'all' ? true : (a.category ?? '') === category;
      return statusOk && categoryOk;
    });
  }, [allPhotos, activities, filter, category]);

  const highlightPhotos = useMemo(() => {
    // Stable-ish shuffle: use seed to pick a fun “highlight reel”
    const arr = [...visiblePhotos];
    let seed = highlightSeed;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 12);
  }, [visiblePhotos, highlightSeed]);

  if (loading) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.textSecondary,
      }}>
        Loading memories...
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '24px',
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.text }}>
              Memories
            </h2>
            <p style={{ marginTop: '6px', fontSize: '13px', color: theme.colors.textSecondary }}>
              Your photo collage, highlight reel, and gallery—built from activity photos.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              style={{
                padding: '10px 12px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                background: 'white',
              }}
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In progress</option>
              <option value="todo">To do</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: '10px 12px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                background: 'white',
              }}
            >
              <option value="all">All categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div style={{
              display: 'inline-flex',
              background: theme.colors.background,
              borderRadius: theme.borderRadius.full,
              padding: '4px',
              border: `1px solid ${theme.colors.border}`,
            }}>
              <button
                onClick={() => setMode('collage')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: theme.borderRadius.full,
                  background: mode === 'collage' ? theme.colors.primary : 'transparent',
                  color: mode === 'collage' ? 'white' : theme.colors.textSecondary,
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                Collage
              </button>
              <button
                onClick={() => setMode('gallery')}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: theme.borderRadius.full,
                  background: mode === 'gallery' ? theme.colors.primary : 'transparent',
                  color: mode === 'gallery' ? 'white' : theme.colors.textSecondary,
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                Gallery
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowSuggestionModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: theme.colors.accent,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Sparkles size={18} />
              Get Suggestions
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              Add Activity
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Quick add an activity to attach photos later…"
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
                minWidth: '220px',
                padding: '10px 12px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {categories.length > 0 && (
              <select
                value={effectiveQuickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.medium,
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white',
                }}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => void handleQuickAdd()}
              style={{
                padding: '10px 16px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.medium,
                fontWeight: 700,
                fontSize: '14px',
                cursor: quickTitle.trim() ? 'pointer' : 'not-allowed',
                opacity: quickTitle.trim() ? 1 : 0.6,
              }}
            >
              Quick Add
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {allPhotos.length === 0 ? (
          <div style={{
            background: theme.colors.surface,
            borderRadius: theme.borderRadius.large,
            padding: '48px',
            boxShadow: theme.shadows.small,
            textAlign: 'center',
          }}>
            <ImageIcon size={48} style={{ color: theme.colors.textSecondary, margin: '0 auto 16px' }} />
            <p style={{ color: theme.colors.textSecondary }}>
              No photos yet. Edit an activity and upload a few—then your memories will appear here.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.large,
              padding: '20px',
              boxShadow: theme.shadows.small,
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: theme.colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: 0,
                }}>
                  <Sparkles size={18} />
                  Highlight Reel
                </h3>

                <button
                  onClick={() => setHighlightSeed(s => s + 1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: theme.colors.accent,
                    color: 'white',
                    border: 'none',
                    borderRadius: theme.borderRadius.medium,
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  <Shuffle size={16} />
                  Remix
                </button>
              </div>

              <div style={{
                marginTop: '14px',
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gap: '10px',
              }}>
                {highlightPhotos.map((p, idx) => (
                  <button
                    key={`${p.id}-${idx}`}
                    onClick={() => {
                      setGalleryIndex(Math.max(0, visiblePhotos.findIndex(x => x.id === p.id)));
                      setGalleryOpen(true);
                    }}
                    style={{
                      border: 'none',
                      padding: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                      borderRadius: theme.borderRadius.medium,
                      overflow: 'hidden',
                      aspectRatio: '1 / 1',
                    }}
                    title={p.activityTitle}
                  >
                    <img
                      src={getPhotoSrc(p.path)}
                      alt={p.caption || p.activityTitle}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.large,
              padding: '20px',
              boxShadow: theme.shadows.small,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  color: theme.colors.text,
                  margin: 0,
                }}>
                  {mode === 'collage' ? 'Collage' : 'Gallery'}
                </h3>
                <p style={{ fontSize: '13px', color: theme.colors.textSecondary, margin: 0 }}>
                  {visiblePhotos.length} photo{visiblePhotos.length === 1 ? '' : 's'}
                </p>
              </div>

              {visiblePhotos.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: theme.colors.textSecondary }}>
                  No photos match those filters.
                </div>
              ) : mode === 'collage' ? (
                <div
                  style={{
                    marginTop: '18px',
                    columnCount: 4,
                    columnGap: '8px',
                  }}
                >
                  {visiblePhotos.slice(0, 120).map((p, i) => (
                    <button
                      key={`${p.id}-${i}`}
                      onClick={() => {
                        setGalleryIndex(i);
                        setGalleryOpen(true);
                      }}
                      style={{
                        border: 'none',
                        padding: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                        width: '100%',
                        marginBottom: '8px',
                        breakInside: 'avoid',
                        WebkitColumnBreakInside: 'avoid',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        display: 'block',
                      }}
                      title={p.activityTitle}
                    >
                      <img
                        src={getPhotoSrc(p.path)}
                        alt={p.caption || p.activityTitle}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          objectFit: 'cover',
                          transform: 'scale(1.03)',
                          transition: 'transform 0.18s ease-out, filter 0.18s ease-out',
                          filter: 'contrast(1.02) saturate(1.04)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.06)';
                          e.currentTarget.style.filter = 'contrast(1.05) saturate(1.07)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1.03)';
                          e.currentTarget.style.filter = 'contrast(1.02) saturate(1.04)';
                        }}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{
                  marginTop: '18px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '12px',
                }}>
                  {visiblePhotos.map((p, i) => (
                    <button
                      key={`${p.id}-${i}`}
                      onClick={() => {
                        setGalleryIndex(i);
                        setGalleryOpen(true);
                      }}
                      style={{
                        border: 'none',
                        padding: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                        borderRadius: theme.borderRadius.medium,
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ aspectRatio: '1 / 1', background: theme.colors.background }}>
                        <img
                          src={getPhotoSrc(p.path)}
                          alt={p.caption || p.activityTitle}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                      <div style={{ padding: '10px 10px 12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: theme.colors.text, lineHeight: 1.2 }}>
                          {p.activityTitle}
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '12px', color: theme.colors.textSecondary }}>
                          {format(new Date(p.uploadedAt), 'MMM d, yyyy')}
                          {p.category ? ` • ${p.category}` : ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {galleryOpen && visiblePhotos.length > 0 && (
        <PhotoGallery
          photos={visiblePhotos}
          currentIndex={Math.min(galleryIndex, visiblePhotos.length - 1)}
          onClose={() => setGalleryOpen(false)}
        />
      )}

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

