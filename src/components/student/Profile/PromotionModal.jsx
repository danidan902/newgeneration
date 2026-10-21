// PromotionModal.jsx
import React from 'react';
import { COLORS } from './constants';

export const PromotionModal = ({ 
  showPromotionConfirm, 
  selectedAcademicYear, 
  promotionStats, 
  promoting, 
  onConfirm, 
  onCancel 
}) => {
  if (!showPromotionConfirm) return null;

  const getNextYear = () => {
    if (selectedAcademicYear.includes('/')) {
      const [start, end] = selectedAcademicYear.split('/');
      return `${parseInt(start) + 1}/${parseInt(end) + 1}`;
    } else {
      const start = parseInt(selectedAcademicYear);
      return `${start + 1}/${start + 2}`;
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: 16 }}>
      <div className="neon-card" style={{ width: '100%', maxWidth: 500, borderRadius: 20, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>🚀 Promote All Students</div>
          <button onClick={onCancel} style={{ border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: 8, cursor: 'pointer' }}>×</button>
        </div>
        <div className="promo-card p-4 rounded-xl mb-4">
          <p className="text-sm font-semibold">From: <strong>{selectedAcademicYear}</strong></p>
          <p className="text-sm font-semibold">To: <strong>{getNextYear()}</strong></p>
          <p className="text-xs text-gray-500 mt-2">Graduated students will remain in archive</p>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Grade 9 → Grade 10:</span><span className="font-bold">{promotionStats.grade9} students</span></div>
          <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Grade 10 → Grade 11:</span><span className="font-bold">{promotionStats.grade10} students</span></div>
          <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Grade 11 → Grade 12:</span><span className="font-bold">{promotionStats.grade11} students</span></div>
          <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Grade 12 → Graduated:</span><span className="font-bold">{promotionStats.grade12} students</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-primary" style={{ background: '#475569' }}>Cancel</button>
          <button onClick={onConfirm} className="btn-primary btn-success" disabled={promoting}>
            {promoting ? 'Promoting...' : 'Confirm Promotion'}
          </button>
        </div>
      </div>
    </div>
  );
};