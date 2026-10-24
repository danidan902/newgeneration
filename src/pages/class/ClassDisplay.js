// components/ClassList.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  ChevronDown, ChevronUp, Edit2, Trash2, Users, BookOpen, User, Mail,
  Phone, Calendar, Award, Eye, X, GraduationCap, Archive, RefreshCw,
  Search, AlertCircle, UserCog, FileSpreadsheet, Printer, ChevronLeft, Plus,
  Home, School, MapPin, Clock, Trophy, BarChart3, CheckCircle, XCircle
} from 'lucide-react';
import AssignStudentsModal from './AssignStudentsModal';

// ============================================
// 📊 AVATAR COMPONENT
// ============================================
const Avatar = ({ name, image, size = 40 }) => {
  const [imageError, setImageError] = useState(false);

  if (image && !imageError) {
    return (
      <img
        src={image}
        alt={name}
        className="rounded-full object-cover border-2 border-cyan-200 flex-shrink-0"
        style={{ width: size, height: size }}
        onError={() => setImageError(true)}
      />
    );
  }

  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = ['#0e7490', '#0891b2', '#06b6d4', '#22d3ee', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];
  const colorIndex = (name?.length || 0) % colors.length;

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: colors[colorIndex],
        fontSize: `${size * 0.4}px`,
      }}
    >
      {initials}
    </div>
  );
};

// ============================================
// 📊 BADGE COMPONENT
// ============================================
const Badge = ({ text, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-cyan-100 text-cyan-700',
    green: 'bg-cyan-100 text-cyan-700',
    yellow: 'bg-gray-100 text-gray-700',
    red: 'bg-gray-100 text-gray-700',
    purple: 'bg-gray-100 text-gray-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${colorMap[color]}`}>
      {text}
    </span>
  );
};

