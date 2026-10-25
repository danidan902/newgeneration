// frontend/components/Profile/ImageUpload.jsx
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ICONS } from './constants';
import { Icon } from '../ManageStudent';

const compressImage = (file, maxDim = 1200, quality = 0.85) =>
  new Promise((resolve) => {
    const mime = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    const isHeic = /heic|heif/i.test(mime) || /\.(heic|heif)$/i.test(name);
    if (isHeic || !mime.startsWith('image/')) return resolve(file);

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width <= maxDim && height <= maxDim && file.size < 500 * 1024) {
        return resolve(file);
      }
      const scale = Math.min(1, maxDim / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const out = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
          });
          resolve(out.size < file.size ? out : file);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });

export const ImageUpload = ({ value, onChange, disabled }) => {
  const [preview, setPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value && value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(value);
    } else {
      setPreview(value || '');
    }
  }, [value]);

  const handleFile = async (file) => {
    if (!file) return;

    const mime = (file.mimetype || file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    const isImageMime = mime.startsWith('image/');
    const isImageExt = /\.(jpe?g|png|webp|gif|heic|heif)$/.test(name);

    if (!isImageMime && !isImageExt) {
      toast.error('Please upload an image file (JPG, PNG, WEBP, HEIC)');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image too large (max 15 MB)');
      return;
    }

    try {
      setBusy(true);
      const processed = await compressImage(file);
      onChange(processed);
    } catch {
      onChange(file);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => !disabled && !busy && inputRef.current?.click()}
        style={{
          width: 130,
          height: 130,
          borderRadius: '20px',
          border: `3px dashed ${isDragging ? '#2563eb' : '#cbd5e1'}`,
          background: isDragging
            ? 'linear-gradient(135deg, #eff6ff, #dbeafe)'
            : 'linear-gradient(135deg, #fafbfc, #f0f4ff)',
          cursor: disabled || busy ? 'not-allowed' : 'pointer',
          margin: '0 auto 12px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={() => setPreview('')}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#64748b',
            }}
          >
            <Icon d={ICONS.camera} size={36} color="#94a3b8" />
            <span
              style={{
                fontSize: 10.5,
                marginTop: 6,
                fontWeight: 600,
                color: '#64748b',
              }}
            >
              {busy ? 'Processing…' : isDragging ? '✨ Drop it!' : 'Upload Photo'}
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        onChange={(e) => handleFile(e.target.files[0])}
        disabled={disabled || busy}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
          className="btn-primary"
          style={{ padding: '6px 14px', fontSize: 11.5 }}
        >
          <Icon d={ICONS.upload} size={12} color="#fff" />
          {preview ? 'Change' : 'Choose'}
        </button>
        {preview && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setPreview('');
            }}
            disabled={disabled || busy}
            style={{
              padding: '6px 14px',
              borderRadius: 12,
              border: '2px solid #dc2626',
              background: '#fff',
              color: '#dc2626',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: disabled || busy ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Icon d={ICONS.trash} size={12} color="#dc2626" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
};
