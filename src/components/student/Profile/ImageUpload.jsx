// ImageUpload.jsx
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ICONS } from './constants';
import { Icon } from '../ManageStudent';

export const ImageUpload = ({ value, onChange, disabled }) => {
  const [preview, setPreview] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value && value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(value);
    } else setPreview(value);
  }, [value]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image size must be less than 5MB'); return; }
    onChange(file);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => !disabled && inputRef.current?.click()}
        style={{
          width: 130, height: 130, borderRadius: '20px',
          border: `3px dashed ${isDragging ? '#2563eb' : '#cbd5e1'}`,
          background: isDragging ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : 'linear-gradient(135deg, #fafbfc, #f0f4ff)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          margin: '0 auto 12px', position: 'relative',
          overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: disabled ? 0.5 : 1,
          boxShadow: isDragging ? '0 0 30px rgba(37,99,235,0.3)' : '0 4px 12px rgba(0,0,0,0.05)',
        }}>
        {preview ? (
          <>
            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,35,50,0.7), rgba(37,99,235,0.7))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.3s ease',
            }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
              <Icon d={ICONS.camera} size={28} color="#fff" />
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
            <div style={{ animation: 'float 3s ease-in-out infinite' }}>
              <Icon d={ICONS.camera} size={36} color="#94a3b8" />
            </div>
            <span style={{ fontSize: 10.5, marginTop: 6, fontWeight: 600, color: '#64748b' }}>
              {isDragging ? '✨ Drop it!' : 'Upload Photo'}
            </span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={e => handleFile(e.target.files[0])} disabled={disabled} style={{ display: 'none' }} />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled} 
          className="btn-primary" style={{ padding: '6px 14px', fontSize: 11.5 }}>
          <Icon d={ICONS.upload} size={12} color="#fff" />{preview ? 'Change' : 'Choose'}
        </button>
        {preview && (
          <button type="button" onClick={() => { onChange(null); setPreview(null); }} disabled={disabled} 
            style={{
              padding: '6px 14px', borderRadius: 12, border: '2px solid #dc2626',
              background: '#fff', color: '#dc2626', fontSize: 11.5, fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              transition: 'all 0.2s',
            }}>
            <Icon d={ICONS.trash} size={12} color="#dc2626" />Remove
          </button>
        )}
      </div>
    </div>
  );
};