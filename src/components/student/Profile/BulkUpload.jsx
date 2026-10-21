// BulkUpload.jsx
import React, { useRef } from 'react';
import { Icon } from '../ManageStudent';
import { ICONS, COLORS } from './constants';

export const BulkUpload = ({ 
  showBulkUpload, 
  bulkLoading, 
  handleBulkUpload, 
  downloadTemplate, 
  onClose 
}) => {
  if (!showBulkUpload) return null;

  const fileInputRef = useRef(null);

  return (
    <div className="neon-card" style={{ marginBottom: 20, padding: '24px', animation: 'slideInUp 0.4s ease', background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)', borderRadius: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: COLORS.text, fontFamily: "'Space Grotesk', sans-serif" }}>📦 Bulk Student Import</h2>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'stretch' }}>
        <div style={{ padding: 20, borderRadius: 16, background: '#fff', border: '1.5px solid #cbd5e1', textAlign: 'center', minWidth: 160 }}>
          <Icon d={ICONS.template} size={28} color={COLORS.accent} />
          <div style={{ margin: '10px 0', fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>Template</div>
          <button className="btn-primary" onClick={downloadTemplate} style={{ fontSize: 11.5, padding: '8px 16px' }}>
            <Icon d={ICONS.download} size={14} color="#fff" />Download
          </button>
        </div>
        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{ padding: 30, border: '2px dashed #cbd5e1', borderRadius: 16, background: '#fff', textAlign: 'center', transition: 'all 0.3s' }}>
            <Icon d={ICONS.upload} size={36} color={COLORS.accent} />
            <div style={{ margin: '10px 0', fontSize: 14, fontWeight: 600 }}>Upload CSV/Excel file</div>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleBulkUpload} disabled={bulkLoading} />
          </div>
          {bulkLoading && (
            <div style={{ textAlign: 'center', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>
              <div style={{ width: 18, height: 18, border: '2px solid #cbd5e1', borderTopColor: COLORS.accent, borderRadius: '50%', animation: 'rotate 0.8s linear infinite' }} />Processing...
            </div>
          )}
        </div>
      </div>
      <button onClick={onClose} style={{ marginTop: 12, padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Close</button>
    </div>
  );
};