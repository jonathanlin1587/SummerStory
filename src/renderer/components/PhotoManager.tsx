import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Photo } from '@types';
import { theme } from '../styles/theme';
import { getPhotoSrc, platformApi } from '../services/platformApi';

interface PhotoManagerProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

export default function PhotoManager({ photos, onPhotosChange }: PhotoManagerProps) {
  const [captions, setCaptions] = useState<Record<string, string>>({});

  const handleSelectPhotos = async () => {
    try {
      const filePaths = await platformApi.selectPhoto();
      
      if (filePaths.length > 0) {
        const newPhotos: Photo[] = filePaths.map(path => ({
          id: crypto.randomUUID(),
          path,
          uploadedAt: new Date().toISOString(),
        }));
        
        onPhotosChange([...photos, ...newPhotos]);
      }
    } catch (error) {
      console.error('Failed to select photos:', error);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
    const newCaptions = { ...captions };
    delete newCaptions[photoId];
    setCaptions(newCaptions);
  };

  const handleCaptionChange = (photoId: string, caption: string) => {
    setCaptions({ ...captions, [photoId]: caption });
    const updatedPhotos = photos.map(p => 
      p.id === photoId ? { ...p, caption } : p
    );
    onPhotosChange(updatedPhotos);
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '600',
          color: theme.colors.text,
        }}>
          Photos
        </label>
        <button
          type="button"
          onClick={handleSelectPhotos}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: theme.colors.accent,
            color: 'white',
            border: 'none',
            borderRadius: theme.borderRadius.small,
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <Upload size={16} />
          Upload Photos
        </button>
      </div>

      {photos.length === 0 ? (
        <div
          onClick={handleSelectPhotos}
          style={{
            border: `2px dashed ${theme.colors.border}`,
            borderRadius: theme.borderRadius.medium,
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.colors.accent;
            e.currentTarget.style.background = theme.colors.accent + '10';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.colors.border;
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <ImageIcon size={32} style={{ color: theme.colors.textSecondary, margin: '0 auto 8px' }} />
          <p style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
            Click to upload photos
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px',
        }}>
          {photos.map(photo => (
            <div
              key={photo.id}
              style={{
                position: 'relative',
                borderRadius: theme.borderRadius.medium,
                overflow: 'hidden',
                background: theme.colors.background,
              }}
            >
              <img
                src={getPhotoSrc(photo.path)}
                alt="Activity"
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                }}
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(photo.id)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: theme.borderRadius.small,
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && photos.map(photo => (
        <div key={`caption-${photo.id}`} style={{ marginTop: '8px' }}>
          <input
            type="text"
            placeholder="Add a caption..."
            value={captions[photo.id] || photo.caption || ''}
            onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.small,
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>
      ))}
    </div>
  );
}
