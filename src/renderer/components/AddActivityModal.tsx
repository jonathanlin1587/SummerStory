import { X, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, PresetActivity } from '@types';
import { theme } from '../styles/theme';
import { aiService } from '../services/aiService';
import { platformApi } from '../services/platformApi';
import { getTopCategoriesByCount } from '../utils/activityDefaults';

interface AddActivityModalProps {
  onClose: () => void;
  onAdd: (activity: Omit<Activity, 'id' | 'createdAt' | 'photos'>) => Promise<void>;
  initialCategory?: string;
  /** When provided, inline AI/preset suggestion chips are shown. */
  existingActivities?: Activity[];
}

const categories = ['Outdoor', 'Creative', 'Food', 'Adventure', 'Relaxation', 'Social'];

export default function AddActivityModal({
  onClose,
  onAdd,
  initialCategory,
  existingActivities = [],
}: AddActivityModalProps) {
  /** Avoid closing immediately: the opening click can finish on the backdrop (mouseup). */
  const backdropCloseEnabled = useRef(false);

  useEffect(() => {
    backdropCloseEnabled.current = false;
    const t = window.setTimeout(() => {
      backdropCloseEnabled.current = true;
    }, 200);
    return () => window.clearTimeout(t);
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (!backdropCloseEnabled.current) return;
    onClose();
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialCategory ?? '');
  const [tags, setTags] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [prefilledFromSuggestion, setPrefilledFromSuggestion] = useState(false);

  const preferredCategories = useMemo(
    () => getTopCategoriesByCount(existingActivities, 3),
    [existingActivities]
  );

  const inlineSuggestions = useMemo(() => {
    if (existingActivities.length === 0 && preferredCategories.length === 0) {
      return aiService.getSuggestions([], 4);
    }
    return aiService.getSuggestions(existingActivities, 4, {
      preferredCategories:
        preferredCategories.length > 0 ? preferredCategories : undefined,
    });
  }, [existingActivities, preferredCategories]);

  useEffect(() => {
    setCategory((prev) => prev || initialCategory || '');
  }, [initialCategory]);

  const applySuggestion = (s: PresetActivity) => {
    setTitle(s.title);
    setDescription(s.description);
    setCategory(s.category);
    setTags(s.tags.join(', '));
    setShowDetails(true);
    setPrefilledFromSuggestion(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;

    try {
      await onAdd({
        title: title.trim(),
        description: description.trim(),
        category: category || undefined,
        status: 'todo',
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        aiGenerated: prefilledFromSuggestion || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      void platformApi.showNotification(
        'Could not save activity',
        'Check your connection or Firebase rules, then try again.'
      );
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div
      style={{
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
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.borderRadius.large,
          padding: '32px',
          width: '520px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: theme.shadows.large,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: theme.colors.text }}>
              Add New Activity
            </h2>
            <p style={{ marginTop: '4px', fontSize: '13px', color: theme.colors.textSecondary }}>
              Title + category is enough. Use suggestions to prefill, or open more details for notes
              and tags. Press ⌘/Ctrl+Enter to save.
            </p>
          </div>
          <button
            type="button"
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

        {inlineSuggestions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                fontSize: '13px',
                fontWeight: 700,
                color: theme.colors.textSecondary,
              }}
            >
              <Sparkles size={16} style={{ color: theme.colors.accent }} />
              Ideas for you
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {inlineSuggestions.map((s, i) => (
                <button
                  key={`${s.title}-${i}`}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: theme.borderRadius.full,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: theme.colors.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    maxWidth: '100%',
                  }}
                  title={s.description}
                >
                  <span style={{ display: 'block' }}>{s.title}</span>
                  <span
                    style={{
                      display: 'block',
                      marginTop: '2px',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: theme.colors.accent,
                    }}
                  >
                    {s.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: '8px',
              }}
            >
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setPrefilledFromSuggestion(false);
              }}
              placeholder="e.g., Watch the sunset at the beach"
              required
              autoFocus
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
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: '8px',
              }}
            >
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
              }}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
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
              Description, tags & more (optional)
            </button>

            {showDetails && (
              <div style={{ marginTop: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: '8px',
                  }}
                >
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details..."
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
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: '8px',
                  }}
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., beach, nature, friends"
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
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: theme.colors.background,
                color: theme.colors.text,
                border: 'none',
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Add Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
