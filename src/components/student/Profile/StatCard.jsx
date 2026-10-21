// StatCard.jsx
import React from 'react';
import { Icon } from '../ManageStudent';
import { GRADIENTS } from './constants';

export const StatCard = ({ label, value, icon, color, trend }) => {
  const gradients = {
    blue: 'linear-gradient(135deg, #1a2332 0%, #2563eb 100%)',
    green: 'linear-gradient(135deg, #1a2332 0%, #16a34a 100%)',
    purple: 'linear-gradient(135deg, #1a2332 0%, #7c3aed 100%)',
    orange: 'linear-gradient(135deg, #1a2332 0%, #d97706 100%)',
    pink: 'linear-gradient(135deg, #1a2332 0%, #db2777 100%)',
  };
  
  return (
    <div className="neon-card" style={{
      borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
      animation: 'scaleIn 0.5s ease, fadeInUp 0.5s ease',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: gradients[color] || gradients.blue,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 20px -3px ${color === 'blue' ? 'rgba(37,99,235,0.4)' : color === 'green' ? 'rgba(22,163,74,0.4)' : color === 'purple' ? 'rgba(124,58,237,0.4)' : 'rgba(217,119,6,0.4)'}`,
      }}>
        <Icon d={icon} size={22} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{label}</span>
          {trend && (
            <span style={{ 
              fontSize: 10, color: '#16a34a', fontWeight: 700, 
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', 
              padding: '2px 8px', borderRadius: 10,
              boxShadow: '0 2px 8px rgba(22,163,74,0.2)',
            }}>
              ↑ {trend}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};