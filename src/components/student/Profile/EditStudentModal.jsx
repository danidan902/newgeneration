// EditStudentModal.jsx
import React from 'react';
import { ImageUpload } from './ImageUpload';
import { Icon } from '../ManageStudent';
import { ICONS, COLORS } from './constants';

export const EditStudentModal = ({ 
  editingStudent, 
  editFormData, 
  setEditFormData, 
  editProfileImage, 
  setEditProfileImage, 
  loading, 
  onSubmit, 
  onClose 
}) => {
  if (!editingStudent) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: 16 }}>
      <div className="neon-card" style={{ width: '100%', maxWidth: 900, borderRadius: 20, padding: 18, overflow: 'auto', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>Edit Student</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>Update the student's profile and enrollment data</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', color: COLORS.text, width: 36, height: 36, borderRadius: 10, cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profile Photo</label>
            <ImageUpload value={editProfileImage} onChange={setEditProfileImage} disabled={loading} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Full Name</label>
              <input className="pi" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} disabled={loading} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>StudentId</label>
              <input className="pi" type="text" value={editFormData.studentId} onChange={e => setEditFormData({ ...editFormData, studentId: e.target.value })} disabled={loading} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Password</label>
              <input className="pi" type="text" value={editFormData.password} onChange={e => setEditFormData({ ...editFormData, password: e.target.value })} disabled={loading} placeholder="Leave blank to keep current password" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Roll No</label>
              <input className="pi" value={editFormData.rollNumber} onChange={e => setEditFormData({ ...editFormData, rollNumber: e.target.value })} disabled={loading} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Gender</label>
              <select className="ps" value={editFormData.sex} onChange={e => setEditFormData({ ...editFormData, sex: e.target.value })} disabled={loading}>
                <option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Current Grade</label>
              <select className="ps" value={editFormData.grade} onChange={e => setEditFormData({ ...editFormData, grade: e.target.value })} disabled={loading}>
                <option value="">Select Grade</option><option>9</option><option>10</option><option>11</option><option>12</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Program</label>
              <select className="ps" value={editFormData.programs} onChange={e => setEditFormData({ ...editFormData, programs: e.target.value })} disabled={loading}>
                <option value="">Select Program</option><option>Social Science</option><option>Natural Science</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Section</label>
              <input className="pi" value={editFormData.section} onChange={e => setEditFormData({ ...editFormData, section: e.target.value })} disabled={loading} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: COLORS.text, marginBottom: 5 }}>Academic Year</label>
              <select className="ps" value={editFormData.academicYear} onChange={e => setEditFormData({ ...editFormData, academicYear: e.target.value })} disabled={loading}>
                <option value="2019/2020">2019/2020</option>
                <option value="2020/2021">2020/2021</option>
                <option value="2021/2022">2021/2022</option>
                <option value="2022/2023">2022/2023</option>
                <option value="2023/2024">2023/2024</option>
                <option value="2024/2025">2024/2025</option>
                <option value="2025/2026">2025/2026</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
            <button type="button" className="btn-primary" onClick={onClose} style={{ background: '#fff', color: COLORS.text, border: '1.5px solid #cbd5e1' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};