// ============================================
// 📊 STUDENT DETAIL VIEW (Full Page)
// ============================================
const StudentDetailView = ({ student, onBack, onEdit, onGraduate }) => {
  if (!student) return null;

  const isGraduated = student.academicStatus === 'graduated' || student.grade === 'Graduated';

  const personalInfo = [
    { label: 'Full Name', value: student.name, icon: User },
    { label: 'Email', value: student.email, icon: Mail },
    { label: 'Gender', value: student.sex || '-', icon: Users },
    { label: 'Grade', value: student.grade || '-', icon: School },
    { label: 'Section', value: student.section || student.classSection || student.class || '-', icon: MapPin },
    { label: 'Program', value: student.programs || '-', icon: GraduationCap },
    { label: 'Roll Number', value: student.rollNumber || '-', icon: BookOpen },
    { label: 'Status', value: isGraduated ? 'Graduated' : 'Active', icon: CheckCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        .student-detail-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .detail-header {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        @media (min-width: 768px) {
          .detail-header { padding: 35px; margin-bottom: 30px; }
        }
        .detail-back-btn {
          background: white;
          color: #0e7490;
          border: 2px solid #0e7490;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .detail-back-btn:hover {
          background: #0e7490;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        .detail-info-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .detail-info-table th {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
          padding: 10px 12px;
          text-align: left;
          font-weight: 600;
          border: 1px solid #0c6a82;
          font-size: 13px;
        }
        .detail-info-table td {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
        }
        @media (min-width: 768px) {
          .detail-info-table th, .detail-info-table td { padding: 12px 16px; font-size: 14px; }
        }
        .detail-info-table tr:nth-child(even) td {
          background: #f8fafc;
        }
        .detail-info-table tr:hover td {
          background: #f0f9ff;
        }
      `}</style>

      <div className="student-detail-container">
        <button onClick={onBack} className="detail-back-btn mb-4 sm:mb-6">
          <ChevronLeft size={18} /> Back to Classes
        </button>

        <div className="detail-header">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <Avatar name={student.name} image={student.profileImage} size={90} />
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{student.name}</h2>
              <p className="text-cyan-100 mt-1 text-sm sm:text-base">Roll No: {student.rollNumber || 'N/A'}</p>
              <div className="flex gap-2 mt-2 flex-wrap justify-center sm:justify-start">
                <Badge text={isGraduated ? 'Graduated' : 'Active'} color={isGraduated ? 'purple' : 'green'} />
                {student.programs && <Badge text={student.programs} color={student.programs === 'Social' ? 'yellow' : 'green'} />}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <User className="text-cyan-600 flex-shrink-0" size={22} />
            Personal Information
          </h3>
          <div className="overflow-x-auto rounded-xl">
            <table className="detail-info-table min-w-[320px]">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {personalInfo.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <tr key={idx}>
                      <td className="font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <IconComponent className="text-cyan-600 flex-shrink-0" size={16} />
                          {item.label}
                        </div>
                      </td>
                      <td className="break-words">{item.value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {student.phone && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <Phone className="text-cyan-600 flex-shrink-0" size={22} />
              Contact Information
            </h3>
            <div className="overflow-x-auto rounded-xl">
              <table className="detail-info-table min-w-[320px]">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Phone className="text-cyan-600 flex-shrink-0" size={16} />
                        Phone
                      </div>
                    </td>
                    <td>{student.phone}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button onClick={() => onEdit(student)} className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold flex items-center justify-center gap-2 text-sm">
            <Edit2 size={18} /> Edit Student
          </button>
          {!isGraduated && (
            <button onClick={() => onGraduate(student)} className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2 text-sm">
              <GraduationCap size={18} /> Mark as Graduated
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📊 CLASS DETAIL VIEW
// ============================================
const ClassDetailView = ({ classData, onBack, teachers, onTeacherReassign, onMarkGraduated, onEditClass, onDeleteClass, onRestoreClass, onViewStudent }) => {
  const [showTeacherAssignModal, setShowTeacherAssignModal] = useState(false);
  const [teacherAssignData, setTeacherAssignData] = useState({
    subjectIndex: null,
    teacherId: ''
  });

  const handleTeacherAssign = (subjectIndex) => {
    const subject = classData.subjects?.[subjectIndex];
    if (!subject) return;

    setTeacherAssignData({
      subjectIndex: subjectIndex,
      teacherId: subject.teacher?._id || subject.teacher || ''
    });
    setShowTeacherAssignModal(true);
  };

  const handleTeacherReassignSubmit = () => {
    if (teacherAssignData.subjectIndex === null) {
      toast.error('Invalid data');
      return;
    }

    if (!teacherAssignData.teacherId) {
      toast.error('Please select a teacher');
      return;
    }

    onTeacherReassign(classData._id, teacherAssignData.subjectIndex, teacherAssignData.teacherId);
    setShowTeacherAssignModal(false);
    setTeacherAssignData({
      subjectIndex: null,
      teacherId: ''
    });
  };

  const isGraduated = classData.academicStatus === 'Graduated';

  const getSortedStudents = () => {
    if (!classData.students) return [];
    const activeStudents = classData.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated');
    return activeStudents.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });
  };

  const sortedStudents = getSortedStudents();

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      <style>{`
        .detail-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .detail-hero {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        @media (min-width: 768px) {
          .detail-hero { padding: 35px; margin-bottom: 30px; }
        }
        .detail-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        @media (min-width: 640px) {
          .detail-stats-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
        }
        .detail-stat-card {
          background: white;
          padding: 14px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          text-align: center;
          border-top: 4px solid #0891b2;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }
        .detail-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(8, 145, 178, 0.12);
        }
        .detail-stat-value { font-size: 20px; font-weight: 700; color: #0e7490; margin: 6px 0; word-break: break-word; }
        .detail-stat-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
        @media (min-width: 768px) {
          .detail-stat-value { font-size: 26px; }
          .detail-stat-label { font-size: 11px; }
        }
        .detail-subject-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 10px;
          transition: all 0.3s;
        }
        .detail-subject-card:hover {
          box-shadow: 0 4px 15px rgba(8, 145, 178, 0.1);
          border-color: #0891b2;
        }
        .detail-back-btn {
          background: white;
          color: #0e7490;
          border: 2px solid #0e7490;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .detail-back-btn:hover {
          background: #0e7490;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
      `}</style>

      <div className="detail-container">
        <button onClick={onBack} className="detail-back-btn mb-4 sm:mb-6">
          <ChevronLeft size={18} /> Back to Classes
        </button>

        <div className="detail-hero">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Class Details</h2>
              <p className="text-cyan-100 mt-1 text-sm sm:text-base">Grade {classData.grade} - Section {classData.section}</p>
            </div>
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              {!isGraduated && (
                <button onClick={() => onEditClass(classData)} className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold flex items-center justify-center gap-2 text-sm">
                  <Edit2 size={18} /> Edit Class
                </button>
              )}
              <button onClick={() => onDeleteClass(classData._id)} className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold flex items-center justify-center gap-2 text-sm">
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="detail-stats-grid">
          <div className="detail-stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="detail-stat-label">Program</div>
            <div className="detail-stat-value" style={{color: '#3b82f6'}}>{classData.program || 'N/A'}</div>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="detail-stat-label">Class Teacher</div>
            <div className="detail-stat-value" style={{color: '#8b5cf6', fontSize: '16px'}}>{classData.classTeacher?.name || 'Not assigned'}</div>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#10b981'}}>
            <div className="detail-stat-label">Total Students</div>
            <div className="detail-stat-value" style={{color: '#10b981'}}>{sortedStudents.length}</div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <BookOpen className="text-cyan-600 flex-shrink-0" size={22} />
            Subjects
          </h3>
          {classData.subjects && classData.subjects.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {classData.subjects.map((subject, idx) => (
                <div key={idx} className="detail-subject-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-base sm:text-lg break-words">{subject.name}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">Teacher: <span className="font-semibold">{subject.teacher?.name || 'Not assigned'}</span></p>
                  </div>
                  {!isGraduated && (
                    <button
                      onClick={() => handleTeacherAssign(idx)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      <UserCog size={16} /> Reassign
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No subjects assigned</p>
          )}
        </div>

        {/* Students Section */}
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <Users className="text-cyan-600 flex-shrink-0" size={22} />
            Enrolled Students ({sortedStudents.length})
          </h3>
          {sortedStudents.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sortedStudents.map((student) => (
                <div key={student._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-cyan-50 transition border border-gray-200">
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <Avatar name={student.name} image={student.profileImage} size={35} />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{student.name}</p>
                      <p className="text-xs text-gray-600">Roll: {student.rollNumber || '-'}</p>
                    </div>
                  </div>
                  {!isGraduated && (
                    <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                      <button onClick={() => onViewStudent(student)} className="flex-1 sm:flex-initial px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition text-xs font-medium flex items-center justify-center gap-1">
                        <Eye size={14} /> View
                      </button>
                      <button onClick={() => onMarkGraduated(student)} className="flex-1 sm:flex-initial px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs font-medium flex items-center justify-center gap-1">
                        <GraduationCap size={14} /> Graduate
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No active students enrolled</p>
          )}
        </div>

        {/* Teacher Re-assignment Modal */}
        {showTeacherAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 modal-backdrop">
            <div className="bg-white rounded-2xl p-4 sm:p-8 w-full max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto modal-content">
              <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Reassign Teacher</h3>
                <button onClick={() => { setShowTeacherAssignModal(false); setTeacherAssignData({ subjectIndex: null, teacherId: '' }); }} className="text-gray-500 hover:text-gray-700 flex-shrink-0">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select New Teacher <span className="text-red-500">*</span></label>
                <select
                  value={teacherAssignData.teacherId}
                  onChange={(e) => setTeacherAssignData({ ...teacherAssignData, teacherId: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                >
                  <option value="">Select a teacher...</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button onClick={() => { setShowTeacherAssignModal(false); setTeacherAssignData({ subjectIndex: null, teacherId: '' }); }} className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">
                  Cancel
                </button>
                <button onClick={handleTeacherReassignSubmit} disabled={!teacherAssignData.teacherId} className="w-full sm:w-auto px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 font-semibold flex items-center justify-center gap-2">
                  <UserCog size={18} /> Reassign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 📊 ASSIGN STUDENTS VIEW
// ============================================
const AssignStudentsView = ({ classData, students, classes, onBack, onStudentsAssigned }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterProgram, setFilterProgram] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 80;

  const isStudentAssignedToAnyClass = (studentId) => {
    for (const cls of classes) {
      if (cls.students?.some(s => (s._id || s) === studentId)) {
        return true;
      }
    }
    return false;
  };

  const isStudentInClass = (studentId) => {
    return classData.students?.some(s => (s._id || s) === studentId);
  };

  const getFilteredStudents = () => {
    let filtered = students.filter(s => {
      if (s.academicStatus === 'graduated' || s.grade === 'Graduated') {
        return false;
      }
      
      const studentSection = s.section || s.classSection || s.class;
      if (studentSection !== classData.section) {
        return false;
      }

      if (isStudentInClass(s._id)) {
        return false;
      }

      if (isStudentAssignedToAnyClass(s._id)) {
        return false;
      }

      return true;
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.rollNumber?.toString().includes(term)
      );
    }

    if (filterProgram) {
      filtered = filtered.filter(s => {
        const studentProgram = s.programs || s.program || s.programName || '';
        return studentProgram.trim().toLowerCase() === filterProgram.toLowerCase().trim();
      });
    }

    if (filterGrade) {
      filtered = filtered.filter(s => String(s.grade) === String(filterGrade));
    }

    filtered.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });

    return filtered;
  };

  const filteredStudents = getFilteredStudents();
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const studentId of selectedStudents) {
        const student = students.find(s => s._id === studentId);
        
        if (isStudentAssignedToAnyClass(studentId)) {
          errorCount++;
          toast.error(`${student?.name} is already assigned to another class`);
          continue;
        }

        if (isStudentInClass(studentId)) {
          errorCount++;
          toast.error(`${student?.name} is already in this class`);
          continue;
        }

        const studentSection = student?.section || student?.classSection || student?.class;
        if (studentSection !== classData.section) {
          errorCount++;
          toast.error(`${student?.name} is from section ${studentSection}, but class is section ${classData.section}`);
          continue;
        }

        try {
          await api.post('/classes/add-student', {
            classId: classData._id,
            studentId: studentId
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Error assigning student:', error);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully assigned ${successCount} student(s)`);
        setSelectedStudents([]);
        onStudentsAssigned();
      }

      if (errorCount > 0) {
        toast.error(`Failed to assign ${errorCount} student(s)`);
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error('Failed to assign students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      <style>{`
        .assign-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .assign-header {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        @media (min-width: 768px) {
          .assign-header { padding: 30px; margin-bottom: 30px; }
        }
        .assign-back-btn {
          background: white;
          color: #0e7490;
          border: 2px solid #0e7490;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .assign-back-btn:hover {
          background: #0e7490;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
      `}</style>

      <div className="assign-container">
        <button onClick={onBack} className="assign-back-btn mb-4 sm:mb-6">
          <ChevronLeft size={18} /> Back to Classes
        </button>

        <div className="assign-header">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Assign Students</h2>
              <p className="text-cyan-100 mt-1 text-sm sm:text-base">
                <span className="font-semibold">Grade {classData.grade}</span> - 
                <span className="font-semibold ml-1">Section {classData.section}</span>
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-2">
                <p className="text-xs sm:text-sm text-cyan-100">
                  <Users size={14} className="inline mr-1" /> 
                  Currently enrolled: <span className="font-semibold">{classData.students?.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length || 0}</span> students
                </p>
                <p className="text-xs sm:text-sm text-cyan-100">
                  <Users size={14} className="inline mr-1" /> 
                  Available: <span className="font-semibold">{filteredStudents.length}</span> students
                </p>
              </div>
            </div>
            <button
              onClick={handleAssignStudents}
              disabled={selectedStudents.length === 0 || loading}
              className="w-full md:w-auto px-5 sm:px-6 py-3 bg-white text-cyan-700 rounded-lg hover:bg-cyan-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 shadow-lg text-sm"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Assigning...
                </>
              ) : (
                <>
                  <Users size={18} /> Assign Selected ({selectedStudents.length})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filter — responsive grid */}
        <div className="bg-white border-2 border-cyan-200 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            <div className="relative sm:col-span-2 md:col-span-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
              />
            </div>
            <select
              value={filterProgram}
              onChange={(e) => {
                setFilterProgram(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 sm:px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none bg-white transition"
            >
              <option value="">All Programs</option>
              <option value="Social Science">Social Science</option>
              <option value="Natural Science">Natural Science</option>
            </select>
            <select
              value={filterGrade}
              onChange={(e) => {
                setFilterGrade(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 sm:px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none bg-white transition"
            >
              <option value="">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>
          <div className="mt-3 text-xs sm:text-sm text-cyan-700">
            Found <span className="font-semibold">{filteredStudents.length}</span> available students
            {filterProgram && ` • Program: ${filterProgram}`}
            {filterGrade && ` • Grade: ${filterGrade}`}
            {searchTerm && ` • Search: "${searchTerm}"`}
          </div>
        </div>

        {/* Student Table */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-10 sm:py-12 bg-cyan-50 rounded-xl border-2 border-cyan-200">
            <Users size={40} className="mx-auto text-cyan-400 mb-3 sm:mb-4" />
            <p className="text-cyan-800 text-base sm:text-lg font-semibold">No available students found</p>
            <p className="text-cyan-600 text-xs sm:text-sm mt-2 px-4">
              {filterProgram || filterGrade ? (
                <>No students match the selected filters</>
              ) : (
                <>All students are already assigned to classes.</>
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="border-2 border-cyan-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead className="bg-gradient-to-r from-cyan-600 to-cyan-700">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center w-12">
                        <input
                          type="checkbox"
                          checked={currentStudents.length > 0 && currentStudents.every(s => selectedStudents.includes(s._id))}
                          onChange={() => {
                            const allIds = currentStudents.map(s => s._id);
                            const allSelected = allIds.every(id => selectedStudents.includes(id));
                            if (allSelected) {
                              setSelectedStudents(prev => prev.filter(id => !allIds.includes(id)));
                            } else {
                              setSelectedStudents(prev => [...prev, ...allIds.filter(id => !prev.includes(id))]);
                            }
                          }}
                          className="w-4 h-4 text-cyan-600 rounded border-gray-300"
                        />
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-white font-semibold text-xs sm:text-sm">Roll No</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-white font-semibold text-xs sm:text-sm">Student</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-white font-semibold text-xs sm:text-sm">Grade</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-white font-semibold text-xs sm:text-sm">Section</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-white font-semibold text-xs sm:text-sm">Program</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-white font-semibold text-xs sm:text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student, index) => {
                      const isSelected = selectedStudents.includes(student._id);
                      return (
                        <tr 
                          key={student._id} 
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-cyan-50'} hover:bg-cyan-100 transition`}
                        >
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudentSelection(student._id)}
                              className="w-4 h-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500"
                            />
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">
                            {student.rollNumber || '-'}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <Avatar name={student.name} image={student.profileImage} size={32} />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{student.name}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{student.email || 'No email'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs sm:text-sm font-semibold whitespace-nowrap">
                              {student.grade || '-'}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs sm:text-sm font-semibold whitespace-nowrap">
                              {student.section || student.classSection || student.class || '-'}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className="px-2 py-1 rounded text-xs sm:text-sm font-semibold whitespace-nowrap bg-gray-100 text-gray-700">
                              {student.programs || student.program || '-'}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                            <span className="px-2 sm:px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                              ✅ Available
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-5 sm:mt-6">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 border-2 border-cyan-300 text-cyan-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-50 transition font-semibold text-sm"
                >
                  Previous
                </button>
                <span className="px-3 sm:px-4 py-2 font-semibold text-cyan-700 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 border-2 border-cyan-300 text-cyan-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-50 transition font-semibold text-sm"
                >
                  Next
                </button>
              </div>
            )}

            <div className="mt-4 text-center text-xs sm:text-sm text-cyan-700">
              <span className="font-semibold">{selectedStudents.length}</span> student(s) selected for assignment
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================
// 📊 MAIN CLASS LIST COMPONENT
// ============================================

const ClassList = ({ onEditClass }) => {
  const [classes, setClasses] = useState([]);
  const [graduatedClasses, setGraduatedClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [graduatedStudents, setGraduatedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditStudentForm, setShowEditStudentForm] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    sex: '',
    grade: '',
    section: '',
    programs: ''
  });
  const [bulkAssignData, setBulkAssignData] = useState({ classId: '', file: null });
  const [expandedClass, setExpandedClass] = useState(null);
  const [expandedGraduatedClass, setExpandedGraduatedClass] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const [currentView, setCurrentView] = useState('list');
  const [selectedClassData, setSelectedClassData] = useState(null);
  const [selectedStudentData, setSelectedStudentData] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [currentPage, setCurrentPage] = useState(1);
  const [classesPerPage] = useState(50);
  const [studentPage, setStudentPage] = useState({});
  const [graduatedStudentPage, setGraduatedStudentPage] = useState({});
  const [studentsPerPage] = useState(50);
  const [graduatedClassPage, setGraduatedClassPage] = useState(1);
  const [graduatedClassPerPage] = useState(50);
  const [graduatedStudentListPage, setGraduatedStudentListPage] = useState(1);
  const [graduatedStudentListPerPage] = useState(50);

  const [showTeacherAssignModal, setShowTeacherAssignModal] = useState(false);
  const [teacherAssignData, setTeacherAssignData] = useState({
    classId: null,
    subjectIndex: null,
    teacherId: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await fetchClasses();
    await fetchTeachers();
    await fetchStudents();
  };

  const fetchClasses = async () => {
    try {
      const studentsResponse = await api.get('/users/role/student');
      const allStudents = studentsResponse.data;

      const graduatedStudentsList = allStudents.filter(s => s.academicStatus === 'graduated' || s.grade === 'Graduated');
      const activeStudentsList = allStudents.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated');

      setGraduatedStudents(graduatedStudentsList);
      setStudents(activeStudentsList);

      const response = await api.get('/classes/all');
      if (response.data && Array.isArray(response.data)) {
        const classesWithFullData = await Promise.all(response.data.map(async (cls) => {
          if (cls.students && cls.students.length > 0) {
            const fullStudents = cls.students.map(student => {
              const studentId = student._id || student;
              const fullStudent = allStudents.find(s => s._id === studentId);
              return {
                ...(fullStudent || student),
                profileImage: fullStudent?.profileImage || student?.profileImage || null
              };
            });
            return { ...cls, students: fullStudents };
          }
          return cls;
        }));

        const active = classesWithFullData
          .filter(cls => cls.academicStatus !== 'Graduated')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const graduated = classesWithFullData.filter(cls => cls.academicStatus === 'Graduated');

        setClasses(active);
        setGraduatedClasses(graduated);
      } else {
        setClasses([]);
        setGraduatedClasses([]);
      }
    } catch (error) {
      console.error('Fetch classes error:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch classes');
      }
      setClasses([]);
      setGraduatedClasses([]);
    }
  };

  const isStudentAlreadyAssigned = (studentId, currentClassId = null) => {
    for (const cls of classes) {
      if (currentClassId && cls._id === currentClassId) continue;
      if (cls.students?.some(s => (s._id || s) === studentId)) {
        return { assigned: true, className: `Grade ${cls.grade} - Section ${cls.section}` };
      }
    }
    return { assigned: false, className: null };
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/users/role/teacher');
      setTeachers(response.data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users/role/student');
      const allStudents = response.data;

      const graduated = allStudents.filter(s => s.academicStatus === 'graduated' || s.grade === 'Graduated');
      const active = allStudents.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated');

      setGraduatedStudents(graduated);
      setStudents(active);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await api.delete(`/classes/${id}`);
        toast.success('Class deleted successfully');
        await fetchClasses();
        if (currentView === 'detail') {
          setCurrentView('list');
          setSelectedClassData(null);
        }
      } catch (error) {
        console.error('Delete class error:', error);
        toast.error('Failed to delete class');
      }
    }
  };

  const handleTeacherReassign = async (classId, subjectIndex, teacherId) => {
    setLoading(true);
    try {
      const cls = classes.find(c => c._id === classId);
      if (!cls) {
        toast.error('Class not found');
        setLoading(false);
        return;
      }

      const updatedSubjects = cls.subjects.map((sub, index) => {
        if (index === subjectIndex) {
          return { ...sub, teacher: teacherId };
        }
        return sub;
      });

      await api.put(`/classes/${classId}`, {
        ...cls,
        subjects: updatedSubjects
      });

      toast.success('Teacher reassigned successfully!');
      await fetchClasses();
      const updatedClass = classes.find(c => c._id === classId);
      if (updatedClass) {
        setSelectedClassData(updatedClass);
      }
    } catch (error) {
      console.error('Teacher reassign error:', error);
      toast.error(error.response?.data?.error || 'Failed to reassign teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentFormData({
      name: student.name || '',
      email: student.email || '',
      rollNumber: student.rollNumber || '',
      sex: student.sex || '',
      grade: student.grade || '',
      section: student.section || student.classSection || student.class || '',
      programs: student.programs || ''
    });
    setShowEditStudentForm(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/users/${editingStudent._id}`, studentFormData);
      toast.success('Student updated successfully');
      setShowEditStudentForm(false);
      setEditingStudent(null);
      setStudentFormData({
        name: '',
        email: '',
        rollNumber: '',
        sex: '',
        grade: '',
        section: '',
        programs: ''
      });
      await fetchStudents();
      await fetchClasses();
    } catch (error) {
      console.error('Update student error:', error);
      toast.error(error.response?.data?.error || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (classId, studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the class?')) return;

    setLoading(true);
    try {
      await api.post('/classes/bulk-remove-students', {
        classId: classId,
        studentIds: [studentId]
      });

      toast.success('Student removed from class successfully');
      await fetchClasses();
    } catch (error) {
      console.error('Remove student error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove student');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMultipleStudents = async (classId, studentIds) => {
    if (!window.confirm(`Are you sure you want to remove ${studentIds.length} student(s) from this class?`)) return;

    setLoading(true);
    try {
      await api.post('/classes/bulk-remove-students', {
        classId: classId,
        studentIds: studentIds
      });

      toast.success(`Removed ${studentIds.length} student(s) from class`);
      await fetchClasses();
    } catch (error) {
      console.error('Bulk remove error:', error);
      toast.error('Failed to remove students');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async (e) => {
    e.preventDefault();
    if (!bulkAssignData.classId || !bulkAssignData.file) {
      toast.error('Please select a class and file');
      return;
    }

    setLoading(true);
    const file = bulkAssignData.file;
    const fileType = file.name.split('.').pop().toLowerCase();

    const processAssignments = async (studentsList) => {
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      const selectedClassData = classes.find(c => c._id === bulkAssignData.classId);

      for (const studentItem of studentsList) {
        const rollNumber = studentItem.rollNumber || studentItem.rollnumber || studentItem.roll_no;

        if (!rollNumber) {
          errorCount++;
          errors.push('Missing roll number');
          continue;
        }

        const student = students.find(s => String(s.rollNumber) === String(rollNumber));

        if (!student) {
          errorCount++;
          errors.push(`Student with roll number ${rollNumber} not found`);
          continue;
        }

        const studentSection = student.section || student.classSection || student.class;
        const classSection = selectedClassData?.section;

        const alreadyAssigned = isStudentAlreadyAssigned(student._id, selectedClassData?._id);
        if (alreadyAssigned.assigned) {
          errorCount++;
          errors.push(`${rollNumber}: Student ${student.name} is already assigned to class ${alreadyAssigned.className}`);
          continue;
        }

        if (selectedClassData && studentSection && classSection && studentSection !== classSection) {
          errorCount++;
          errors.push(`${rollNumber}: Student from section "${studentSection}" cannot be assigned to class section "${classSection}"`);
          continue;
        }

        try {
          await api.post('/classes/add-student', {
            classId: bulkAssignData.classId,
            studentId: student._id
          });
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(`${rollNumber}: ${error.response?.data?.error || error.message}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully assigned ${successCount} students`);
        fetchClasses();
      }

      if (errorCount > 0) {
        toast.error(`Failed to assign ${errorCount} students`);
        console.error('Bulk assignment errors:', errors);
      }

      setLoading(false);
      setShowBulkAssign(false);
      setBulkAssignData({ classId: '', file: null });
    };

    if (fileType === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          await processAssignments(results.data);
        },
        error: () => {
          toast.error('Error parsing CSV file');
          setLoading(false);
        }
      });
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        await processAssignments(jsonData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Please upload CSV or Excel file');
      setLoading(false);
    }
  };

  const handleMarkClassAsGraduated = async (cls) => {
    if (String(cls.grade) !== '12') {
      toast.error('Only Grade 12 classes can be marked as graduated');
      return;
    }

    if (!window.confirm(`Are you sure you want to mark Grade ${cls.grade} - Section ${cls.section} as graduated?`)) return;

    setLoading(true);
    try {
      await api.put(`/classes/${cls._id}/graduate`);
      toast.success(`Class Grade ${cls.grade} - Section ${cls.section} marked as graduated`);
      await fetchAllData();
      if (currentView === 'detail') {
        setCurrentView('list');
        setSelectedClassData(null);
      }
    } catch (error) {
      console.error('Error marking class as graduated:', error);
      toast.error(error.response?.data?.error || 'Failed to mark class as graduated');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreGraduatedClass = async (cls) => {
    if (!window.confirm(`Are you sure you want to restore Grade ${cls.grade} - Section ${cls.section} as an active class?`)) return;

    setLoading(true);
    try {
      await api.put(`/classes/${cls._id}/restore`);
      toast.success(`Class Grade ${cls.grade} - Section ${cls.section} restored to active classes`);
      await fetchAllData();
    } catch (error) {
      console.error('Error restoring class:', error);
      toast.error('Failed to restore class');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsGraduated = async (student) => {
    if (!window.confirm(`Are you sure you want to mark ${student.name} as graduated?`)) return;

    setLoading(true);
    try {
      for (const cls of classes) {
        if (cls.students?.some(s => s._id === student._id)) {
          await api.post('/classes/bulk-remove-students', {
            classId: cls._id,
            studentIds: [student._id]
          });
        }
      }

      await api.put(`/users/${student._id}`, { ...student, academicStatus: 'graduated', grade: 'Graduated' });

      toast.success(`${student.name} marked as graduated`);
      await fetchStudents();
      await fetchClasses();
      if (selectedClassData) {
        const updatedClass = classes.find(c => c._id === selectedClassData._id);
        if (updatedClass) {
          setSelectedClassData(updatedClass);
        }
      }
      if (currentView === 'student') {
        setCurrentView('list');
        setSelectedStudentData(null);
      }
    } catch (error) {
      console.error('Error marking as graduated:', error);
      toast.error('Failed to mark student as graduated');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromGraduated = async (student) => {
    if (!window.confirm(`Are you sure you want to restore ${student.name} as an active student?`)) return;

    setLoading(true);
    try {
      await api.put(`/users/${student._id}`, { ...student, academicStatus: 'Active', grade: '12' });
      toast.success(`${student.name} restored as active student`);
      await fetchStudents();
      await fetchClasses();
    } catch (error) {
      console.error('Error restoring student:', error);
      toast.error('Failed to restore student');
    } finally {
      setLoading(false);
    }
  };

  const openClassDetail = (cls) => {
    setSelectedClassData(cls);
    setCurrentView('detail');
  };

  const openAssignStudents = (cls) => {
    setSelectedClassData(cls);
    setCurrentView('assign');
  };

  const goBackToList = () => {
    setCurrentView('list');
    setSelectedClassData(null);
    setSelectedStudentData(null);
  };

  const openStudentDetail = (student) => {
    setSelectedStudentData(student);
    setCurrentView('student');
  };

  const handleStudentsAssigned = () => {
    fetchClasses();
    if (selectedClassData) {
      const updatedClass = classes.find(c => c._id === selectedClassData._id);
      if (updatedClass) {
        setSelectedClassData(updatedClass);
      }
    }
  };

  const toggleDropdown = (classId) => {
    setExpandedClass(expandedClass === classId ? null : classId);
    if (expandedClass !== classId) {
      setStudentPage(prev => ({ ...prev, [classId]: 1 }));
    }
  };

  const toggleGraduatedDropdown = (classId) => {
    setExpandedGraduatedClass(expandedGraduatedClass === classId ? null : classId);
    if (expandedGraduatedClass !== classId) {
      setGraduatedStudentPage(prev => ({ ...prev, [classId]: 1 }));
    }
  };

  const isGrade12 = (grade) => {
    return String(grade) === '12';
  };

  const getFilteredAndSortedClasses = () => {
    let filtered = [...classes];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cls =>
        cls.grade?.toString().toLowerCase().includes(term) ||
        cls.section?.toLowerCase().includes(term) ||
        cls.program?.toLowerCase().includes(term) ||
        cls.classTeacher?.name?.toLowerCase().includes(term)
      );
    }

    if (filterGrade) {
      filtered = filtered.filter(cls => String(cls.grade) === String(filterGrade));
    }

    if (filterProgram) {
      if (filterProgram === 'Natural') {
        filtered = filtered.filter(cls => 
          cls.program && cls.program.toLowerCase() === 'natural'
        );
      } else if (filterProgram === 'Social') {
        filtered = filtered.filter(cls => 
          cls.program && cls.program.toLowerCase() === 'social'
        );
      }
    }

    if (filterSection) {
      filtered = filtered.filter(cls => cls.section?.toLowerCase().includes(filterSection.toLowerCase()));
    }

    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'grade') {
      filtered.sort((a, b) => Number(a.grade) - Number(b.grade));
    }

    return filtered;
  };

  const filteredActiveClasses = getFilteredAndSortedClasses();

  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = filteredActiveClasses.slice(indexOfFirstClass, indexOfLastClass);
  const totalPages = Math.ceil(filteredActiveClasses.length / classesPerPage);

  const indexOfLastGClass = graduatedClassPage * graduatedClassPerPage;
  const indexOfFirstGClass = indexOfLastGClass - graduatedClassPerPage;
  const currentGraduatedClasses = graduatedClasses.slice(indexOfFirstGClass, indexOfLastGClass);
  const totalGClassPages = Math.ceil(graduatedClasses.length / graduatedClassPerPage);

  const indexOfLastGStudent = graduatedStudentListPage * graduatedStudentListPerPage;
  const indexOfFirstGStudent = indexOfLastGStudent - graduatedStudentListPerPage;
  const currentGraduatedStudents = graduatedStudents.slice(indexOfFirstGStudent, indexOfLastGStudent);
  const totalGStudentPages = Math.ceil(graduatedStudents.length / graduatedStudentListPerPage);

  const getCurrentStudents = (classId) => {
    const cls = classes.find(c => c._id === classId);
    if (!cls || !cls.students) return [];
    const activeStudentsInClass = cls.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated');
    activeStudentsInClass.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });
    const currentStudentPage = studentPage[classId] || 1;
    const indexOfLastStudent = currentStudentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    return activeStudentsInClass.slice(indexOfFirstStudent, indexOfLastStudent);
  };

  const getTotalStudentPages = (classId) => {
    const cls = classes.find(c => c._id === classId);
    if (!cls || !cls.students) return 1;
    const activeCount = cls.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length;
    return Math.ceil(activeCount / studentsPerPage);
  };

  const getGraduatedClassStudents = (classId) => {
    const cls = graduatedClasses.find(c => c._id === classId);
    if (!cls || !cls.students) return [];

    const studentsWithFullData = cls.students.map(student => {
      const studentId = student._id || student;
      const fullStudent = graduatedStudents.find(s => s._id === studentId);
      if (fullStudent) {
        return fullStudent;
      }
      const activeStudent = students.find(s => s._id === studentId);
      if (activeStudent && (activeStudent.academicStatus === 'graduated' || activeStudent.grade === 'Graduated')) {
        return activeStudent;
      }
      return student;
    });

    studentsWithFullData.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });

    const currentPageNum = graduatedStudentPage[classId] || 1;
    const indexOfLast = currentPageNum * studentsPerPage;
    const indexOfFirst = indexOfLast - studentsPerPage;
    return studentsWithFullData.slice(indexOfFirst, indexOfLast);
  };

  const getTotalGraduatedClassStudentPages = (classId) => {
    const cls = graduatedClasses.find(c => c._id === classId);
    if (!cls || !cls.students) return 1;
    return Math.ceil(cls.students.length / studentsPerPage);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterGrade('');
    setFilterProgram('');
    setFilterSection('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // ============================================
  // 📊 RENDER BASED ON CURRENT VIEW
  // ============================================

  if (currentView === 'detail' && selectedClassData) {
    return (
      <ClassDetailView
        classData={selectedClassData}
        onBack={goBackToList}
        teachers={teachers}
        onTeacherReassign={handleTeacherReassign}
        onMarkGraduated={handleMarkAsGraduated}
        onEditClass={onEditClass}
        onDeleteClass={handleDelete}
        onRestoreClass={handleRestoreGraduatedClass}
        onViewStudent={openStudentDetail}
      />
    );
  }

  if (currentView === 'assign' && selectedClassData) {
    return (
      <AssignStudentsView
        classData={selectedClassData}
        students={students}
        classes={classes}
        onBack={goBackToList}
        onStudentsAssigned={handleStudentsAssigned}
      />
    );
  }

  if (currentView === 'student' && selectedStudentData) {
    return (
      <StudentDetailView
        student={selectedStudentData}
        onBack={goBackToList}
        onEdit={handleEditStudent}
        onGraduate={handleMarkAsGraduated}
      />
    );
  }

  // ============================================
  // 📊 MAIN LIST VIEW WITH CARD DESIGN
  // ============================================

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .manage-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .manage-hero {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        @media (min-width: 768px) {
          .manage-hero { padding: 35px; margin-bottom: 30px; }
        }
        .manage-hero-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; margin-bottom: 8px; }
        .manage-hero-subtitle { font-size: 13px; opacity: 0.9; }
        @media (min-width: 768px) {
          .manage-hero-title { font-size: 36px; margin-bottom: 10px; }
          .manage-hero-subtitle { font-size: 16px; }
        }
        
        .manage-filter-box {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 20px;
          transition: all 0.3s;
        }
        @media (min-width: 768px) {
          .manage-filter-box { padding: 20px; margin-bottom: 24px; }
        }
        .manage-filter-box:focus-within {
          border-color: #0891b2;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }
        
        .manage-tab-btn {
          padding: 8px 14px;
          border-radius: 8px 8px 0 0;
          font-weight: 600;
          font-size: 12px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #6b7280;
          border-bottom: 3px solid transparent;
        }
        @media (min-width: 768px) {
          .manage-tab-btn { padding: 10px 20px; font-size: 14px; }
        }
        .manage-tab-btn:hover {
          color: #1f2937;
          background: #f3f4f6;
        }
        .manage-tab-btn-active {
          background: white;
          color: #0e7490;
          border-bottom: 3px solid #0e7490;
        }
        .manage-tab-btn-active .tab-badge {
          background: #0e7490;
          color: white;
        }
        
        .tab-badge {
          display: inline-block;
          padding: 1px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 700;
          margin-left: 6px;
          background: #e2e8f0;
          color: #475569;
        }
        @media (min-width: 768px) {
          .tab-badge { font-size: 11px; }
        }
        
        /* Class Card Styles */
        .class-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 14px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
          margin-bottom: 14px;
        }
        @media (min-width: 768px) {
          .class-card { padding: 24px; margin-bottom: 20px; }
        }
        .class-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0e7490, #22d3ee);
        }
        .class-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(8, 145, 178, 0.15);
          border-color: #0891b2;
        }
        
        .class-card-graduated {
          border-color: #cbd5e1;
        }
        .class-card-graduated::before {
          background: linear-gradient(90deg, #64748b, #94a3b8);
        }
        .class-card-graduated:hover {
          border-color: #64748b;
          box-shadow: 0 12px 30px rgba(100, 116, 139, 0.15);
        }
        
        .class-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
          flex-shrink: 0;
        }
        @media (min-width: 768px) {
          .class-icon-box { width: 56px; height: 56px; font-size: 28px; }
        }
        .class-icon-box-graduated {
          background: linear-gradient(135deg, #64748b, #94a3b8);
        }
        
        .class-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin: 12px 0;
        }
        @media (min-width: 640px) {
          .class-stats-grid { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin: 16px 0; }
        }
        .class-stat-item {
          background: #f8fafc;
          padding: 10px 12px;
          border-radius: 10px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }
        @media (min-width: 768px) {
          .class-stat-item { padding: 12px 16px; }
        }
        .class-stat-number {
          font-size: 18px;
          font-weight: 700;
          color: #0e7490;
        }
        @media (min-width: 768px) {
          .class-stat-number { font-size: 22px; }
        }
        .class-stat-label {
          font-size: 9px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        @media (min-width: 768px) {
          .class-stat-label { font-size: 10px; }
        }
        
        .class-action-btn {
          padding: 6px 10px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 11px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .class-action-btn { padding: 8px 16px; font-size: 13px; gap: 6px; }
        }
        .class-action-btn:hover {
          transform: translateY(-2px);
        }
        
        .btn-primary-class {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
        }
        .btn-primary-class:hover {
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        
        .btn-success-class {
          background: #0891b2;
          color: white;
        }
        .btn-success-class:hover {
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        
        .btn-warning-class {
          background: #0e7490;
          color: white;
        }
        .btn-warning-class:hover {
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        
        .btn-danger-class {
          background: #475569;
          color: white;
        }
        .btn-danger-class:hover {
          box-shadow: 0 6px 20px rgba(71, 85, 105, 0.3);
        }
        
        .btn-purple-class {
          background: #0e7490;
          color: white;
        }
        .btn-purple-class:hover {
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        
        .btn-gray-class {
          background: #e2e8f0;
          color: #475569;
        }
        .btn-gray-class:hover {
          background: #cbd5e1;
        }
        
        .btn-add-class {
          background: white;
          color: #0e7490;
          border: 2px solid white;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          width: 100%;
          justify-content: center;
        }
        @media (min-width: 640px) {
          .btn-add-class { padding: 12px 28px; font-size: 14px; width: auto; }
        }
        .btn-add-class:hover {
          background: rgba(255,255,255,0.15);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255,255,255,0.2);
        }
        
        .student-table-container {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          margin-top: 16px;
        }
        .student-table-header {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
        }
        .student-table-header th {
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          border: 1px solid #0c6a82;
          white-space: nowrap;
        }
        @media (min-width: 768px) {
          .student-table-header th { padding: 10px 14px; font-size: 12px; }
        }
        .student-table-row td {
          padding: 6px 10px;
          border: 1px solid #e2e8f0;
          font-size: 12px;
        }
        @media (min-width: 768px) {
          .student-table-row td { padding: 8px 14px; font-size: 13px; }
        }
        .student-table-row:nth-child(even) td {
          background: #f8fafc;
        }
        .student-table-row:hover td {
          background: #f0f9ff;
        }
        
        .modal-backdrop {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
        }
        .modal-content {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .badge-program {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-social { background: #e2e8f0; color: #475569; }
        .badge-natural { background: #cffafe; color: #0e7490; }
        .badge-graduated { background: #e2e8f0; color: #475569; }
        .badge-active { background: #cffafe; color: #0e7490; }
        
        .search-input-wrapper {
          position: relative;
        }
        .search-input-wrapper input {
          width: 100%;
          padding: 10px 16px 10px 42px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.3s;
          font-size: 13px;
        }
        @media (min-width: 768px) {
          .search-input-wrapper input { font-size: 14px; }
        }
        .search-input-wrapper input:focus {
          border-color: #0891b2;
          outline: none;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
      `}</style>

      <div className="manage-container">
        {/* ========== HERO SECTION ========== */}
        <div className="manage-hero">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0">
              <h2 className="manage-hero-title">📚 Manage Classes</h2>
              <p className="manage-hero-subtitle">View and manage all classes and student enrollments</p>
            </div>
            <button
              onClick={() => onEditClass(null)}
              className="btn-add-class"
            >
              <Plus size={18} /> Add New Class
            </button>
          </div>
        </div>

        {/* ========== TABS ========== */}
        <div className="flex gap-1 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('active');
              setCurrentPage(1);
              setExpandedClass(null);
              clearFilters();
            }}
            className={`manage-tab-btn ${activeTab === 'active' ? 'manage-tab-btn-active' : ''}`}
          >
            <BookOpen size={16} className="inline mr-1.5" />
            Active Classes
            <span className="tab-badge">{classes.length}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('graduated');
              setGraduatedClassPage(1);
              setExpandedGraduatedClass(null);
            }}
            className={`manage-tab-btn ${activeTab === 'graduated' ? 'manage-tab-btn-active' : ''}`}
          >
            <Archive size={16} className="inline mr-1.5" />
            Graduated Classes
            <span className="tab-badge">{graduatedClasses.length}</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* ========== ACTIVE CLASSES TAB ========== */}
        {/* ========================================================= */}
        {activeTab === 'active' && (
          <>
            {/* Filter Box — responsive grade/program/section/sort */}
            <div className="manage-filter-box">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
                <div className="search-input-wrapper sm:col-span-2 lg:col-span-2">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by grade, section, program, or teacher..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <select
                  value={filterGrade}
                  onChange={(e) => {
                    setFilterGrade(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 sm:px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white transition"
                >
                  <option value="">All Grades</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
                <select
                  value={filterProgram}
                  onChange={(e) => {
                    setFilterProgram(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 sm:px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white transition"
                >
                  <option value="">All Programs</option>
                  <option value="Social">Social Science</option>
                  <option value="Natural">Natural Science</option>
                </select>
                <input
                  type="text"
                  placeholder="Section..."
                  value={filterSection}
                  onChange={(e) => {
                    setFilterSection(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 sm:px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none bg-white transition"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="grade">Sort by Grade</option>
                </select>
                {(searchTerm || filterGrade || filterProgram || filterSection) && (
                  <button
                    onClick={clearFilters}
                    className="w-full sm:col-span-2 lg:col-span-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              <div className="mt-3 text-xs sm:text-sm text-gray-500">
                Found {filteredActiveClasses.length} class{filteredActiveClasses.length !== 1 ? 'es' : ''}
              </div>
            </div>

            {/* Class Cards */}
            <div className="space-y-4 sm:space-y-6">
              {filteredActiveClasses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center border border-gray-200">
                  <BookOpen size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
                  <p className="text-gray-600 text-base sm:text-lg">No active classes found.</p>
                  {(searchTerm || filterGrade || filterProgram || filterSection) && (
                    <button onClick={clearFilters} className="mt-4 text-cyan-600 hover:text-cyan-700 font-semibold text-sm">
                      Clear filters to see all classes
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {currentClasses.map((cls) => {
                    const canGraduate = isGrade12(cls.grade);
                    return (
                      <div key={cls._id} className="class-card">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                          <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full min-w-0">
                            <div className="class-icon-box">
                              {cls.grade}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                                  Grade {cls.grade} - Section {cls.section}
                                </h3>
                                <span className={`badge-program ${
                                  cls.program === 'Social' ? 'badge-social' : 
                                  cls.program === 'Natural' ? 'badge-natural' : ''
                                }`}>
                                  {cls.program || 'N/A'}
                                </span>
                                {canGraduate && (
                                  <span className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gray-100 text-gray-700 whitespace-nowrap">
                                    Eligible for Graduation
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Teacher: <span className="font-semibold text-cyan-700">{cls.classTeacher?.name || 'Not assigned'}</span>
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons — wrap + full-width on mobile */}
                          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full lg:w-auto">
                            <button onClick={() => openClassDetail(cls)} className="class-action-btn btn-primary-class">
                              <Eye size={14} /> Details
                            </button>
                            <button onClick={() => openAssignStudents(cls)} className="class-action-btn btn-success-class">
                              <Users size={14} /> Assign
                            </button>
                            <button onClick={() => onEditClass(cls)} className="class-action-btn btn-warning-class">
                              <Edit2 size={14} /> Edit
                            </button>
                            {canGraduate && (
                              <button onClick={() => handleMarkClassAsGraduated(cls)} className="class-action-btn btn-purple-class">
                                <GraduationCap size={14} /> Graduate
                              </button>
                            )}
                            {cls.students && cls.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length > 0 && (
                              <button onClick={() => toggleDropdown(cls._id)} className="class-action-btn btn-gray-class">
                                {expandedClass === cls._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {expandedClass === cls._id ? 'Hide' : 'Show'} Students
                              </button>
                            )}
                            <button onClick={() => handleDelete(cls._id)} className="class-action-btn btn-danger-class">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="class-stats-grid">
                          <div className="class-stat-item">
                            <div className="class-stat-number">{cls.students?.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length || 0}</div>
                            <div className="class-stat-label">Active Students</div>
                          </div>
                          <div className="class-stat-item">
                            <div className="class-stat-number">{cls.subjects?.length || 0}</div>
                            <div className="class-stat-label">Subjects</div>
                          </div>
                        </div>

                        {/* Expanded Student List */}
                        {expandedClass === cls._id && cls.students && cls.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').length > 0 && (
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                              <h4 className="font-bold text-gray-800 text-sm sm:text-base">Enrolled Students</h4>
                              <button 
                                onClick={() => handleRemoveMultipleStudents(cls._id, cls.students.filter(s => s.academicStatus !== 'graduated' && s.grade !== 'Graduated').map(s => s._id))} 
                                className="class-action-btn btn-danger-class"
                              >
                                <Trash2 size={14} /> Remove All
                              </button>
                            </div>

                            <div className="student-table-container">
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[700px]">
                                  <thead className="student-table-header">
                                    <tr>
                                      <th className="text-center">Roll</th>
                                      <th className="text-center">Photo</th>
                                      <th className="text-left">Student</th>
                                      <th className="text-center">Grade</th>
                                      <th className="text-center">Section</th>
                                      <th className="text-center">Program</th>
                                      <th className="text-center">Status</th>
                                      <th className="text-center">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getCurrentStudents(cls._id).map((student) => {
                                      const fullStudentData = students.find(s => s._id === student._id) || student;
                                      return (
                                        <tr key={student._id} className="student-table-row">
                                          <td className="text-center font-medium text-gray-700 whitespace-nowrap">{fullStudentData.rollNumber || '-'}</td>
                                          <td className="text-center">
                                            <Avatar name={fullStudentData.name} image={fullStudentData.profileImage} size={30} />
                                          </td>
                                          <td className="font-medium text-gray-900">{fullStudentData.name}</td>
                                          <td className="text-center text-gray-700 whitespace-nowrap">{fullStudentData.grade || '-'}</td>
                                          <td className="text-center text-gray-700">{fullStudentData.section || '-'}</td>
                                          <td className="text-center text-gray-700">{fullStudentData.programs || '-'}</td>
                                          <td className="text-center">
                                            <Badge text={fullStudentData.academicStatus || 'Active'} color={fullStudentData.academicStatus === 'graduated' ? 'purple' : 'green'} />
                                          </td>
                                          <td className="text-center">
                                            <div className="flex gap-1 justify-center flex-wrap">
                                              <button onClick={() => openStudentDetail(fullStudentData)} className="class-action-btn btn-primary-class text-xs px-2 py-1">
                                                <Eye size={12} />
                                              </button>
                                              <button onClick={() => handleEditStudent(fullStudentData)} className="class-action-btn btn-warning-class text-xs px-2 py-1">
                                                <Edit2 size={12} />
                                              </button>
                                              <button onClick={() => handleMarkAsGraduated(fullStudentData)} className="class-action-btn btn-purple-class text-xs px-2 py-1">
                                                <GraduationCap size={12} />
                                              </button>
                                              <button onClick={() => handleRemoveStudent(cls._id, student._id)} className="class-action-btn btn-danger-class text-xs px-2 py-1">
                                                <Trash2 size={12} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {getTotalStudentPages(cls._id) > 1 && (
                              <div className="flex flex-wrap justify-center mt-3 sm:mt-4 gap-2">
                                <button 
                                  onClick={() => { const newPage = Math.max(1, (studentPage[cls._id] || 1) - 1); setStudentPage(prev => ({ ...prev, [cls._id]: newPage })); }} 
                                  disabled={(studentPage[cls._id] || 1) === 1} 
                                  className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition text-xs sm:text-sm"
                                >
                                  Previous
                                </button>
                                <span className="px-3 sm:px-4 py-2 font-semibold text-gray-700 text-xs sm:text-sm">Page {(studentPage[cls._id] || 1)} of {getTotalStudentPages(cls._id)}</span>
                                <button 
                                  onClick={() => { const newPage = Math.min(getTotalStudentPages(cls._id), (studentPage[cls._id] || 1) + 1); setStudentPage(prev => ({ ...prev, [cls._id]: newPage })); }} 
                                  disabled={(studentPage[cls._id] || 1) === getTotalStudentPages(cls._id)} 
                                  className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition text-xs sm:text-sm"
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
                      <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition text-sm">
                        Previous
                      </button>
                      <span className="px-4 sm:px-6 py-2 sm:py-3 font-bold text-gray-700 text-sm">Page {currentPage} of {totalPages}</span>
                      <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition text-sm">
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* ========== GRADUATED CLASSES TAB ========== */}
        {/* ========================================================= */}
        {activeTab === 'graduated' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-cyan-700 to-cyan-600 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                  <Archive size={20} className="flex-shrink-0" /> Graduated Classes
                </h2>
                <p className="text-cyan-100 text-xs sm:text-sm mt-1">Classes that have completed their academic program</p>
              </div>

              {graduatedClasses.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <Archive size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-base sm:text-lg">No graduated classes found.</p>
                </div>
              ) : (
                <>
                  {currentGraduatedClasses.map((cls) => (
                    <div key={cls._id} className="class-card class-card-graduated m-3 sm:m-4">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full min-w-0">
                          <div className="class-icon-box class-icon-box-graduated">
                            {cls.grade}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                                Grade {cls.grade} - Section {cls.section}
                              </h3>
                              <span className="badge-program badge-graduated">Graduated</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Teacher: <span className="font-semibold text-cyan-700">{cls.classTeacher?.name || 'Not assigned'}</span>
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                              Graduated on: {new Date(cls.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full lg:w-auto">
                          <button onClick={() => openClassDetail(cls)} className="class-action-btn btn-primary-class">
                            <Eye size={14} /> Details
                          </button>
                          <button onClick={() => handleRestoreGraduatedClass(cls)} className="class-action-btn btn-success-class">
                            <RefreshCw size={14} /> Restore
                          </button>
                          <button onClick={() => handleDelete(cls._id)} className="class-action-btn btn-danger-class">
                            <Trash2 size={14} />
                          </button>
                          {cls.students && cls.students.length > 0 && (
                            <button onClick={() => toggleGraduatedDropdown(cls._id)} className="class-action-btn btn-gray-class">
                              {expandedGraduatedClass === cls._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              {expandedGraduatedClass === cls._id ? 'Hide' : 'Show'} Students
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="class-stats-grid">
                        <div className="class-stat-item">
                          <div className="class-stat-number" style={{color: '#0e7490'}}>{cls.students?.length || 0}</div>
                          <div className="class-stat-label">Graduated Students</div>
                        </div>
                        <div className="class-stat-item">
                          <div className="class-stat-number" style={{color: '#0e7490'}}>{cls.subjects?.length || 0}</div>
                          <div className="class-stat-label">Subjects</div>
                        </div>
                      </div>

                      {expandedGraduatedClass === cls._id && cls.students && cls.students.length > 0 && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-200">
                          <h4 className="font-bold text-gray-800 mb-3 text-sm sm:text-base">Graduated Students</h4>
                          <div className="student-table-container">
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse min-w-[600px]">
                                <thead className="student-table-header" style={{background: 'linear-gradient(135deg, #0e7490, #0891b2)'}}>
                                  <tr>
                                    <th className="text-center">Roll</th>
                                    <th className="text-center">Photo</th>
                                    <th className="text-left">Student</th>
                                    <th className="text-center">Grade</th>
                                    <th className="text-center">Section</th>
                                    <th className="text-center">Program</th>
                                    <th className="text-center">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {getGraduatedClassStudents(cls._id).map((student) => (
                                    <tr key={student._id} className="student-table-row">
                                      <td className="text-center font-medium text-gray-700 whitespace-nowrap">{student.rollNumber || '-'}</td>
                                      <td className="text-center">
                                        <Avatar name={student.name} image={student.profileImage} size={30} />
                                      </td>
                                      <td className="font-medium text-gray-900">{student.name}</td>
                                      <td className="text-center text-gray-700 whitespace-nowrap">{student.grade || '-'}</td>
                                      <td className="text-center text-gray-700">{student.section || student.classSection || student.class || '-'}</td>
                                      <td className="text-center text-gray-700">{student.programs || '-'}</td>
                                      <td className="text-center">
                                        <div className="flex gap-1 justify-center flex-wrap">
                                          <button onClick={() => openStudentDetail(student)} className="class-action-btn btn-primary-class text-xs px-2 py-1">
                                            <Eye size={12} />
                                          </button>
                                          <button onClick={() => handleRestoreFromGraduated(student)} className="class-action-btn btn-success-class text-xs px-2 py-1">
                                            <RefreshCw size={12} /> Restore
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {getTotalGraduatedClassStudentPages(cls._id) > 1 && (
                            <div className="flex flex-wrap justify-center mt-3 sm:mt-4 gap-2">
                              <button 
                                onClick={() => { const newPage = Math.max(1, (graduatedStudentPage[cls._id] || 1) - 1); setGraduatedStudentPage(prev => ({ ...prev, [cls._id]: newPage })); }} 
                                disabled={(graduatedStudentPage[cls._id] || 1) === 1} 
                                className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition text-xs sm:text-sm"
                              >
                                Previous
                              </button>
                              <span className="px-3 sm:px-4 py-2 font-semibold text-gray-700 text-xs sm:text-sm">Page {(graduatedStudentPage[cls._id] || 1)} of {getTotalGraduatedClassStudentPages(cls._id)}</span>
                              <button 
                                onClick={() => { const newPage = Math.min(getTotalGraduatedClassStudentPages(cls._id), (graduatedStudentPage[cls._id] || 1) + 1); setGraduatedStudentPage(prev => ({ ...prev, [cls._id]: newPage })); }} 
                                disabled={(graduatedStudentPage[cls._id] || 1) === getTotalGraduatedClassStudentPages(cls._id)} 
                                className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition text-xs sm:text-sm"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {totalGClassPages > 1 && (
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 pb-6">
                      <button onClick={() => setGraduatedClassPage(graduatedClassPage - 1)} disabled={graduatedClassPage === 1} className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition text-sm">
                        Previous
                      </button>
                      <span className="px-4 sm:px-6 py-2 sm:py-3 font-bold text-gray-700 text-sm">Page {graduatedClassPage} of {totalGClassPages}</span>
                      <button onClick={() => setGraduatedClassPage(graduatedClassPage + 1)} disabled={graduatedClassPage === totalGClassPages} className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition text-sm">
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* All Graduated Students Section */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-cyan-700 to-cyan-600 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                  <GraduationCap size={20} className="flex-shrink-0" /> All Graduated Students
                </h2>
                <p className="text-cyan-100 text-xs sm:text-sm mt-1">All students who have completed their academic program</p>
              </div>

              {graduatedStudents.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <GraduationCap size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-base sm:text-lg">No graduated students found.</p>
                </div>
              ) : (
                <>
                  <div className="student-table-container" style={{border: 'none', borderRadius: 0}}>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse min-w-[600px]">
                        <thead className="student-table-header" style={{background: 'linear-gradient(135deg, #0e7490, #0891b2)'}}>
                          <tr>
                            <th className="text-center">Roll</th>
                            <th className="text-center">Photo</th>
                            <th className="text-left">Student</th>
                            <th className="text-center">Grade</th>
                            <th className="text-center">Section</th>
                            <th className="text-center">Program</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentGraduatedStudents.map((student) => (
                            <tr key={student._id} className="student-table-row">
                              <td className="text-center font-medium text-gray-700 whitespace-nowrap">{student.rollNumber || '-'}</td>
                              <td className="text-center">
                                <Avatar name={student.name} image={student.profileImage} size={30} />
                              </td>
                              <td className="font-medium text-gray-900">{student.name}</td>
                              <td className="text-center text-gray-700 whitespace-nowrap">{student.grade || 'Graduated'}</td>
                              <td className="text-center text-gray-700">{student.section || student.classSection || student.class || '-'}</td>
                              <td className="text-center text-gray-700">{student.programs || '-'}</td>
                              <td className="text-center">
                                <div className="flex gap-1 justify-center flex-wrap">
                                  <button onClick={() => openStudentDetail(student)} className="class-action-btn btn-primary-class text-xs px-2 py-1">
                                    <Eye size={12} />
                                  </button>
                                  <button onClick={() => handleRestoreFromGraduated(student)} className="class-action-btn btn-success-class text-xs px-2 py-1">
                                    <RefreshCw size={12} /> Restore
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {totalGStudentPages > 1 && (
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 py-4 sm:py-6 border-t-2 border-gray-200">
                      <button onClick={() => setGraduatedStudentListPage(graduatedStudentListPage - 1)} disabled={graduatedStudentListPage === 1} className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition text-sm">
                        Previous
                      </button>
                      <span className="px-4 sm:px-6 py-2 sm:py-3 font-bold text-gray-700 text-sm">Page {graduatedStudentListPage} of {totalGStudentPages}</span>
                      <button onClick={() => setGraduatedStudentListPage(graduatedStudentListPage + 1)} disabled={graduatedStudentListPage === totalGStudentPages} className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-300 transition text-sm">
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ========== EDIT STUDENT MODAL ========== */}
      {/* ========================================================= */}
      {showEditStudentForm && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 modal-backdrop">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto modal-content">
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Edit Student</h3>
              <button onClick={() => setShowEditStudentForm(false)} className="text-gray-500 hover:text-gray-700 flex-shrink-0">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateStudent}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name *</label>
                  <input
                    type="text"
                    value={studentFormData.name}
                    onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={studentFormData.email}
                    onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number</label>
                    <input
                      type="text"
                      value={studentFormData.rollNumber}
                      onChange={(e) => setStudentFormData({ ...studentFormData, rollNumber: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <select
                      value={studentFormData.sex}
                      onChange={(e) => setStudentFormData({ ...studentFormData, sex: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                    <select
                      value={studentFormData.grade}
                      onChange={(e) => setStudentFormData({ ...studentFormData, grade: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                    >
                      <option value="">Select Grade</option>
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
                    <input
                      type="text"
                      placeholder="e.g., A, B, C"
                      value={studentFormData.section}
                      onChange={(e) => setStudentFormData({ ...studentFormData, section: e.target.value })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
                  <select
                    value={studentFormData.programs}
                    onChange={(e) => setStudentFormData({ ...studentFormData, programs: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
                  >
                    <option value="">Select Program</option>
                    <option value="Social">Social Sciences</option>
                    <option value="Natural">Natural Sciences</option>
                  </select>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button type="button" onClick={() => setShowEditStudentForm(false)} className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 font-semibold">
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassList;
