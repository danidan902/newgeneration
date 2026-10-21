// Avatar.jsx
import React, { useState } from 'react';

export const Avatar = ({ name, image, size = 40, showOnline = false }) => {
  const [imgError, setImgError] = useState(false);
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';
  
  const gradients = [
    'linear-gradient(135deg, #1a2332 0%, #2563eb 100%)',
    'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)',
    'linear-gradient(135deg, #1a2332 0%, #1d4ed8 100%)',
    'linear-gradient(135deg, #1e3a8a 0%, #93c5fd 100%)',
    'linear-gradient(135deg, #1a2332 0%, #2563eb 100%)',
    'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #1a2332 0%, #1d4ed8 100%)',
  ];
  
  const gradient = name ? gradients[Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % gradients.length] : gradients[0];

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: !image || imgError ? gradient : 'transparent',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '0 0 0 3px rgba(37,99,235,0.2), 0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}>
        {image && !imgError ? (
          <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: size * 0.35,
            letterSpacing: '0.5px',
          }}>{initials}</div>
        )}
      </div>
      {showOnline && (
        <div style={{
          position: 'absolute', bottom: 2, right: 2,
          width: size * 0.25, height: size * 0.25,
          borderRadius: '50%', background: '#10b981',
          border: '2px solid white',
          boxShadow: '0 0 10px rgba(16,185,129,0.5)',
        }} />
      )}
    </div>
  );
};