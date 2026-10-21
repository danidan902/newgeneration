// Badge.jsx
import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const styles = {
    default: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
    primary: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    success: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    warning: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
    danger: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    purple: { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
    gradient: { bg: 'linear-gradient(135deg, #1a2332, #2563eb)', color: '#fff', border: 'transparent' },
    graduated: { bg: 'linear-gradient(135deg, #1a2332, #1e40af)', color: '#fff', border: 'transparent' },
  };
  
  const s = styles[variant] || styles.default;
  const padding = size === 'sm' ? '2px 8px' : '3px 10px';
  const fontSize = size === 'sm' ? 10.5 : 12;
  
  return (
    <span style={{
      padding, borderRadius: 20, fontSize, fontWeight: 600,
      background: s.bg, color: s.color, border: `1.5px solid ${s.border}`,
      display: 'inline-flex', alignItems: 'center', gap: 3,
      letterSpacing: '0.02em', backdropFilter: 'blur(10px)',
    }}>{children}</span>
  );
};