import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { 
  Calendar, Users, BookOpen, CheckCircle, XCircle, Clock,
  Download, Search, Save, Edit, TrendingUp, AlertCircle,
  BarChart3, FileSearch, Printer, X, Menu, RefreshCw,
  ChevronLeft, ChevronRight, Eye, History, FileSpreadsheet,
  Trash2, Edit2, Printer as PrinterIcon, Award, Trophy,
  User, Mail, Phone, School, GraduationCap, MapPin, ArrowLeft, ArrowUp
} from 'lucide-react';
import api from '../../services/api';

// ============================================
// 🎯 REUSABLE COMPONENTS
// ============================================

const Avatar = ({ name, image, size = 40 }) => {
  const [imageError, setImageError] = useState(false);

  if (image && !imageError) {
    return (
      <img 
        src={image} 
        alt={name} 
        className="rounded-full object-cover border-2 border-cyan-200"
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

const Badge = ({ text, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-cyan-100 text-cyan-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[color]}`}>
      {text}
    </span>
  );
};

const GradeIndicator = ({ grade }) => {
  const gradeConfig = {
    'A+': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
    'A': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
    'B+': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
    'B': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
    'C': { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
    'D': { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
    'F': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' },
  };

  const config = gradeConfig[grade] || gradeConfig['F'];

  return (
    <div className={`border ${config.border} ${config.bg} px-3 py-1.5 rounded-lg text-center shadow-sm`}>
      <p className={`text-sm font-bold ${config.text}`}>{grade}</p>
    </div>
  );
};

const ScoreCell = ({ score, maxScore, onClick, isEditing, editValue, onEditChange, onSave, onCancel }) => {
  if (isEditing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <input
          type="number"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          max={maxScore}
          min="0"
          className="w-14 px-1.5 py-1 border border-cyan-400 rounded text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
          autoFocus
        />
        <button
          onClick={onSave}
          className="px-1.5 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
        >
          ✓
        </button>
        <button
          onClick={onCancel}
          className="px-1.5 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="px-3 py-2 min-w-12 bg-gray-50 border border-gray-200 rounded-md text-sm font-semibold text-center hover:bg-cyan-50 hover:border-cyan-300 transition cursor-pointer"
    >
      {score !== undefined && score !== null ? score : '—'}
    </button>
  );
};

// ============================================
// 📊 STUDENT DETAIL PAGE
// ============================================
const StudentDetailPage = ({ student, selectedClass, semester, academicYear, allMarks, examTypes, onBack }) => {
  if (!student) return null;

  const calculateTotal = (studentId) => {
    const marks = allMarks[studentId] || {};
    let total = 0;
    if (marks.quiz?.score) total += marks.quiz.score;
    if (marks.test?.score) total += marks.test.score;
    if (marks.midterm?.score) total += marks.midterm.score;
    if (marks.textbook?.score) total += marks.textbook.score;
    if (marks.final?.score) total += marks.final.score;
    return total;
  };

  const getGrade = (total) => {
    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 75) return 'B+';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    return 'F';
  };

  const total = calculateTotal(student._id);
  const grade = getGrade(total);
  const percentage = (total / 130) * 100;
  const studentImage = student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0E7490&color=fff&size=120&font-size=0.5&bold=true`;

  const examLabels = { quiz: 'Quiz', test: 'Test', midterm: 'Midterm', textbook: 'Textbook', final: 'Final' };
  const examMax = { quiz: 10, test: 10, midterm: 20, textbook: 20, final: 50 };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <style>{`
        .detail-page-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .detail-header {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 35px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        .detail-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 12px;
          margin-right: 6px;
          margin-top: 4px;
        }
        .detail-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }
        .detail-stat-card {
          background: white;
          padding: 18px;
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
        .detail-stat-value { font-size: 26px; font-weight: 700; color: #0e7490; margin: 6px 0; }
        .detail-stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-back-btn {
          background: white;
          color: #0e7490;
          border: 2px solid #0e7490;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .detail-back-btn:hover {
          background: #0e7490;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3);
        }
        .detail-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }
        .detail-info-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.3s;
        }
        .detail-info-item:hover {
          box-shadow: 0 4px 15px rgba(8, 145, 178, 0.08);
          border-color: #0891b2;
        }
        .detail-info-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0e7490, #0891b2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .detail-info-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .detail-info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }
        .detail-section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .detail-section-title .icon {
          color: #0891b2;
        }
      `}</style>

      <div className="detail-page-container">
        <button onClick={onBack} className="detail-back-btn mb-6">
          <ArrowLeft size={18} /> Back to Marks
        </button>

        <div className="detail-header">
          <div className="flex flex-wrap items-center gap-6">
            <Avatar name={student.name} image={studentImage} size={120} />
            <div>
              <h2 className="text-3xl font-bold">{student.name}</h2>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="detail-badge">Roll No: {student.rollNumber}</span>
                <span className="detail-badge">Class: {selectedClass?.grade} - {selectedClass?.section}</span>
                <span className="detail-badge">Subject: {selectedClass?.subject?.name}</span>
                <span className="detail-badge">Status: Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-stats-grid">
          <div className="detail-stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="detail-stat-label">Total Score</div>
            <div className="detail-stat-value" style={{color: '#3b82f6'}}>{total}/130</div>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#10b981'}}>
            <div className="detail-stat-label">Percentage</div>
            <div className="detail-stat-value" style={{color: '#10b981'}}>{percentage.toFixed(1)}%</div>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="detail-stat-label">Grade</div>
            <div className="detail-stat-value" style={{color: '#8b5cf6'}}>{grade}</div>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#f59e0b'}}>
            <div className="detail-stat-label">Semester</div>
            <div className="detail-stat-value" style={{color: '#f59e0b'}}>{semester}</div>
          </div>
        </div>

        {/* Student Information Grid */}
        <div className="mb-8">
          <h3 className="detail-section-title">
            <User className="icon" size={24} />
            Student Information
          </h3>
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <div className="detail-info-icon"><User size={20} /></div>
              <div>
                <p className="detail-info-label">Full Name</p>
                <p className="detail-info-value">{student.name}</p>
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-icon"><BookOpen size={20} /></div>
              <div>
                <p className="detail-info-label">Roll Number</p>
                <p className="detail-info-value">{student.rollNumber}</p>
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-icon"><Users size={20} /></div>
              <div>
                <p className="detail-info-label">Gender</p>
                <p className="detail-info-value">{student.sex || '-'}</p>
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-icon"><Calendar size={20} /></div>
              <div>
                <p className="detail-info-label">Age</p>
                <p className="detail-info-value">{student.age || '-'}</p>
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-icon"><School size={20} /></div>
              <div>
                <p className="detail-info-label">Class</p>
                <p className="detail-info-value">Grade {selectedClass?.grade} - {selectedClass?.section}</p>
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-icon"><GraduationCap size={20} /></div>
              <div>
                <p className="detail-info-label">Subject</p>
                <p className="detail-info-value">{selectedClass?.subject?.name}</p>
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-icon"><Calendar size={20} /></div>
              <div>
                <p className="detail-info-label">Academic Year</p>
                <p className="detail-info-value">{academicYear}</p>
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-icon"><Mail size={20} /></div>
              <div>
                <p className="detail-info-label">Email</p>
                <p className="detail-info-value">{student.email || '-'}</p>
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-icon"><Phone size={20} /></div>
              <div>
                <p className="detail-info-label">Phone</p>
                <p className="detail-info-value">{student.phone || student.parentPhone || '-'}</p>
              </div>
            </div>
            <div className="detail-info-item">
              <div className="detail-info-icon"><MapPin size={20} /></div>
              <div>
                <p className="detail-info-label">Address</p>
                <p className="detail-info-value">{student.address || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Breakdown Table */}
        <div>
          <h3 className="detail-section-title">
            <Award className="icon" size={24} />
            Exam Breakdown
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold border border-cyan-700">Assessment</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Score</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Max</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">%</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Grade</th>
                </tr>
              </thead>
              <tbody>
                {examTypes.map(({ key, label, max }) => {
                  const mark = allMarks[student._id]?.[key];
                  const score = mark?.score || 0;
                  const pct = max > 0 ? (score / max) * 100 : 0;
                  const grade = getGrade(score);
                  
                  return (
                    <tr key={key} className="hover:bg-cyan-50 transition even:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200">{label}</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-cyan-700 border border-gray-200">{score}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600 border border-gray-200">{max}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600 border border-gray-200">{pct.toFixed(0)}%</td>
                      <td className="px-4 py-3 text-center border border-gray-200">
                        <GradeIndicator grade={grade} />
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-100 font-bold">
                  <td className="px-4 py-3 text-sm text-gray-700 border border-gray-200">Total</td>
                  <td className="px-4 py-3 text-center text-sm text-cyan-700 border border-gray-200">{total}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 border border-gray-200">130</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 border border-gray-200">{percentage.toFixed(0)}%</td>
                  <td className="px-4 py-3 text-center border border-gray-200">
                    <GradeIndicator grade={grade} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onBack} 
            className="px-8 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-semibold shadow-md flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Marks
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📊 VIEW MARKS SYSTEM - CARD DESIGN
// ============================================

const ViewMarksSystem = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [allMarks, setAllMarks] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [allStudentsData, setAllStudentsData] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Edit states
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const examTypes = [
    { key: 'quiz', label: 'Quiz', max: 10 },
    { key: 'test', label: 'Test Exam', max: 10 },
    { key: 'midterm', label: 'Mid Exam', max: 20 },
    { key: 'textbook', label: 'Textbook', max: 20 },
    { key: 'final', label: 'Final Exam', max: 50 }
  ];

  useEffect(() => {
    fetchClasses();
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      const response = await api.get('/users/role/student');
      setAllStudentsData(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes/my-classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}`);
      const studentsList = response.data.students || [];
      return studentsList.map(student => {
        const fullStudent = allStudentsData.find(s => s._id === student._id);
        return {
          ...student,
          sex: fullStudent?.sex || student?.sex || null,
          age: fullStudent?.age || student?.age || null,
          profileImage: fullStudent?.profileImage || student?.profileImage || null,
          email: fullStudent?.email || student?.email || null,
          phone: fullStudent?.phone || student?.phone || null,
          address: fullStudent?.address || student?.address || null,
          parentPhone: fullStudent?.parentPhone || student?.parentPhone || null,
        };
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  const fetchMarks = async (classId, subjectName) => {
    try {
      const params = new URLSearchParams();
      if (subjectName) params.append('subject', subjectName);
      if (semester) params.append('semester', semester);
      if (academicYear) params.append('academicYear', academicYear);
      
      const url = `/marks/class/${classId}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      
      let marksData = response.data;
      if (marksData && marksData.marks) marksData = marksData.marks;
      if (!Array.isArray(marksData)) marksData = [];
      
      const marksMap = {};
      marksData.forEach(mark => {
        const studentId = mark.studentId?._id || mark.studentId;
        if (studentId) {
          if (!marksMap[studentId]) marksMap[studentId] = {};
          marksMap[studentId][mark.examType] = {
            score: mark.score,
            maxScore: mark.maxScore,
            remarks: mark.remarks,
            _id: mark._id
          };
        }
      });
      
      return marksMap;
    } catch (error) {
      console.error('Error fetching marks:', error);
      return {};
    }
  };

  const handleClassSelect = async (cls) => {
    setLoading(true);
    setSelectedClass(cls);
    setSelectedStudent(null);
    setShowDetailPage(false);
    setEditingCell(null);
    
    try {
      const studentsList = await fetchStudents(cls._id);
      const sortedStudents = [...studentsList].sort((a, b) => 
        a.name?.localeCompare(b.name) || 0
      );
      setStudents(sortedStudents);
      
      const subjectName = cls.subject?.name;
      if (subjectName) {
        const marksMap = await fetchMarks(cls._id, subjectName);
        setAllMarks(marksMap);
      } else {
        setAllMarks({});
      }
      
      toast.success(`Loaded ${sortedStudents.length} students`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (selectedClass) {
      setLoading(true);
      const subjectName = selectedClass.subject?.name;
      if (subjectName) {
        const marksMap = await fetchMarks(selectedClass._id, subjectName);
        setAllMarks(marksMap);
        toast.success('Marks refreshed');
      }
      setLoading(false);
    }
  };

  const handleSemesterChange = async (newSemester) => {
    setSemester(newSemester);
    if (selectedClass) {
      const subjectName = selectedClass.subject?.name;
      if (subjectName) {
        const marksMap = await fetchMarks(selectedClass._id, subjectName);
        setAllMarks(marksMap);
      }
      toast.success(`Switched to ${newSemester}`);
    }
  };

  const handleYearChange = async (newYear) => {
    setAcademicYear(newYear);
    if (selectedClass) {
      const subjectName = selectedClass.subject?.name;
      if (subjectName) {
        const marksMap = await fetchMarks(selectedClass._id, subjectName);
        setAllMarks(marksMap);
      }
      toast.success(`Switched to ${newYear}`);
    }
  };

  const startEdit = (studentId, examType, currentScore, maxScore, markId) => {
    setEditingCell({ studentId, examType, markId, maxScore });
    setEditValue(currentScore?.toString() || '');
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    
    const { studentId, examType, markId, maxScore } = editingCell;
    const score = parseFloat(editValue);
    
    if (isNaN(score)) {
      toast.error('Please enter a valid score');
      return;
    }
    
    if (score < 0 || score > maxScore) {
      toast.error(`Score must be between 0 and ${maxScore}`);
      return;
    }
    
    setLoading(true);
    try {
      const markData = {
        studentId,
        classId: selectedClass._id,
        subject: selectedClass.subject?.name,
        examType,
        score,
        maxScore,
        semester,
        academicYear
      };
      
      if (markId) {
        await api.put(`/marks/${markId}`, markData);
      } else {
        await api.post('/marks/add', markData);
      }
      
      const subjectName = selectedClass.subject?.name;
      if (subjectName) {
        const marksMap = await fetchMarks(selectedClass._id, subjectName);
        setAllMarks(marksMap);
      }
      
      toast.success('Marks updated successfully!');
      setEditingCell(null);
      
    } catch (error) {
      console.error('Failed to save marks:', error);
      toast.error(error.response?.data?.error || 'Failed to save marks');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const calculateTotal = (studentId) => {
    const marks = allMarks[studentId] || {};
    let total = 0;
    examTypes.forEach(({ key }) => {
      if (marks[key]?.score) total += marks[key].score;
    });
    return total;
  };

  const getGrade = (total) => {
    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 75) return 'B+';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    return 'F';
  };

  const getStudentImage = (student) => {
    if (student?.profileImage) {
      return student.profileImage;
    }
    const fullStudent = allStudentsData.find(s => s._id === student._id);
    if (fullStudent?.profileImage) {
      return fullStudent.profileImage;
    }
    return null;
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toString().includes(searchTerm)
  );

  const sortedStudents = [...filteredStudents]
    .map(s => ({ ...s, total: calculateTotal(s._id) }))
    .sort((a, b) => {
      const comparison = b.total - a.total;
      return comparison;
    })
    .map((s, idx) => ({ ...s, rank: idx + 1 }));

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    const sorted = [...sortedStudents].sort((a, b) => {
      const comparison = a.name?.localeCompare(b.name) || 0;
      return newOrder === 'asc' ? comparison : -comparison;
    });
    // Recalculate ranks
    const ranked = sorted.map((s, idx) => ({ ...s, rank: idx + 1 }));
    // Replace students with sorted version
    setStudents(ranked);
  };

  // Show Detail Page if selected
  if (showDetailPage && selectedStudent) {
    return (
      <StudentDetailPage 
        student={selectedStudent}
        selectedClass={selectedClass}
        semester={semester}
        academicYear={academicYear}
        allMarks={allMarks}
        examTypes={examTypes}
        onBack={() => {
          setShowDetailPage(false);
          setSelectedStudent(null);
        }}
      />
    );
  }

  // Class selector view
  if (!selectedClass) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
          .class-selector-container { animation: fadeIn 0.5s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .hero-section {
            background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
            color: white;
            padding: 40px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
          }
          .hero-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 800; margin-bottom: 10px; }
          .hero-subtitle { font-size: 16px; opacity: 0.9; }
          .class-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            position: relative;
            overflow: hidden;
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
          .class-icon { font-size: 40px; margin-bottom: 12px; }
          .class-title { font-size: 20px; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
          .class-info { color: #666; font-size: 14px; }
          .class-stats {
            display: flex;
            gap: 20px;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
          }
          .class-stat-item { flex: 1; text-align: center; }
          .class-stat-number { font-size: 18px; font-weight: 700; color: #0891b2; }
          .class-stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
          .class-view-btn {
            width: 100%;
            background: linear-gradient(135deg, #0e7490, #0891b2);
            color: white;
            border: none;
            padding: 10px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 12px;
            transition: all 0.3s;
          }
          .class-view-btn:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3); }
        `}</style>

        <div className="class-selector-container">
          <div className="hero-section">
            <div className="flex items-center gap-4 mb-2">
              <BookOpen size={40} />
              <div>
                <h2 className="hero-title">📊 Marks Management</h2>
                <p className="hero-subtitle">Select a class to view and manage student marks</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 text-lg font-semibold">No classes assigned to you</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div key={cls._id} className="class-card">
                  <div className="class-icon">📖</div>
                  <h4 className="class-title">Grade {cls.grade}</h4>
                  <p className="class-info">Section {cls.section}</p>
                  {cls.subject?.name && (
                    <div className="inline-block bg-cyan-100 text-cyan-800 text-xs px-3 py-1 rounded-full mt-2">
                      {cls.subject.name}
                    </div>
                  )}
                  <div className="class-stats">
                    <div className="class-stat-item">
                      <div className="class-stat-number">{cls.students?.length || 0}</div>
                      <div className="class-stat-label">Students</div>
                    </div>
                    <div className="class-stat-item">
                      <div className="class-stat-number">{cls.subjects?.length || 0}</div>
                      <div className="class-stat-label">Subjects</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClassSelect(cls)}
                    className="class-view-btn"
                  >
                    View Marks →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main ranking table view
  return (
    <div className="max-w-full mx-auto p-4 md:p-6">
      <style>{`
        .marks-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .marks-header {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: white;
          padding: 18px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          text-align: center;
          border-top: 4px solid #0891b2;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(8, 145, 178, 0.12);
        }
        .stat-value { font-size: 26px; font-weight: 700; color: #0e7490; margin: 6px 0; }
        .stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
        .filter-box {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .table-container {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .table-header {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
        }
        .table-header th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          border: 1px solid #0c6a82;
        }
        .table-row td {
          padding: 10px 16px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .table-row:nth-child(even) td {
          background: #f8fafc;
        }
        .table-row:hover td {
          background: #f0f9ff;
        }
        .grade-badge {
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }
        .grade-A-plus { background: #d1fae5; color: #059669; }
        .grade-A { background: #d1fae5; color: #059669; }
        .grade-B-plus { background: #dbeafe; color: #2563eb; }
        .grade-B { background: #dbeafe; color: #2563eb; }
        .grade-C { background: #fef3c7; color: #f59e0b; }
        .grade-D { background: #ffedd5; color: #f97316; }
        .grade-F { background: #fee2e2; color: #dc2626; }
        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-weight: 700;
          font-size: 12px;
        }
        .rank-1 { background: #fef3c7; color: #f59e0b; }
        .rank-2 { background: #e5e7eb; color: #6b7280; }
        .rank-3 { background: #fed7aa; color: #ea580c; }
        .rank-other { background: #e0f2fe; color: #0284c7; }
      `}</style>

      <div className="marks-container">
        <div className="marks-header">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setStudents([]);
                }}
                className="text-white/80 hover:text-white mb-2 flex items-center gap-1 transition"
              >
                <ChevronLeft size={20} /> Back to Classes
              </button>
              <h2 className="text-2xl font-bold">Grade {selectedClass.grade} - {selectedClass.section}</h2>
              <p className="text-cyan-100 mt-1">
                Subject: {selectedClass.subject?.name || 'N/A'} | Total Students: {students.length}
              </p>
              <p className="text-cyan-100/80 text-sm mt-1">
                Semester: {semester} | Academic Year: {academicYear}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                onClick={() => {
                  const exportData = sortedStudents.map(s => {
                    const marks = allMarks[s._id] || {};
                    return {
                      'Roll No': s.rollNumber,
                      'Student Name': s.name,
                      'Gender': s.sex || '-',
                      'Age': s.age || '-',
                      'Quiz': marks.quiz?.score || 0,
                      'Test': marks.test?.score || 0,
                      'Midterm': marks.midterm?.score || 0,
                      'Textbook': marks.textbook?.score || 0,
                      'Final': marks.final?.score || 0,
                      'Total': s.total,
                      'Grade': getGrade(s.total)
                    };
                  });
                  
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Marks');
                  XLSX.writeFile(wb, `Marks_${selectedClass.grade}_${selectedClass.section}.xlsx`);
                  toast.success('Export successful!');
                }}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2"
              >
                <FileSpreadsheet size={18} />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        <div className="filter-box">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Search</label>
              <input
                type="text"
                placeholder="Name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Semester</label>
              <select
                value={semester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sort</label>
              <button
                onClick={toggleSortOrder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <span className="font-medium text-gray-700">
                  {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                </span>
                {sortOrder === 'asc' ? (
                  <ArrowUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="stat-label">Total Students</div>
            <div className="stat-value" style={{color: '#3b82f6'}}>{students.length}</div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#10b981'}}>
            <div className="stat-label">Class Average</div>
            <div className="stat-value" style={{color: '#10b981'}}>
              {students.length > 0 ? 
                (students.reduce((sum, s) => sum + calculateTotal(s._id), 0) / students.length).toFixed(1) 
                : '-'}
            </div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="stat-label">Top Performer</div>
            <div className="stat-value" style={{color: '#8b5cf6'}}>
              {sortedStudents.length > 0 ? sortedStudents[0].name : '-'}
            </div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#f59e0b'}}>
            <div className="stat-label">Semester</div>
            <div className="stat-value" style={{color: '#f59e0b'}}>{semester}</div>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading marks...</p>
            </div>
          ) : sortedStudents.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="table-header">
                  <tr>
                    <th className="text-center">Rank</th>
                    <th className="text-center">Roll No</th>
                    <th className="text-center">Photo</th>
                    <th className="text-left">Student Name</th>
                    <th className="text-center">Gender</th>
                    <th className="text-center">Age</th>
                    {examTypes.map(({ key, label }) => (
                      <th key={key} className="text-center">{label}</th>
                    ))}
                    <th className="text-center">Total</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((student, index) => {
                    const marks = allMarks[student._id] || {};
                    const total = student.total;
                    const percentage = (total / 130) * 100;
                    const grade = getGrade(total);
                    const studentImage = getStudentImage(student);
                    
                    let rankClass = 'rank-other';
                    if (student.rank === 1) rankClass = 'rank-1';
                    else if (student.rank === 2) rankClass = 'rank-2';
                    else if (student.rank === 3) rankClass = 'rank-3';
                    
                    return (
                      <tr key={student._id} className={`table-row ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="text-center">
                          <span className={`rank-badge ${rankClass}`}>
                            {student.rank}
                          </span>
                        </td>
                        <td className="text-center font-medium text-gray-700">
                          {student.rollNumber}
                        </td>
                        <td className="text-center">
                          <Avatar name={student.name} image={studentImage} size={40} />
                        </td>
                        <td className="font-medium text-gray-900">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDetailPage(true);
                            }}
                            className="hover:text-cyan-600 hover:underline transition"
                          >
                            {student.name}
                          </button>
                        </td>
                        <td className="text-center text-gray-700">
                          {student.sex || '-'}
                        </td>
                        <td className="text-center text-gray-700">
                          {student.age || '-'}
                        </td>
                        
                        {examTypes.map(({ key, max }) => {
                          const mark = marks[key];
                          const isEditing = editingCell?.studentId === student._id && editingCell?.examType === key;
                          
                          return (
                            <td key={key} className="text-center">
                              <ScoreCell
                                score={mark?.score}
                                maxScore={max}
                                onClick={() => startEdit(student._id, key, mark?.score, max, mark?._id)}
                                isEditing={isEditing}
                                editValue={editValue}
                                onEditChange={setEditValue}
                                onSave={saveEdit}
                                onCancel={cancelEdit}
                              />
                            </td>
                          );
                        })}
                        
                        <td className="text-center font-bold text-cyan-700">
                          {total}
                        </td>
                        <td className="text-center">
                          <span className={`grade-badge grade-${grade.replace('+', '-plus')}`}>
                            {grade}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDetailPage(true);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition flex items-center gap-1 mx-auto"
                          >
                            <Eye size={14} /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="6" className="px-4 py-3 text-sm font-bold text-gray-700">
                      Class Average
                    </td>
                    {examTypes.map(({ key }) => {
                      const scores = sortedStudents
                        .map(s => allMarks[s._id]?.[key]?.score || 0)
                        .filter(s => s > 0);
                      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                      return (
                        <td key={`avg-${key}`} className="text-center">
                          <span className="text-xs font-medium text-gray-600">
                            {avg > 0 ? avg.toFixed(1) : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-center">
                      <span className="text-xs font-medium text-gray-600">
                        {sortedStudents.length > 0 ? 
                          (sortedStudents.reduce((sum, s) => sum + s.total, 0) / sortedStudents.length).toFixed(1) 
                          : '-'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-xs font-medium text-gray-600">-</span>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="px-4 py-3 text-sm font-bold text-gray-700">
                      Total Students
                    </td>
                    <td colSpan="8" className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-cyan-700">
                        {sortedStudents.length} Students
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewMarksSystem;