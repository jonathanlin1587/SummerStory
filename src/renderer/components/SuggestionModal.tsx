import { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import { Activity, PresetActivity } from '@types';
import { theme } from '../styles/theme';
import { aiService } from '../services/aiService';
import { platformApi } from '../services/platformApi';

interface SuggestionModalProps {
  onClose: () => void;
  onAdd: (activity: Omit<Activity, 'id' | 'createdAt' | 'photos'>) => Promise<void>;
  existingActivities: Activity[];
}

export default function SuggestionModal({ onClose, onAdd, existingActivities }: SuggestionModalProps) {
  const [suggestions, setSuggestions] = useState<PresetActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = () => {
    setLoading(true);
    const newSuggestions = aiService.getSuggestions(existingActivities, 3);
    setSuggestions(newSuggestions);
    setLoading(false);
  };

  const handleAdd = async (suggestion: PresetActivity) => {
    await onAdd({
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      status: 'todo',
      tags: suggestion.tags,
      aiGenerated: true,
    });
    platformApi.showNotification('Activity Added', `${suggestion.title} added to your list!`);
    loadSuggestions();
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
          width: '600px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflowY: 'auto',
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
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: theme.colors.text,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Sparkles size={24} style={{ color: theme.colors.accent }} />
            Summer Activity Suggestions
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: theme.colors.textSecondary }}>
            Finding perfect activities for you...
          </div>
        ) : suggestions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '16px' }}>
              Wow! You've added all our suggestions. You're a summer champion! 🏆
            </p>
            <button
              onClick={onClose}
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
              Close
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    background: theme.colors.background,
                    borderRadius: theme.borderRadius.medium,
                    border: `2px solid ${theme.colors.border}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: theme.colors.text,
                    }}>
                      {suggestion.title}
                    </h3>
                    <span style={{
                      padding: '4px 12px',
                      background: theme.colors.accent + '20',
                      color: theme.colors.accent,
                      borderRadius: theme.borderRadius.full,
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {suggestion.category}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: theme.colors.textSecondary,
                    marginBottom: '12px',
                    lineHeight: '1.5',
                  }}>
                    {suggestion.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {suggestion.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            padding: '2px 8px',
                            background: theme.colors.surface,
                            color: theme.colors.textSecondary,
                            borderRadius: theme.borderRadius.full,
                            fontSize: '11px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAdd(suggestion)}
                      style={{
                        padding: '8px 16px',
                        background: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: theme.borderRadius.medium,
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Add to List
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={loadSuggestions}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: theme.colors.background,
                  color: theme.colors.text,
                  border: 'none',
                  borderRadius: theme.borderRadius.medium,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={18} />
                Get New Suggestions
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  background: theme.colors.textSecondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: theme.borderRadius.medium,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
