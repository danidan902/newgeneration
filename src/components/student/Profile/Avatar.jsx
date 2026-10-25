// components/Profile/Avatar.jsx
import React, { useState, useEffect } from 'react';

const sanitizeImage = (url) => {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim().replace(/^["']|["']$/g, '');
  if (!u) return '';
  u = u.replace(/^http:\/\//i, 'https://');
  if (u.includes('res.cloudinary.com') && u.includes('/upload/')) {
    if (!/\/upload\/[^/]*(f_auto|q_auto)/.test(u)) {
      u = u.replace('/upload/', '/upload/f_auto,q_auto/');
    }
  }
  return u;
};

export const Avatar = ({ name = '', image, size = 40, showOnline = false }) => {
  const [src, setSrc] = useState(sanitizeImage(image));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(sanitizeImage(image));
    setFailed(false);
  }, [image]);

  const initials = name
    ? name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const gradients = [
    'linear-gradient(135deg, #1a2332 0%, #2563eb 100%)',
    'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)',
    'linear-gradient(135deg, #1a2332 0%, #1d4ed8 100%)',
  ];
  const gradient = name
    ? gradients[Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % gradients.length]
    : gradients[0];

  const hasImage = Boolean(src) && !failed;

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div
        style={{
          width: size, height: size, borderRadius: '50%',
          background: !hasImage ? gradient : 'transparent',
          overflow: 'hidden', flexShrink: 0,
          boxShadow: '0 0 0 3px rgba(37,99,235,0.2), 0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {hasImage ? (
          <img
            src={src}
            alt={name || 'avatar'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: size * 0.35,
            }}
          >
            {initials}
          </div>
        )}
      </div>
      {showOnline && (
        <div
          style={{
            position: 'absolute', bottom: 2, right: 2,
            width: size * 0.25, height: size * 0.25,
            borderRadius: '50%', background: '#10b981',
            border: '2px solid white',
          }}
        />
      )}
    </div>
  );
};
