import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Photo } from '@types';
import { theme } from '../styles/theme';
import { format } from 'date-fns';
import { getPhotoSrc } from '../services/platformApi';

interface PhotoGalleryProps {
  photos: Photo[];
  currentIndex?: number;
  onClose: () => void;
  onDelete?: (photoId: string) => void;
}

export default function PhotoGallery({ photos, currentIndex = 0, onClose, onDelete }: PhotoGalleryProps) {
  const [index, setIndex] = useState(currentIndex);

  const handlePrevious = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  if (photos.length === 0) return null;

  const currentPhoto = photos[index];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: 'none',
          borderRadius: theme.borderRadius.full,
          padding: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2001,
        }}
      >
        <X size={24} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            style={{
              position: 'absolute',
              left: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.full,
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2001,
            }}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            style={{
              position: 'absolute',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.full,
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2001,
            }}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getPhotoSrc(currentPhoto.path)}
          alt={currentPhoto.caption || 'Activity photo'}
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: theme.borderRadius.medium,
          }}
        />

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            color: 'white',
          }}
        >
          {currentPhoto.caption && (
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>
              {currentPhoto.caption}
            </p>
          )}
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            {format(new Date(currentPhoto.uploadedAt), 'MMM d, yyyy')} • {index + 1} / {photos.length}
          </p>

          {onDelete && (
            <button
              onClick={() => {
                onDelete(currentPhoto.id);
                if (photos.length === 1) {
                  onClose();
                } else {
                  setIndex(Math.min(index, photos.length - 2));
                }
              }}
              style={{
                marginTop: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: theme.colors.error,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.medium,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={16} />
              Delete Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
