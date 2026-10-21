// StudentCard.jsx
import React from 'react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Icon } from '../ManageStudent';
import { ICONS, COLORS } from './constants';

export const StudentCard = ({ student, getDisplayGrade, onView, onEdit, onGraduate, isSuperAdmin }) => {
  return (
    <div className="student-card" style={{ animation: `fadeInUp 0.3s ease` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Avatar name={student.name} image={student.profileImage} size={48} showOnline />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{student.name}</div>
          <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{student.studentId}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <Badge variant="primary" size="sm">{student.rollNumber || '—'}</Badge>
        <Badge variant="gradient" size="sm">{getDisplayGrade(student)}</Badge>
        <Badge variant="success" size="sm">{student.program || student.programs || '—'}</Badge>
        <Badge variant="warning" size="sm">{student.section || '—'}</Badge>
        <Badge variant="warning" size="sm">{student.ages || '—'}</Badge>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onView(student)} style={{ flex: 1, padding: '6px', borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: '1px solid #bfdbfe', background: '#eff6ff', color: COLORS.accent }}>
          <Icon d={ICONS.eye} size={11} /> View
        </button>
        <button onClick={() => onEdit(student)} style={{ flex: 1, padding: '6px', borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: '1px solid #fde68a', background: '#fefce8', color: '#92400e' }}>
          <Icon d={ICONS.edit} size={11} /> Edit
        </button>
        {isSuperAdmin && (
          <button onClick={() => onGraduate(student)} style={{ flex: 1, padding: '6px', borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: 'pointer', background: '#faf5ff', color: '#6d28d9', border: '1px solid #e9d5ff' }}>
            <Icon d={ICONS.graduation} size={11} /> Graduate
          </button>
        )}
      </div>
    </div>
  );
};