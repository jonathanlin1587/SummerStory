import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Activity } from '@types';
import { theme } from '../styles/theme';
import PhotoManager from './PhotoManager';

interface EditActivityModalProps {
  activity: Activity;
  onClose: () => void;
  onSave: (updates: Partial<Activity>) => Promise<void>;
}

const categories = ['Outdoor', 'Creative', 'Food', 'Adventure', 'Relaxation', 'Social'];

export default function EditActivityModal({ activity, onClose, onSave }: EditActivityModalProps) {
  const initial = useMemo(
    () => ({
      title: activity.title,
      description: activity.description,
      category: activity.category ?? '',
      tags: activity.tags?.join(', ') ?? '',
      photos: activity.photos ?? [],
    }),
    [activity]
  );

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category);
  const [tags, setTags] = useState(initial.tags);
  const [photos, setPhotos] = useState(initial.photos);
  const [saving, setSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setTitle(initial.title);
    setDescription(initial.description);
    setCategory(initial.category);
    setTags(initial.tags);
    setPhotos(initial.photos);
    setShowDetails(
      Boolean(
        initial.description?.trim() ||
          initial.tags?.trim() ||
          (initial.photos && initial.photos.length > 0)
      )
    );
  }, [initial]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        photos,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.borderRadius.large,
          padding: '32px',
          width: '560px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: theme.shadows.large,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.text }}>
            Edit Activity
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: theme.colors.textSecondary,
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
          <p style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '16px' }}>
            Press ⌘/Ctrl+Enter to save.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: '8px',
            }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: '8px',
            }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                color: theme.colors.textSecondary,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '16px' }}>{showDetails ? '▾' : '▸'}</span>
              Description, tags & photos (optional)
            </button>

            {showDetails && (
              <div style={{ marginTop: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: '8px',
                }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.medium,
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    marginBottom: '16px',
                  }}
                />
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: '8px',
                  }}>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.medium,
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <PhotoManager photos={photos} onPhotosChange={setPhotos} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '12px 24px',
                background: theme.colors.background,
                color: theme.colors.text,
                border: 'none',
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 24px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.8 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

