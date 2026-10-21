import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users, BookOpen, Save, RefreshCw, ChevronLeft,
  Award, TrendingUp, User, Mail, Phone, Calendar,
  X, Check, AlertCircle, Eye, ArrowUpDown, ArrowUp, ArrowDown,
  School, GraduationCap, MapPin, FileSpreadsheet, Printer, BarChart3
} from 'lucide-react';
import api from '../../services/api';
import * as XLSX from 'xlsx';

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
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colorMap[color]}`}>
      {text}
    </span>
  );
};

// ============================================
// 📊 STUDENT DETAIL PAGE
// ============================================
const StudentDetailPage = ({ student, selectedClass, academicYear, semester, onBack }) => {
  if (!student) return null;

  // Calculate totals from marks (excluding quiz)
  const calculateTotal = (marks) => {
    if (!marks) return 0;
    let total = 0;
    const examTypes = ['test', 'midterm', 'textbook', 'final'];
    examTypes.forEach(type => {
      if (marks[type]?.score) total += marks[type].score;
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

  const s1Marks = student.semester1Marks || {};
  const s2Marks = student.semester2Marks || {};
  const s1Total = calculateTotal(s1Marks);
  const s2Total = calculateTotal(s2Marks);
  const s1Grade = getGrade(s1Total);
  const s2Grade = getGrade(s2Total);
  const overallTotal = s1Total + s2Total;
  const overallGrade = getGrade(overallTotal / 2);
  const studentImage = student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0E7490&color=fff&size=120&font-size=0.5&bold=true`;

  // Exam types without quiz
  const examTypes = ['test', 'midterm', 'textbook', 'final'];
  const examLabels = { test: 'Test', midterm: 'Midterm', textbook: 'Textbook', final: 'Final' };
  const examMax = { test: 10, midterm: 20, textbook: 20, final: 50 };

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
          <ArrowUp size={18} className="rotate-180" /> Back to Marks
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
            <div className="detail-stat-label">Semester 1 Total</div>
            <div className="detail-stat-value" style={{color: '#3b82f6'}}>{s1Total}</div>
            <p className="text-sm text-gray-500">Grade: <span className="font-bold">{s1Grade}</span></p>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#10b981'}}>
            <div className="detail-stat-label">Semester 2 Total</div>
            <div className="detail-stat-value" style={{color: '#10b981'}}>{s2Total}</div>
            <p className="text-sm text-gray-500">Grade: <span className="font-bold">{s2Grade}</span></p>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="detail-stat-label">Overall Total</div>
            <div className="detail-stat-value" style={{color: '#8b5cf6'}}>{overallTotal}</div>
            <p className="text-sm text-gray-500">Grade: <span className="font-bold">{overallGrade}</span></p>
          </div>
          <div className="detail-stat-card" style={{borderTopColor: '#f59e0b'}}>
            <div className="detail-stat-label">Performance</div>
            <div className="detail-stat-value" style={{color: '#f59e0b'}}>{((overallTotal / 100) * 100).toFixed(1)}%</div>
            <p className="text-sm text-gray-500">Overall Score</p>
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

        {/* Exam Breakdown Table - No Quiz */}
        <div>
          <h3 className="detail-section-title">
            <Award className="icon" size={24} />
            Exam Breakdown
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold border border-cyan-700">Exam Type</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Max Score</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Semester 1</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Semester 2</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Difference</th>
                </tr>
              </thead>
              <tbody>
                {examTypes.map((examType) => {
                  const s1Mark = s1Marks[examType];
                  const s2Mark = s2Marks[examType];
                  const s1Score = s1Mark?.score || 0;
                  const s2Score = s2Mark?.score || 0;
                  const maxScore = examMax[examType];
                  const diff = s2Score - s1Score;
                  const diffColor = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500';
                  const diffIcon = diff > 0 ? '↑' : diff < 0 ? '↓' : '−';

                  return (
                    <tr key={examType} className="hover:bg-cyan-50 transition even:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200">
                        {examLabels[examType]}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600 border border-gray-200">
                        {maxScore}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600 border border-gray-200">
                        {s1Score}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-green-600 border border-gray-200">
                        {s2Score}
                      </td>
                      <td className={`px-4 py-3 text-center text-sm font-bold border border-gray-200 ${diffColor}`}>
                        {diff !== 0 ? `${diffIcon} ${Math.abs(diff)}` : '− 0'}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-100 font-bold">
                  <td className="px-4 py-3 text-sm text-gray-700 border border-gray-200">Total</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 border border-gray-200">100</td>
                  <td className="px-4 py-3 text-center text-sm text-blue-700 border border-gray-200">{s1Total}</td>
                  <td className="px-4 py-3 text-center text-sm text-green-700 border border-gray-200">{s2Total}</td>
                  <td className={`px-4 py-3 text-center text-sm border border-gray-200 ${s2Total - s1Total > 0 ? 'text-green-600' : s2Total - s1Total < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {s2Total - s1Total !== 0 ? `${s2Total - s1Total > 0 ? '↑' : '↓'} ${Math.abs(s2Total - s1Total)}` : '− 0'}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700 border border-gray-200">Grade</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 border border-gray-200">-</td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-blue-700 border border-gray-200">{s1Grade}</td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-green-700 border border-gray-200">{s2Grade}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500 border border-gray-200">-</td>
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
            <ArrowUp size={18} className="rotate-180" /> Back to Marks
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📝 TEACHER ENTER MARK - NO QUIZ
// ============================================

const TeacherEnterMark = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [gradeRecords, setGradeRecords] = useState({});
  const [assessmentType, setAssessmentType] = useState('test');
  const [maxScore, setMaxScore] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [semester, setSemester] = useState('Semester 1');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allStudentsData, setAllStudentsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);

  // Exam types without quiz
  const examTypes = ['test', 'midterm', 'textbook', 'final'];
  const examMax = { test: 10, midterm: 20, textbook: 20, final: 50 };
  const examLabels = { test: 'Test', midterm: 'Midterm', textbook: 'Textbook', final: 'Final' };

  // Fetch classes for teacher
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes/my-classes');
      setClasses(response.data);
      
      if (response.data.length === 0) {
        toast.error('No classes assigned to you');
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all students for profile data
  const fetchAllStudents = async () => {
    try {
      const response = await api.get('/users/role/student');
      setAllStudentsData(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // When class is selected, set the subject
  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    if (cls.subject) {
      setSelectedSubject(cls.subject);
    } else {
      setSelectedSubject(null);
      toast.error('No subject assigned to you in this class');
    }
    setStudents([]);
    setGradeRecords({});
  };

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchStudentsAndMarks();
    }
  }, [selectedClass, selectedSubject, semester, academicYear]);

  useEffect(() => {
    fetchClasses();
    fetchAllStudents();
  }, []);

  const fetchStudentsAndMarks = async () => {
    try {
      setLoading(true);
      
      if (!selectedClass || !selectedSubject) {
        return;
      }
      
      // Fetch students with enriched data
      const studentsResponse = await api.get(`/classes/${selectedClass._id}`);
      const studentsList = studentsResponse.data.students || [];
      
      // Enrich students with gender, age, profile image
      const enrichedStudents = studentsList.map(student => {
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
          semester1Marks: {},
          semester2Marks: {}
        };
      });
      
      // Sort students by name A-Z by default
      const sortedStudents = [...enrichedStudents].sort((a, b) => 
        a.name?.localeCompare(b.name) || 0
      );
      
      setStudents(sortedStudents);
      
      // Fetch existing marks for both semesters
      try {
        // Fetch Semester 1 marks
        const s1Response = await api.get(`/marks/class/${selectedClass._id}`, {
          params: { 
            semester: 'Semester 1', 
            academicYear: academicYear, 
            subject: selectedSubject?.name 
          }
        });
        
        // Fetch Semester 2 marks
        const s2Response = await api.get(`/marks/class/${selectedClass._id}`, {
          params: { 
            semester: 'Semester 2', 
            academicYear: academicYear, 
            subject: selectedSubject?.name 
          }
        });
        
        const s1Data = s1Response.data || [];
        const s2Data = s2Response.data || [];
        
        const s1MarksMap = {};
        const s2MarksMap = {};
        
        if (Array.isArray(s1Data)) {
          s1Data.forEach(mark => {
            const studentId = mark.studentId?._id || mark.studentId;
            if (!s1MarksMap[studentId]) s1MarksMap[studentId] = {};
            s1MarksMap[studentId][mark.examType] = mark;
          });
        }
        
        if (Array.isArray(s2Data)) {
          s2Data.forEach(mark => {
            const studentId = mark.studentId?._id || mark.studentId;
            if (!s2MarksMap[studentId]) s2MarksMap[studentId] = {};
            s2MarksMap[studentId][mark.examType] = mark;
          });
        }
        
        // Update students with marks
        const updatedStudents = sortedStudents.map(student => {
          return {
            ...student,
            semester1Marks: s1MarksMap[student._id] || {},
            semester2Marks: s2MarksMap[student._id] || {}
          };
        });
        
        setStudents(updatedStudents);
        
        // Initialize grade records - empty for entering new marks
        const updatedGrades = {};
        updatedStudents.forEach(student => {
          updatedGrades[student._id] = { 
            score: '', 
            remarks: '',
            markId: null
          };
        });
        setGradeRecords(updatedGrades);
        
        toast.success(`Loaded ${updatedStudents.length} students`);
        
      } catch (markError) {
        console.log('No existing marks found:', markError);
        // Initialize empty grade records
        const updatedGrades = {};
        sortedStudents.forEach(student => {
          updatedGrades[student._id] = { score: '', remarks: '' };
        });
        setGradeRecords(updatedGrades);
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Handle grade change
  const handleGradeChange = (studentId, field, value) => {
    setGradeRecords(prev => ({ 
      ...prev, 
      [studentId]: { ...prev[studentId], [field]: value } 
    }));
  };

  // Refresh marks - clears the form for new entries
  const refreshMarks = async () => {
    if (selectedClass && selectedSubject) {
      toast.loading('Refreshing...', { id: 'refresh' });
      // Reset all grade records to empty
      const resetGrades = {};
      students.forEach(student => {
        resetGrades[student._id] = { score: '', remarks: '' };
      });
      setGradeRecords(resetGrades);
      toast.success('Form cleared for new entries', { id: 'refresh' });
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    sortStudents(newOrder);
  };

  // Sort students by name
  const sortStudents = (order) => {
    const sorted = [...students].sort((a, b) => {
      const comparison = a.name?.localeCompare(b.name) || 0;
      return order === 'asc' ? comparison : -comparison;
    });
    setStudents(sorted);
  };

  // Sort students when sort order changes
  useEffect(() => {
    if (students.length > 0) {
      sortStudents(sortOrder);
    }
  }, [sortOrder]);

  // Submit marks - saves without fetching/displaying existing marks
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!selectedSubject) {
      toast.error('No subject assigned to you in this class');
      setIsSubmitting(false);
      return;
    }
    
    // Prepare marks array
    const marksToSave = [];
    
    for (const [studentId, data] of Object.entries(gradeRecords)) {
      if (data.score && data.score !== '' && data.score !== null) {
        const scoreValue = parseFloat(data.score);
        if (!isNaN(scoreValue) && scoreValue >= 0 && scoreValue <= maxScore) {
          marksToSave.push({
            studentId: studentId,
            score: scoreValue,
            maxScore: maxScore,
            remarks: data.remarks || ''
          });
        }
      }
    }
    
    if (marksToSave.length === 0) {
      toast.error('No marks entered to save');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const requestData = {
        classId: selectedClass._id,
        examType: assessmentType,
        semester: semester,
        academicYear: academicYear,
        marks: marksToSave
      };
      
      const response = await api.post('/marks/save', requestData);
      
      if (response.data.success) {
        toast.success(`✅ Saved ${marksToSave.length} mark(s) for ${examLabels[assessmentType]}`);
        
        // Clear the form after successful save
        const resetGrades = {};
        students.forEach(student => {
          resetGrades[student._id] = { score: '', remarks: '' };
        });
        setGradeRecords(resetGrades);
        
        // Keep the students list but clear marks
        const clearedStudents = students.map(student => ({
          ...student,
          semester1Marks: {},
          semester2Marks: {}
        }));
        setStudents(clearedStudents);
        
      } else {
        throw new Error(response.data.error || 'Save failed');
      }
      
    } catch (error) {
      console.error('Save marks error:', error);
      toast.error(`❌ Failed to save marks: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
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

  // Filter and sort students by search
  const getFilteredAndSortedStudents = () => {
    let filtered = students.filter(s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber?.toString().includes(searchTerm)
    );
    
    // Maintain sort order
    filtered.sort((a, b) => {
      const comparison = a.name?.localeCompare(b.name) || 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  // Calculate percentage
  const calculatePercentage = (score) => {
    if (!score || score === '') return 0;
    return (parseFloat(score) / maxScore) * 100;
  };

  // Get grade from total
  const getGrade = (score) => {
    if (!score || score === '') return '-';
    const numScore = parseFloat(score);
    if (numScore >= 90) return 'A+';
    if (numScore >= 80) return 'A';
    if (numScore >= 75) return 'B+';
    if (numScore >= 70) return 'B';
    if (numScore >= 60) return 'C';
    if (numScore >= 50) return 'D';
    return 'F';
  };

  // Handle view details
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailPage(true);
  };

  const handleBackToMarks = () => {
    setShowDetailPage(false);
    setSelectedStudent(null);
  };

  const filteredStudents = getFilteredAndSortedStudents();

  // Show Detail Page if selected
  if (showDetailPage && selectedStudent) {
    return (
      <StudentDetailPage 
        student={selectedStudent}
        selectedClass={selectedClass}
        academicYear={academicYear}
        semester={semester}
        onBack={handleBackToMarks}
      />
    );
  }

  // Show class selector if no class selected
  if (!selectedClass) {
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600"></div>
          </div>
        </div>
      );
    }
    
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
                <h2 className="hero-title">📚 Enter Marks</h2>
                <p className="hero-subtitle">Select a class to enter student marks</p>
              </div>
            </div>
          </div>

          {classes.length === 0 ? (
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
                    Enter Marks →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show message if no subject assigned
  if (!selectedSubject) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">No Subject Assigned</h2>
          <p className="text-gray-600 mb-4">
            You are not assigned to teach any subject in this class.
          </p>
          <button
            onClick={() => setSelectedClass(null)}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Main grade entry view
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
        .input-score {
          width: 70px;
          padding: 4px 8px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
        }
        .input-score:focus {
          border-color: #0891b2;
          outline: none;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.2);
        }
        .input-score.has-value {
          border-color: #10b981;
          background: #f0fdf4;
        }
        .input-remarks {
          width: 100%;
          padding: 4px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 12px;
          transition: all 0.3s;
        }
        .input-remarks:focus {
          border-color: #0891b2;
          outline: none;
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }
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
                Subject: {selectedSubject?.name || 'N/A'} | Total Students: {students.length}
              </p>
              <p className="text-cyan-100/80 text-sm mt-1">
                Semester: {semester} | Academic Year: {academicYear}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={refreshMarks}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Clear Form
              </button>
              <button
                onClick={() => {
                  const exportData = students.map(student => {
                    const score = gradeRecords[student._id]?.score || '';
                    
                    return {
                      'Roll No': student.rollNumber,
                      'Student Name': student.name,
                      'Gender': student.sex || '-',
                      'Age': student.age || '-',
                      'Score': score,
                      'Max Score': maxScore,
                      'Percentage': score && score > 0 ? ((parseFloat(score) / maxScore) * 100).toFixed(1) + '%' : '0%',
                      'Grade': getGrade(score),
                      'Remarks': gradeRecords[student._id]?.remarks || ''
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assessment Type</label>
              <select 
                value={assessmentType} 
                onChange={(e) => setAssessmentType(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="test">Test</option>
                <option value="midterm">Mid Exam</option>
                <option value="textbook">Textbook</option>
                <option value="final">Final Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Maximum Score</label>
              <input 
                type="number" 
                value={maxScore} 
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                min="1" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Semester</label>
              <select 
                value={semester} 
                onChange={(e) => setSemester(e.target.value)}
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
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search and Sort Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Search Students</label>
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sort by Name</label>
              <button
                onClick={toggleSortOrder}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
            <div className="flex items-end">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Showing {filteredStudents.length} of {students.length} students
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="stat-label">Total Students</div>
            <div className="stat-value" style={{color: '#3b82f6'}}>{students.length}</div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#10b981'}}>
            <div className="stat-label">Students with Marks</div>
            <div className="stat-value" style={{color: '#10b981'}}>
              {students.filter(s => gradeRecords[s._id]?.score && gradeRecords[s._id].score !== '').length}
            </div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="stat-label">Class Average</div>
            <div className="stat-value" style={{color: '#8b5cf6'}}>
              {students.length > 0 ? 
                (students.reduce((sum, s) => {
                  const score = parseFloat(gradeRecords[s._id]?.score) || 0;
                  return sum + score;
                }, 0) / students.length).toFixed(1)
                : '-'}
            </div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#f59e0b'}}>
            <div className="stat-label">Current Assessment</div>
            <div className="stat-value" style={{color: '#f59e0b'}}>{examLabels[assessmentType]}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="table-container">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading marks...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-base font-medium">No students found</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Try adjusting your search term</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="table-header">
                    <tr>
                      <th className="text-center">Roll No</th>
                      <th className="text-center">Photo</th>
                      <th className="text-left">Student Name</th>
                      <th className="text-center">Gender</th>
                      <th className="text-center">Age</th>
                      <th className="text-center">Score</th>
                      <th className="text-center">%</th>
                      <th className="text-center">Grade</th>
                      <th className="text-left">Remarks</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => {
                      const score = gradeRecords[student._id]?.score || '';
                      const percentage = calculatePercentage(score);
                      const grade = getGrade(score);
                      const studentImage = getStudentImage(student);
                      
                      let gradeColor = 'grade-F';
                      if (grade === 'A+') gradeColor = 'grade-A-plus';
                      else if (grade === 'A') gradeColor = 'grade-A';
                      else if (grade === 'B+') gradeColor = 'grade-B-plus';
                      else if (grade === 'B') gradeColor = 'grade-B';
                      else if (grade === 'C') gradeColor = 'grade-C';
                      else if (grade === 'D') gradeColor = 'grade-D';
                      
                      return (
                        <tr key={student._id} className={`table-row ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="text-center font-medium text-gray-700">
                            {student.rollNumber || '-'}
                          </td>
                          <td className="text-center">
                            <Avatar name={student.name} image={studentImage} size={40} />
                          </td>
                          <td className="font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="text-center text-gray-700">
                            {student.sex || '-'}
                          </td>
                          <td className="text-center text-gray-700">
                            {student.age || '-'}
                          </td>
                          <td className="text-center">
                            <input 
                              type="number" 
                              min="0" 
                              max={maxScore} 
                              value={score} 
                              onChange={(e) => handleGradeChange(student._id, 'score', e.target.value)} 
                              className={`input-score ${score !== '' && score !== '0' ? 'has-value' : ''}`}
                              placeholder="-"
                            />
                          </td>
                          <td className="text-center">
                            <span className={`text-sm font-semibold ${score && score > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                              {score && score > 0 ? `${percentage.toFixed(1)}%` : '-'}
                            </span>
                          </td>
                          <td className="text-center">
                            {score && score > 0 ? (
                              <span className={`grade-badge ${gradeColor}`}>
                                {grade}
                              </span>
                            ) : '-'}
                          </td>
                          <td>
                            <input 
                              type="text" 
                              placeholder="Optional" 
                              value={gradeRecords[student._id]?.remarks || ''} 
                              onChange={(e) => handleGradeChange(student._id, 'remarks', e.target.value)} 
                              className="input-remarks"
                            />
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition flex items-center gap-1 mx-auto"
                              type="button"
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
                      <td colSpan="5" className="px-4 py-3 text-sm font-bold text-gray-700">
                        Class Summary
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-gray-600">
                          {students.filter(s => gradeRecords[s._id]?.score && gradeRecords[s._id].score !== '').length} / {students.length}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center" colSpan="2">
                        <span className="text-xs font-medium text-gray-600">
                          {students.length > 0 ? 
                            (students.reduce((sum, s) => {
                              const score = parseFloat(gradeRecords[s._id]?.score) || 0;
                              return sum + score;
                            }, 0) / (students.length * maxScore) * 100).toFixed(1) + '%'
                            : '-'}
                        </span>
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button 
              type="submit" 
              disabled={isSubmitting || students.length === 0} 
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Grades'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherEnterMark;