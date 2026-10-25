// components/Profile/Avatar.jsx
import React, { useState, useEffect } from 'react';

const sanitize = (url) => {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim().replace(/^["']|["']$/g, '');
  u = u.replace(/^http:\/\//i, 'https://');
  if (u.includes('res.cloudinary.com') && u.includes('/upload/')) {
    if (!/\/upload\/[^/]*(f_auto|q_auto)/.test(u)) {
      u = u.replace('/upload/', '/upload/f_auto,q_auto/');
    }
  }
  return u;
};

export const Avatar = ({ name = '', image, size = 40, showOnline = false }) => {
  const [src, setSrc] = useState(sanitize(image));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(sanitize(image));
    setFailed(false);
  }, [image]);

  const initials = name
    ? name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#4F46E5',
    color: '#fff',
    fontWeight: 700,
    fontSize: size * 0.4,
    overflow: 'hidden',
  };

  const hasImage = src && !failed;

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {hasImage ? (
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          style={baseStyle}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <div style={baseStyle}>{initials}</div>
      )}

      {showOnline && (
        <div
          style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid white',
          }}
        />
      )}
    </div>
  );
};
