import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { X, User, Mail, Phone, Calendar, BookOpen, Award, TrendingUp, Eye, ChevronLeft, Settings, Search, Download, FileSpreadsheet, RefreshCw, Trophy, BarChart3, ArrowLeft, Users, CheckCircle, XCircle, AlertCircle, GraduationCap, MapPin, Clock, Edit2, Trash2, Printer, Home, School } from 'lucide-react';
import api from '../../services/api';

// ============================================
// 📊 AVATAR COMPONENT
// ============================================
const Avatar = ({ name, image, size = 40 }) => {
  const [imgError, setImgError] = useState(false);
  
  if (image && !imgError) {
    return (
      <img 
        src={image} 
        alt={name || 'Student'} 
        className="rounded-full object-cover border-2 border-cyan-200"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
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
// 📊 STUDENT DETAIL PAGE
// ============================================
const StudentDetailPage = ({ student, selectedClass, academicYear, examTypes, examLabels, examMax, onBack }) => {
  if (!student) return null;

  const calculateTotal = (marks) => {
    if (!marks) return 0;
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

  const s1Marks = student.semester1Marks || {};
  const s2Marks = student.semester2Marks || {};
  const s1Total = calculateTotal(s1Marks);
  const s2Total = calculateTotal(s2Marks);
  const s1Grade = getGrade(s1Total);
  const s2Grade = getGrade(s2Total);
  const overallTotal = s1Total + s2Total;
  const overallGrade = getGrade(overallTotal / 2);
  const studentImage = student.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0E7490&color=fff&size=120&font-size=0.5&bold=true`;

  const totalExamTypes = ['quiz', 'test', 'midterm', 'textbook', 'final'];

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
          <ArrowLeft size={18} /> Back to Roster
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
                <span className="detail-badge">Status: {student.status || 'Active'}</span>
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
            <div className="detail-stat-value" style={{color: '#f59e0b'}}>{((overallTotal / 220) * 100).toFixed(1)}%</div>
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
                  <th className="px-4 py-3 text-left text-sm font-bold border border-cyan-700">Exam Type</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Max Score</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Semester 1</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Semester 2</th>
                  <th className="px-4 py-3 text-center text-sm font-bold border border-cyan-700">Difference</th>
                </tr>
              </thead>
              <tbody>
                {totalExamTypes.map((examType) => {
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
                  <td className="px-4 py-3 text-center text-sm text-gray-600 border border-gray-200">110</td>
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
            <ArrowLeft size={18} /> Back to Roster
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📊 MAIN CLASS ROSTER COMPONENT
// ============================================

const ClassRosterMarkList = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [semester1Marks, setSemester1Marks] = useState({});
  const [semester2Marks, setSemester2Marks] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYear, setAcademicYear] = useState('2019-2020');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [allStudentsData, setAllStudentsData] = useState([]);

  // Define exam types at component level
  const examTypes = ['quiz', 'test', 'midterm', 'textbook', 'final'];
  const examMax = { quiz: 10, test: 10, midterm: 20, textbook: 20, final: 50 };
  const examLabels = { 
    quiz: 'Quiz', 
    test: 'Test', 
    midterm: 'Midterm', 
    textbook: 'Textbook', 
    final: 'Final' 
  };

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
      const studentsResponse = await api.get('/users/role/student');
      const allStudents = studentsResponse.data;
      
      const response = await api.get('/classes/my-classes');
      if (response.data && Array.isArray(response.data)) {
        const enrichedClasses = response.data.map(cls => {
          if (cls.students && cls.students.length > 0) {
            const enrichedStudents = cls.students.map(student => {
              const studentId = student._id || student;
              const fullStudent = allStudents.find(s => s._id === studentId);
              return {
                ...(fullStudent || student),
                profileImage: fullStudent?.profileImage || student?.profileImage || null,
                sex: fullStudent?.sex || student?.sex || null,
                age: fullStudent?.age || student?.age || null,
                email: fullStudent?.email || student?.email || null,
                phone: fullStudent?.phone || student?.phone || null,
                address: fullStudent?.address || student?.address || null,
                parentPhone: fullStudent?.parentPhone || student?.parentPhone || null,
              };
            });
            return { ...cls, students: enrichedStudents };
          }
          return cls;
        });
        
        setClasses(enrichedClasses);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}`);
      const enrichedStudents = response.data.students?.map(student => {
        const fullStudent = allStudentsData.find(s => s._id === student._id);
        return {
          ...student,
          profileImage: fullStudent?.profileImage || student?.profileImage || null,
          sex: fullStudent?.sex || student?.sex || null,
          age: fullStudent?.age || student?.age || null,
          email: fullStudent?.email || student?.email || null,
          phone: fullStudent?.phone || student?.phone || null,
          address: fullStudent?.address || student?.address || null,
          parentPhone: fullStudent?.parentPhone || student?.parentPhone || null,
        };
      }) || [];
      return enrichedStudents.sort((a, b) => a.name?.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  const fetchMarksForSemester = async (classId, subjectName, semester) => {
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
    setEditingCell(null);
    setSearchTerm('');
    setShowDetailPage(false);
    setSelectedStudent(null);
    
    try {
      const studentsList = await fetchStudents(cls._id);
      setStudents(studentsList);
      
      const subjectName = cls.subject?.name;
      if (subjectName) {
        const s1Marks = await fetchMarksForSemester(cls._id, subjectName, 'Semester 1');
        const s2Marks = await fetchMarksForSemester(cls._id, subjectName, 'Semester 2');
        setSemester1Marks(s1Marks);
        setSemester2Marks(s2Marks);
      } else {
        setSemester1Marks({});
        setSemester2Marks({});
      }
      
      toast.success(`Loaded ${studentsList.length} students`);
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
      const studentsList = await fetchStudents(selectedClass._id);
      setStudents(studentsList);
      
      const subjectName = selectedClass.subject?.name;
      if (subjectName) {
        const s1Marks = await fetchMarksForSemester(selectedClass._id, subjectName, 'Semester 1');
        const s2Marks = await fetchMarksForSemester(selectedClass._id, subjectName, 'Semester 2');
        setSemester1Marks(s1Marks);
        setSemester2Marks(s2Marks);
        toast.success('Marks refreshed successfully');
      }
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    
    const { studentId, examType, semester, maxScore, markId } = editingCell;
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
        const s1Marks = await fetchMarksForSemester(selectedClass._id, subjectName, 'Semester 1');
        const s2Marks = await fetchMarksForSemester(selectedClass._id, subjectName, 'Semester 2');
        setSemester1Marks(s1Marks);
        setSemester2Marks(s2Marks);
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

  const startEdit = (studentId, examType, semester, currentScore, maxScore, markId) => {
    setEditingCell({ studentId, examType, semester, maxScore, markId });
    setEditValue(currentScore?.toString() || '');
  };

  const calculateTotal = (marks) => {
    if (!marks) return 0;
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

  const getMarksBySemester = (studentId, semester) => {
    if (semester === 'Semester 1') {
      return semester1Marks[studentId] || {};
    } else {
      return semester2Marks[studentId] || {};
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
    const name = student.name || 'Student';
    const colorPalette = ['0E7490', '0891B2', '06B6D4', '22D3EE', '3B82F6', '6366F1', '8B5CF6'];
    const colorIndex = name.length % colorPalette.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colorPalette[colorIndex]}&color=fff&size=120&font-size=0.5&bold=true`;
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toString().includes(searchTerm)
  );

  const handleViewDetails = (student) => {
    const fullStudent = allStudentsData.find(s => s._id === student._id) || student;
    setSelectedStudent({
      ...fullStudent,
      semester1Marks: semester1Marks[student._id] || {},
      semester2Marks: semester2Marks[student._id] || {}
    });
    setShowDetailPage(true);
  };

  const handleBackToRoster = () => {
    setShowDetailPage(false);
    setSelectedStudent(null);
  };

  // Show Detail Page if selected
  if (showDetailPage && selectedStudent) {
    return (
      <StudentDetailPage 
        student={selectedStudent}
        selectedClass={selectedClass}
        academicYear={academicYear}
        examTypes={examTypes}
        examLabels={examLabels}
        examMax={examMax}
        onBack={handleBackToRoster}
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
                <h2 className="hero-title">📚 Class Roster Management</h2>
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
              <p className="text-gray-500 text-lg font-semibold">No classes available</p>
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
                    View Roster →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main roster table view
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <style>{`
        .roster-container { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .roster-header {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #22d3ee 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
        }
        .roster-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 12px;
          margin-right: 6px;
          margin-top: 4px;
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
        .search-box {
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
      `}</style>

      <div className="roster-container">
        <div className="roster-header">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <button
                onClick={() => {
                  setSelectedClass(null);
                }}
                className="text-white/80 hover:text-white mb-2 flex items-center gap-1 transition"
              >
                <ChevronLeft size={20} /> Back to Classes
              </button>
              <h2 className="text-2xl font-bold">{selectedClass.grade} - {selectedClass.section}</h2>
              <p className="text-cyan-100 mt-1">
                Subject: {selectedClass.subject?.name || 'N/A'} | Total Students: {students.length}
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
                  const exportData = [];
                  filteredStudents.forEach(s => {
                    const s1Marks = getMarksBySemester(s._id, 'Semester 1');
                    const s2Marks = getMarksBySemester(s._id, 'Semester 2');
                    const s1Total = calculateTotal(s1Marks);
                    const s2Total = calculateTotal(s2Marks);
                    
                    exportData.push({
                      'Roll No': s.rollNumber,
                      'Student Name': s.name,
                      'Gender': s.sex || '-',
                      'Age': s.age || '-',
                      'Semester': 'Semester 1',
                      'Quiz': s1Marks.quiz?.score || 0,
                      'Test': s1Marks.test?.score || 0,
                      'Midterm': s1Marks.midterm?.score || 0,
                      'Textbook': s1Marks.textbook?.score || 0,
                      'Final': s1Marks.final?.score || 0,
                      'Total': s1Total,
                      'Grade': getGrade(s1Total),
                    });
                    
                    exportData.push({
                      'Roll No': s.rollNumber,
                      'Student Name': s.name,
                      'Gender': s.sex || '-',
                      'Age': s.age || '-',
                      'Semester': 'Semester 2',
                      'Quiz': s2Marks.quiz?.score || 0,
                      'Test': s2Marks.test?.score || 0,
                      'Midterm': s2Marks.midterm?.score || 0,
                      'Textbook': s2Marks.textbook?.score || 0,
                      'Final': s2Marks.final?.score || 0,
                      'Total': s2Total,
                      'Grade': getGrade(s2Total),
                    });
                  });
                  
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Roster');
                  XLSX.writeFile(wb, `Class_Roster_${selectedClass.grade}_${selectedClass.section}.xlsx`);
                  toast.success('Export successful!');
                }}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2"
              >
                <FileSpreadsheet size={18} />
                Export Excel
              </button>
              <button
                onClick={() => setSelectedClass(null)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition font-semibold"
              >
                Change Class
              </button>
            </div>
          </div>
        </div>

        <div className="search-box">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          {searchTerm && (
            <p className="text-xs text-gray-600 mt-2 font-medium">
              Found <span className="font-bold text-gray-800">{filteredStudents.length}</span> student{filteredStudents.length !== 1 ? 's' : ''}
            </p>
          )}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full md:w-64 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="2023-2024">2019-2020</option>
              <option value="2024-2025">2020-2021</option>
              <option value="2025-2026">2021-2022</option>
            </select>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="stat-label">Total Students</div>
            <div className="stat-value" style={{color: '#3b82f6'}}>{students.length}</div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#10b981'}}>
            <div className="stat-label">Semester 1 Average</div>
            <div className="stat-value" style={{color: '#10b981'}}>
              {students.length > 0 ? (
                (students.reduce((sum, s) => sum + calculateTotal(semester1Marks[s._id] || {}), 0) / students.length).toFixed(1)
              ) : '−'}
            </div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="stat-label">Semester 2 Average</div>
            <div className="stat-value" style={{color: '#8b5cf6'}}>
              {students.length > 0 ? (
                (students.reduce((sum, s) => sum + calculateTotal(semester2Marks[s._id] || {}), 0) / students.length).toFixed(1)
              ) : '−'}
            </div>
          </div>
          <div className="stat-card" style={{borderTopColor: '#f59e0b'}}>
            <div className="stat-label">Academic Year</div>
            <div className="stat-value" style={{color: '#f59e0b'}}>{academicYear}</div>
          </div>
        </div>

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
                    <th className="text-center  whitespace-nowrap min-w-[42px]">Roll No</th>
                    <th className="text-center">Photo</th>
                    <th className="text-left  whitespace-nowrap min-w-[42px]">Student Name</th>
                    <th className="text-center">Semester</th>
                    <th className="text-center">Gender</th>
                    <th className="text-center">Age</th>
                    {examTypes.map((exam) => (
                      <th key={exam} className="text-center">{examLabels[exam]}</th>
                    ))}
                    <th className="text-center">Total</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const s1Marks = getMarksBySemester(student._id, 'Semester 1');
                    const s2Marks = getMarksBySemester(student._id, 'Semester 2');
                    const s1Total = calculateTotal(s1Marks);
                    const s2Total = calculateTotal(s2Marks);
                    const s1Grade = getGrade(s1Total);
                    const s2Grade = getGrade(s2Total);
                    const studentImage = getStudentImage(student);
                    
                    const semesters = [
                      { 
                        name: 'Semester 1', 
                        marks: s1Marks, 
                        total: s1Total, 
                        grade: s1Grade,
                        bg: 'bg-blue-50'
                      },
                      { 
                        name: 'Semester 2', 
                        marks: s2Marks, 
                        total: s2Total, 
                        grade: s2Grade,
                        bg: 'bg-green-50'
                      }
                    ];
                    
                    return semesters.map((sem, idx) => {
                      const isEditing = editingCell?.studentId === student._id && 
                                       editingCell?.semester === sem.name;
                      
                      return (
                        <tr key={`${student._id}-${sem.name}`} className="table-row">
                          {idx === 0 ? (
                            <td className="text-center font-medium text-gray-700 " rowSpan="2">
                              {student.rollNumber}
                            </td>
                          ) : null}
                          {idx === 0 ? (
                            <td className="text-center " rowSpan="2">
                              <Avatar name={student.name} image={studentImage} size={40} />
                            </td>
                          ) : null}
                          {idx === 0 ? (
                            <td className="font-medium text-gray-900" rowSpan="2">
                              <button
                                onClick={() => handleViewDetails(student)}
                                className="hover:text-cyan-600 hover:underline transition  whitespace-nowrap min-w-[42px]"
                              >
                                {student.name}
                              </button>
                            </td>
                          ) : null}
                          <td className={`text-center font-semibold ${sem.bg}  whitespace-nowrap min-w-[42px]`}>
                            {sem.name}
                          </td>
                          {idx === 0 ? (
                            <td className="text-center" rowSpan="2">
                              {student.sex || '-'}
                            </td>
                          ) : null}
                          {idx === 0 ? (
                            <td className="text-center" rowSpan="2">
                              {student.age || '-'}
                            </td>
                          ) : null}
                          
                          {examTypes.map((examType) => {
                            const mark = sem.marks[examType];
                            const score = mark?.score;
                            const maxScore = examMax[examType];
                            const isEditingCell = isEditing && editingCell?.examType === examType;
                            
                            return (
                              <td key={examType} className="text-center">
                                {isEditingCell ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      max={maxScore}
                                      min="0"
                                      className="w-12 px-1 py-0.5 border border-cyan-400 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                      autoFocus
                                    />
                                    <button
                                      onClick={saveEdit}
                                      className="px-1.5 py-0.5 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="px-1.5 py-0.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startEdit(student._id, examType, sem.name, score, maxScore, mark?._id)}
                                    className="w-full px-1 py-1 text-sm font-medium text-cyan-600 hover:bg-cyan-100 rounded transition"
                                  >
                                    {score !== undefined && score !== null ? score : '-'}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                          
                          <td className="text-center font-bold text-cyan-700">
                            {sem.total}
                          </td>
                          <td className="text-center">
                            <span className={`grade-badge grade-${sem.grade}`}>
                              {sem.grade}
                            </span>
                          </td>
                          {idx === 0 ? (
                            <td className="text-center" rowSpan="2">
                              <button
                                onClick={() => handleViewDetails(student)}
                                className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition flex items-center gap-1 mx-auto"
                              >
                                <Eye size={14} /> Details
                              </button>
                            </td>
                          ) : null}
                        </tr>
                      );
                    });
                  })}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="6" className="px-4 py-3 text-sm font-bold text-gray-700">
                      Semester 1 Average
                    </td>
                    {examTypes.map((examType) => {
                      const scores = filteredStudents
                        .map(s => semester1Marks[s._id]?.[examType]?.score || 0)
                        .filter(s => s > 0);
                      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                      return (
                        <td key={`s1-avg-${examType}`} className="text-center">
                          <span className="text-xs font-medium text-gray-600">
                            {avg > 0 ? avg.toFixed(1) : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-center">
                      <span className="text-xs font-medium text-gray-600">
                        {filteredStudents.length > 0 ? 
                          (filteredStudents.reduce((sum, s) => sum + calculateTotal(semester1Marks[s._id] || {}), 0) / filteredStudents.length).toFixed(1) 
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
                      Semester 2 Average
                    </td>
                    {examTypes.map((examType) => {
                      const scores = filteredStudents
                        .map(s => semester2Marks[s._id]?.[examType]?.score || 0)
                        .filter(s => s > 0);
                      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                      return (
                        <td key={`s2-avg-${examType}`} className="text-center">
                          <span className="text-xs font-medium text-gray-600">
                            {avg > 0 ? avg.toFixed(1) : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-center">
                      <span className="text-xs font-medium text-gray-600">
                        {filteredStudents.length > 0 ? 
                          (filteredStudents.reduce((sum, s) => sum + calculateTotal(semester2Marks[s._id] || {}), 0) / filteredStudents.length).toFixed(1) 
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
                        {filteredStudents.length} Students
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

export default ClassRosterMarkList;