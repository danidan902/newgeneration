// StudentTable.jsx
import React from 'react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Icon } from '../ManageStudent';
import { ICONS, COLORS } from './constants';

export const StudentTable = ({ 
  students, 
  fetching, 
  studentsPerPage, 
  getDisplayGrade, 
  onView, 
  onEdit, 
  onGraduate, 
  onDelete, 
  isSuperAdmin,
  selectedAcademicYear,
}) => {
  if (fetching) {
    return (
      <div className="table-container">
        <div className="table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Grade</th>
                <th>Program</th>
                <th>Section</th>
                <th>Academic Year</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}><div className="skeleton" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎓</div>
        <h3>No Students Found</h3>
        <p>Add your first student to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Grade</th>
              <th>Program</th>
              <th>Section</th>
              <th>Academic Year</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student._id}>
                <td>{index + 1}</td>
                <td>
                  <div className="student-info">
                    <Avatar name={student.name} image={student.profileImage} size={32} />
                    <div className="student-details">
                      <div className="student-name">{student.name}</div>
                      <div className="student-email">{student.studentId}</div>
                    </div>
                  </div>
                </td>
                <td>{student.age || student.ages || '—'}</td>
                <td>{student.sex || '—'}</td>
                <td>
                  <span className="grade-badge">
                    {getDisplayGrade(student)}
                  </span>
                </td>
                <td>{student.program || student.programs || '—'}</td>
                <td>{student.section || '—'}</td>
                <td>{student.academicYear || selectedAcademicYear}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => onView(student)} className="action-btn view-btn" title="View">
                      <Icon d={ICONS.eye} size={14} />
                    </button>
                    <button onClick={() => onEdit(student)} className="action-btn edit-btn" title="Edit">
                      <Icon d={ICONS.edit} size={14} />
                    </button>
                    {isSuperAdmin && (
                      <button onClick={() => onGraduate(student)} className="action-btn graduate-btn" title="Graduate">
                        <Icon d={ICONS.graduation} size={14} />
                      </button>
                    )}
                    <button onClick={() => onDelete(student._id)} className="action-btn delete-btn" title="Delete">
                      <Icon d={ICONS.trash} size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .table-container {
          background: white;
         
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        // .table-wrapper {
        //   overflow-x: auto;
        //   overflow-y: auto;
        //   max-height: 200vh;
        // }

        .student-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          font-family: system-ui, -apple-system, sans-serif;
          min-width: 900px;
        }

        .student-table thead th {
          background: #4365ff;
          color: #ffffff;
          padding: 10px 14px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .student-table tbody td {
          padding: 8px 14px;
          border-bottom: 1px solid #cbd5e1;
          color: #1e293b;
          font-size: 12px;
          vertical-align: middle;
        }

        .student-table tbody tr:nth-child(even) td {
          background: #f8fafc;
        }

        .student-table tbody tr:hover td {
          background: #f1f5f9;
        }

        .student-table tbody tr:last-child td {
          border-bottom: none;
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .student-details {
          display: flex;
          flex-direction: column;
        }

        .student-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 12px;
        }

        .student-email {
          font-size: 11px;
          color: #64748b;
        }

        .grade-badge {
        
          color: black;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          display: inline-block;
        }

        .action-buttons {
          display: flex;
          gap: 4px;
          justify-content: center;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          background: transparent;
          color: #64748b;
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .view-btn:hover {
          background: #dbeafe;
          color: #2563eb;
        }

        .edit-btn:hover {
          background: #fef3c7;
          color: #d97706;
        }

        .graduate-btn:hover {
          background: #faf5ff;
          color: #7c3aed;
        }

        .delete-btn:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        /* Skeleton Loading */
        .skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          height: 14px;
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Scrollbar Styling */
        .table-wrapper::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .table-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .table-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .student-table td,
          .student-table th {
            padding: 6px 10px;
            font-size: 11px;
          }

          .student-email {
            display: none;
          }

          .action-btn {
            width: 24px;
            height: 24px;
          }

          .action-btn svg {
            width: 12px;
            height: 12px;
          }

          .grade-badge {
            font-size: 10px;
            padding: 2px 8px;
          }
        }
      `}</style>
    </div>
  );
};
