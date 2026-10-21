// GraduateTable.jsx
import React from 'react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Icon } from '../ManageStudent';
import { ICONS, COLORS } from './constants';

export const GraduateTable = ({ 
  graduatedStudents, 
  paginatedGraduated, 
  selectedAcademicYear, 
  onView, 
  onRestore, 
  isSuperAdmin,
  exportGraduatedExcel,
  onBack
}) => {
  return (
    <div>
      <div className="graduated-card rounded-xl p-4 mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a2332', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon d={ICONS.graduation} size={28} color="#2563eb" />
            🎓 Graduated Students Archive
          </h2>
          <p style={{ fontSize: 13, color: '#1e40af', marginTop: 4 }}>
            {graduatedStudents.length} students have graduated from the school
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={exportGraduatedExcel} style={{ background: 'linear-gradient(135deg, #1a2332, #1e40af)', fontSize: 11.5 }}>
            <Icon d={ICONS.download} size={13} color="#fff" /> Export Graduated
          </button>
          <button className="btn-primary" onClick={onBack} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            ← Back to Active Students
          </button>
        </div>
      </div>

      <div className="neon-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="compact-table">
            <thead style={{ background: 'linear-gradient(135deg, #1a2332, #2563eb)' }}>
              <tr style={{ color: '#fff' }}>
                <th>Roll No</th>
                <th>Student</th>
                <th>Gender</th>
                <th>Graduated Grade</th>
                <th>Program</th>
                <th>Section</th>
                <th>Graduation Year</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGraduated.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textSecondary }}>
                      <div style={{ fontSize: 60, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🎓</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>No Graduated Students</div>
                      <div style={{ fontSize: 13 }}>Graduated students will appear here after promotion.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedGraduated.map((student, index) => (
                  <tr key={student._id} style={{ animation: `fadeInUp 0.3s ${index * 0.05}s both`, background: index % 2 === 0 ? '#fff' : '#eff6ff' }}>
                    <td><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, background: '#eff6ff', padding: '4px 8px', borderRadius: 6, color: '#1e40af', fontWeight: 600 }}>{student.rollNumber || '—'}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={student.name} image={student.profileImage} size={36} />
                        <div><div style={{ fontWeight: 600, color: COLORS.text }}>{student.name}</div><div style={{ fontSize: 10.5, color: COLORS.textSecondary }}>{student.email}</div></div>
                      </div>
                    </td>
                    <td><Badge variant={student.sex === 'Male' ? 'primary' : 'purple'}>{student.sex || '—'}</Badge></td>
                    <td><Badge variant="graduated">🎓 {student.grade || 'Graduated'}</Badge></td>
                    <td><Badge variant="success">{student.program || student.programs || '—'}</Badge></td>
                    <td><Badge variant="warning">{student.section || '—'}</Badge></td>
                    <td><Badge variant="primary">{student.academicYear || selectedAcademicYear}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button onClick={() => onView(student)} style={{ padding: '5px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: '1px solid #bfdbfe', background: '#eff6ff', color: COLORS.accent }}>
                          <Icon d={ICONS.eye} size={11} /> View
                        </button>
                        {isSuperAdmin && (
                          <button onClick={() => onRestore(student)} style={{ padding: '5px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#15803d' }}>
                            <Icon d={ICONS.restore} size={11} /> Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};