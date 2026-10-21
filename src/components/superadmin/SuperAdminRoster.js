import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { X, User, Mail, Phone, Calendar, BookOpen, Award, TrendingUp, Eye, ChevronLeft, Settings, Search, Download, FileSpreadsheet, RefreshCw, Trophy, BarChart3, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const ClassRosterMarkList = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [semester1Marks, setSemester1Marks] = useState({});
  const [semester2Marks, setSemester2Marks] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('roster'); // 'roster' or 'detail'
  const [allStudentsData, setAllStudentsData] = useState([]);
  const [saveSpace, setSaveSpace] = useState(() => {
    return localStorage.getItem('roster_save_space') === 'true';
  });

  // Define exam types
  const examTypes = ['quiz', 'test', 'midterm', 'textbook', 'final'];
  const examMax = { quiz: 10, test: 10, midterm: 20, textbook: 20, final: 50 };
  const examLabels = { 
    quiz: 'Quiz', 
    test: 'Test', 
    midterm: 'Midterm', 
    textbook: 'Textbook', 
    final: 'Final' 
  };

  const getClassSubjects = (classData) => {
    if (!classData) return [];
    return classData.subjects || [];
  };

  useEffect(() => {
    fetchAllStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    localStorage.setItem('roster_save_space', saveSpace);
  }, [saveSpace]);

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
      
      const userData = localStorage.getItem('user');
      let role = 'admin';
      let teacherId = null;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          role = user.role || 'admin';
          teacherId = user._id;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      const studentsResponse = await api.get('/users/role/student');
      const allStudents = studentsResponse.data;
      
      let response;
      
      if (role === 'teacher' && teacherId) {
        try {
          response = await api.get(`/classes/teacher/${teacherId}`);
        } catch (err) {
          console.log('Teacher classes endpoint not available, fetching all classes');
          response = await api.get('/classes');
        }
      } else {
        response = await api.get('/classes');
      }
      
      console.log('Fetched classes response:', response.data);
      
      let classesData = [];
      
      if (Array.isArray(response.data)) {
        classesData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        classesData = response.data.data;
      } else if (response.data && response.data.classes && Array.isArray(response.data.classes)) {
        classesData = response.data.classes;
      } else if (response.data && typeof response.data === 'object') {
        classesData = [response.data];
      }
      
      const enrichedClasses = classesData.map(cls => {
        if (cls.students && cls.students.length > 0) {
          const enrichedStudents = cls.students.map(student => {
            const studentId = student._id || student;
            const fullStudent = allStudents.find(s => s._id === studentId);
            return {
              ...(fullStudent || student),
              profileImage: fullStudent?.profileImage || student?.profileImage || null,
              sex: fullStudent?.sex || student?.sex || null,
              age: fullStudent?.age || student?.age || null
            };
          });
          return { ...cls, students: enrichedStudents };
        }
        return cls;
      });
      
      setClasses(enrichedClasses);
      
      if (enrichedClasses.length === 0) {
        toast.info('No classes found. Please add classes first.');
      } else {
        toast.success(`Loaded ${enrichedClasses.length} class(es)`);
      }
      
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes: ' + (error.response?.data?.error || error.message));
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}`);
      const classData = response.data;
      
      let studentsList = classData.students || [];
      
      if (!Array.isArray(studentsList)) {
        studentsList = [];
      }
      
      const enrichedStudents = studentsList.map(student => {
        const fullStudent = allStudentsData.find(s => s._id === student._id);
        return {
          ...student,
          profileImage: fullStudent?.profileImage || student?.profileImage || null,
          sex: fullStudent?.sex || student?.sex || null,
          age: fullStudent?.age || student?.age || null
        };
      });
      
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
    setSearchTerm('');
    setViewMode('roster');
    setSelectedStudent(null);
    
    try {
      const studentsList = await fetchStudents(cls._id);
      setStudents(studentsList);
      
      const subjects = getClassSubjects(cls);
      
      const s1MarksMap = {};
      const s2MarksMap = {};
      
      if (subjects.length > 0) {
        for (const subject of subjects) {
          const subjectName = subject.name || subject;
          const s1Marks = await fetchMarksForSemester(cls._id, subjectName, 'Semester 1');
          const s2Marks = await fetchMarksForSemester(cls._id, subjectName, 'Semester 2');
          
          Object.keys(s1Marks).forEach(studentId => {
            if (!s1MarksMap[studentId]) s1MarksMap[studentId] = {};
            s1MarksMap[studentId][subjectName] = s1Marks[studentId];
          });
          
          Object.keys(s2Marks).forEach(studentId => {
            if (!s2MarksMap[studentId]) s2MarksMap[studentId] = {};
            s2MarksMap[studentId][subjectName] = s2Marks[studentId];
          });
        }
      }
      
      setSemester1Marks(s1MarksMap);
      setSemester2Marks(s2MarksMap);
      
      toast.success(`Loaded ${studentsList.length} students with ${subjects.length} subjects`);
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
      await handleClassSelect(selectedClass);
      setLoading(false);
    }
  };

  const calculateSubjectTotal = (marks) => {
    if (!marks) return 0;
    let total = 0;
    if (marks.quiz?.score) total += marks.quiz.score;
    if (marks.test?.score) total += marks.test.score;
    if (marks.midterm?.score) total += marks.midterm.score;
    if (marks.textbook?.score) total += marks.textbook.score;
    if (marks.final?.score) total += marks.final.score;
    return total;
  };

  const calculateOverallTotal = (studentId, semester) => {
    const marksMap = semester === 'Semester 1' ? semester1Marks : semester2Marks;
    const studentMarks = marksMap[studentId] || {};
    let total = 0;
    Object.keys(studentMarks).forEach(subject => {
      total += calculateSubjectTotal(studentMarks[subject]);
    });
    return total;
  };

  const getGrade = (total) => {
    if (total >= 90) return { letter: 'A+', color: '#059669', bg: '#d1fae5' };
    if (total >= 80) return { letter: 'A', color: '#0891b2', bg: '#cffafe' };
    if (total >= 75) return { letter: 'B+', color: '#2563eb', bg: '#dbeafe' };
    if (total >= 70) return { letter: 'B', color: '#7c3aed', bg: '#ede9fe' };
    if (total >= 60) return { letter: 'C', color: '#f59e0b', bg: '#fef3c7' };
    if (total >= 50) return { letter: 'D', color: '#f97316', bg: '#ffedd5' };
    return { letter: 'F', color: '#dc2626', bg: '#fee2e2' };
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
    const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
    const colorIndex = name.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colors[colorIndex].replace('#', '')}&color=fff&size=40&font-size=0.5&bold=true`;
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber?.toString().includes(searchTerm)
  );

  const handleViewDetails = (student) => {
    const fullStudent = allStudentsData.find(s => s._id === student._id) || student;
    setSelectedStudent(fullStudent);
    setViewMode('detail');
  };

  const handleBackToRoster = () => {
    setSelectedStudent(null);
    setViewMode('roster');
  };

  // ==========================================
  // STUDENT DETAIL VIEW (Separate Page)
  // ==========================================
  if (viewMode === 'detail' && selectedStudent) {
    const subjects = getClassSubjects(selectedClass);
    const s1Marks = semester1Marks[selectedStudent._id] || {};
    const s2Marks = semester2Marks[selectedStudent._id] || {};
    const studentImage = getStudentImage(selectedStudent);
    const numberOfSubjects = subjects.length;
    
    // Calculate totals
    let s1Total = 0;
    let s2Total = 0;
    
    const subjectTotals = subjects.map(subject => {
      const subjectName = subject.name || subject;
      const s1Subject = s1Marks[subjectName] || {};
      const s2Subject = s2Marks[subjectName] || {};
      const s1SubjectTotal = calculateSubjectTotal(s1Subject);
      const s2SubjectTotal = calculateSubjectTotal(s2Subject);
      s1Total += s1SubjectTotal;
      s2Total += s2SubjectTotal;
      
      return {
        subjectName,
        s1Total: s1SubjectTotal,
        s2Total: s2SubjectTotal,
        s1Marks: s1Subject,
        s2Marks: s2Subject
      };
    });
    
    // Calculate AVERAGES (Total divided by number of subjects)
    const s1Average = numberOfSubjects > 0 ? s1Total / numberOfSubjects : 0;
    const s2Average = numberOfSubjects > 0 ? s2Total / numberOfSubjects : 0;
    
    const s1Grade = getGrade(s1Average);
    const s2Grade = getGrade(s2Average);
    const overallTotal = s1Total + s2Total;
    const overallAverage = numberOfSubjects > 0 ? (s1Average + s2Average) / 2 : 0;
    const overallGrade = getGrade(overallAverage);

    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <style>{`
          .detail-header {
            background: linear-gradient(135deg, #0e7490, #0891b2);
            color: white;
            padding: 40px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(8, 145, 178, 0.2);
          }
          .detail-header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 20px;
          }
          .student-header-info h3 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
          .detail-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-right: 8px;
          }
          .action-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
          .cert-btn {
            background: #22d3ee;
            color: #0f172a;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 14px;
          }
          .cert-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(34, 211, 238, 0.3); }
          .cert-btn-back { background: #6b7280; color: white; }
          .cert-btn-back:hover { background: #4b5563; }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            text-align: center;
            border-top: 4px solid #0891b2;
          }
          .stat-card-value { font-size: 32px; font-weight: 700; color: #0e7490; margin: 10px 0; }
          .stat-card-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
        `}</style>

        {/* Detail Header */}
        <div className="detail-header">
          <div className="detail-header-content">
            <div className="student-header-info flex items-center gap-4">
              <img
                src={studentImage}
                alt={selectedStudent.name}
                className="w-48 h-48  object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=0E7490&color=fff&size=80&font-size=0.5&bold=true`;
                }}
              />
              <div>
                <h3 style={{ whiteSpace: 'nowrap' }}>{selectedStudent.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="detail-badge">Roll No: {selectedStudent.rollNumber}</span>
                  <span className="detail-badge">Class: {selectedClass.grade}-{selectedClass.section}</span>
                  <span className="detail-badge">Gender: {selectedStudent.sex || 'N/A'}</span>
                  <span className="detail-badge">Age: {selectedStudent.age || 'N/A'}</span>
                  <span className="detail-badge">{academicYear}</span>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button 
                onClick={handleBackToRoster}
                className="cert-btn cert-btn-back flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back to Roster
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="stat-card-label">Semester 1 Total</div>
            <div className="stat-card-value" style={{color: '#3b82f6'}}>{s1Total}</div>
            <p className="text-sm" style={{color: s1Grade.color}}>Avg: {s1Average.toFixed(1)} | Grade: {s1Grade.letter}</p>
          </div>
          <div className="stat-card" style={{borderTopColor: '#22c55e'}}>
            <div className="stat-card-label">Semester 2 Total</div>
            <div className="stat-card-value" style={{color: '#22c55e'}}>{s2Total}</div>
            <p className="text-sm" style={{color: s2Grade.color}}>Avg: {s2Average.toFixed(1)} | Grade: {s2Grade.letter}</p>
          </div>
          <div className="stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="stat-card-label">Overall Total</div>
            <div className="stat-card-value" style={{color: '#8b5cf6'}}>{overallTotal}</div>
            <p className="text-sm" style={{color: overallGrade.color}}>Avg: {overallAverage.toFixed(1)} | Grade: {overallGrade.letter}</p>
          </div>
          <div className="stat-card" style={{borderTopColor: '#f59e0b'}}>
            <div className="stat-card-label">Performance</div>
            <div className="stat-card-value" style={{color: '#f59e0b'}}>{((overallTotal / (subjects.length * 110)) * 100).toFixed(1)}%</div>
            <p className="text-sm text-gray-500">Overall Score</p>
          </div>
        </div>

        {/* Semester 1 Table with Exam Types */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📘 Semester 1 - Detailed Marks</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                  <th className="p-3 text-left text-sm font-bold border border-gray-200">Subject</th>
                  {examTypes.map(exam => (
                    <th key={`s1-${exam}`} className="p-2 text-center text-xs font-bold border border-gray-200">{examLabels[exam]}</th>
                  ))}
                  <th className="p-2 text-center text-sm font-bold border border-gray-200 text-blue-700">Total</th>
                  <th className="p-2 text-center text-sm font-bold border border-gray-200 text-blue-700">Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjectTotals.map((item, idx) => {
                  const grade = getGrade(item.s1Total);
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 text-sm font-medium text-gray-700 border border-gray-200">{item.subjectName}</td>
                      {examTypes.map(exam => (
                        <td key={`s1-${idx}-${exam}`} className="p-2 text-center text-sm border border-gray-200">
                          {item.s1Marks[exam]?.score || '-'}
                        </td>
                      ))}
                      <td className="p-2 text-center text-sm font-bold text-blue-600 border border-gray-200">{item.s1Total}</td>
                      <td className="p-2 text-center border border-gray-200">
                        <span className="px-2 py-1 rounded text-xs font-bold" style={{background: grade.bg, color: grade.color}}>
                          {grade.letter}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-blue-50 font-bold">
                  <td className="p-3 text-sm text-gray-700 border border-gray-200">Grand Total</td>
                  {examTypes.map(exam => {
                    const total = subjectTotals.reduce((sum, item) => sum + (item.s1Marks[exam]?.score || 0), 0);
                    return (
                      <td key={`s1-total-${exam}`} className="p-2 text-center text-sm text-blue-700 border border-gray-200">{total}</td>
                    );
                  })}
                  <td className="p-2 text-center text-sm text-blue-700 border border-gray-200">{s1Total}</td>
                  <td className="p-2 text-center border border-gray-200">
                    <span className="px-2 py-1 rounded text-xs font-bold" style={{background: s1Grade.bg, color: s1Grade.color}}>
                      {s1Grade.letter}
                    </span>
                  </td>
                </tr>
                {/* Average Row */}
                <tr className="bg-blue-100 font-bold">
                  <td className="p-3 text-sm text-blue-700 border border-gray-200">📊 AVERAGE</td>
                  <td colSpan={examTypes.length} className="p-2 text-center text-sm text-gray-600 border border-gray-200">-</td>
                  <td className="p-2 text-center text-sm font-bold text-blue-700 border border-gray-200">{s1Average.toFixed(1)}</td>
                  <td className="p-2 text-center border border-gray-200">
                    <span className="px-2 py-1 rounded text-xs font-bold" style={{background: s1Grade.bg, color: s1Grade.color}}>
                      {s1Grade.letter}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Semester 2 Table with Exam Types */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📗 Semester 2 - Detailed Marks</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                  <th className="p-3 text-left text-sm font-bold border border-gray-200">Subject</th>
                  {examTypes.map(exam => (
                    <th key={`s2-${exam}`} className="p-2 text-center text-xs font-bold border border-gray-200">{examLabels[exam]}</th>
                  ))}
                  <th className="p-2 text-center text-sm font-bold border border-gray-200 text-green-700">Total</th>
                  <th className="p-2 text-center text-sm font-bold border border-gray-200 text-green-700">Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjectTotals.map((item, idx) => {
                  const grade = getGrade(item.s2Total);
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 text-sm font-medium text-gray-700 border border-gray-200">{item.subjectName}</td>
                      {examTypes.map(exam => (
                        <td key={`s2-${idx}-${exam}`} className="p-2 text-center text-sm border border-gray-200">
                          {item.s2Marks[exam]?.score || '-'}
                        </td>
                      ))}
                      <td className="p-2 text-center text-sm font-bold text-green-600 border border-gray-200">{item.s2Total}</td>
                      <td className="p-2 text-center border border-gray-200">
                        <span className="px-2 py-1 rounded text-xs font-bold" style={{background: grade.bg, color: grade.color}}>
                          {grade.letter}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-green-50 font-bold">
                  <td className="p-3 text-sm text-gray-700 border border-gray-200">Grand Total</td>
                  {examTypes.map(exam => {
                    const total = subjectTotals.reduce((sum, item) => sum + (item.s2Marks[exam]?.score || 0), 0);
                    return (
                      <td key={`s2-total-${exam}`} className="p-2 text-center text-sm text-green-700 border border-gray-200">{total}</td>
                    );
                  })}
                  <td className="p-2 text-center text-sm text-green-700 border border-gray-200">{s2Total}</td>
                  <td className="p-2 text-center border border-gray-200">
                    <span className="px-2 py-1 rounded text-xs font-bold" style={{background: s2Grade.bg, color: s2Grade.color}}>
                      {s2Grade.letter}
                    </span>
                  </td>
                </tr>
                {/* Average Row */}
                <tr className="bg-green-100 font-bold">
                  <td className="p-3 text-sm text-green-700 border border-gray-200">📊 AVERAGE</td>
                  <td colSpan={examTypes.length} className="p-2 text-center text-sm text-gray-600 border border-gray-200">-</td>
                  <td className="p-2 text-center text-sm font-bold text-green-700 border border-gray-200">{s2Average.toFixed(1)}</td>
                  <td className="p-2 text-center border border-gray-200">
                    <span className="px-2 py-1 rounded text-xs font-bold" style={{background: s2Grade.bg, color: s2Grade.color}}>
                      {s2Grade.letter}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Summary */}
        <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📊 Semester Comparison</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                <p className="text-sm font-semibold text-blue-700">Semester 1</p>
                <p className="text-2xl font-bold text-blue-700">{s1Total}</p>
                <p className="text-xs text-blue-600">Avg: {s1Average.toFixed(1)} | Grade: {s1Grade.letter}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                <p className="text-sm font-semibold text-green-700">Semester 2</p>
                <p className="text-2xl font-bold text-green-700">{s2Total}</p>
                <p className="text-xs text-green-600">Avg: {s2Average.toFixed(1)} | Grade: {s2Grade.letter}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center">
                <p className="text-sm font-semibold text-purple-700">Difference</p>
                <p className={`text-2xl font-bold ${s2Total - s1Total > 0 ? 'text-green-600' : s2Total - s1Total < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {s2Total - s1Total > 0 ? '+' : ''}{s2Total - s1Total}
                </p>
                <p className="text-xs text-purple-600">{s2Total - s1Total > 0 ? 'Improved' : s2Total - s1Total < 0 ? 'Declined' : 'Same'}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
                <p className="text-sm font-semibold text-amber-700">Overall Average</p>
                <p className="text-2xl font-bold text-amber-700">{overallAverage.toFixed(1)}</p>
                <p className="text-xs text-amber-600">Grade: {overallGrade.letter}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CLASS SELECTOR VIEW
  // ==========================================
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
            padding: 50px;
            border-radius: 15px;
            margin-bottom: 40px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(8, 145, 178, 0.3);
          }
          .hero-title { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 800; margin-bottom: 15px; letter-spacing: 1px; }
          .hero-subtitle { font-size: 16px; opacity: 0.9; }
          .classes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
          .class-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid transparent;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
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
            transform: translateY(-8px);
            box-shadow: 0 12px 30px rgba(8, 145, 178, 0.2);
            border-color: #0891b2;
          }
          .class-icon { font-size: 48px; margin-bottom: 15px; }
          .class-title { font-size: 22px; font-weight: 700; color: #1a202c; margin-bottom: 10px; }
          .class-info { color: #666; font-size: 14px; margin-bottom: 15px; }
          .class-stats { display: flex; gap: 15px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
          .stat-item { flex: 1; text-align: center; }
          .stat-number { font-size: 18px; font-weight: 700; color: #0891b2; }
          .stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
          .class-button {
            width: 100%;
            background: linear-gradient(135deg, #0e7490, #0891b2);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
            transition: all 0.3s;
          }
          .class-button:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(8, 145, 178, 0.3); }
          .loading-spinner {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #0891b2;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <div className="class-selector-container">
          <div className="hero-section">
            <div className="flex justify-center mb-4">
              <BookOpen size={48} />
            </div>
            <h2 className="hero-title">📚 Class Roster Management</h2>
            <p className="hero-subtitle">Select a class to view and manage student marks</p>
          </div>
          
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p className="ml-4 text-gray-600 font-medium">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-lg font-semibold text-gray-600">No classes found</p>
              <p className="text-sm text-gray-400 mt-2">Please add classes first</p>
              <button
                onClick={fetchClasses}
                className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
              >
                Refresh Classes
              </button>
            </div>
          ) : (
            <div className="classes-grid">
              {classes.map((cls) => (
                <div key={cls._id} className="class-card">
                  <div className="class-icon">📖</div>
                  <h3 className="class-title">Grade {cls.grade}</h3>
                  <p className="class-info">Section {cls.section}</p>
                  {cls.subject?.name && (
                    <div className="inline-block bg-cyan-100 text-cyan-800 text-xs px-3 py-1 rounded-full">
                      {cls.subject.name}
                    </div>
                  )}
                  <div className="class-stats">
                    <div className="stat-item">
                      <div className="stat-number">{cls.students?.length || 0}</div>
                      <div className="stat-label">Students</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{cls.subjects?.length || 0}</div>
                      <div className="stat-label">Subjects</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClassSelect(cls)}
                    className="class-button"
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

  // ==========================================
  // ROSTER VIEW
  // ==========================================
  const subjects = getClassSubjects(selectedClass);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        .dashboard-header { margin-bottom: 30px; }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 20px;
        }
        .header-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 800;
          color: #1a202c;
        }
        .header-subtitle { color: #666; margin-top: 5px; }
        .header-controls { display: flex; gap: 10px; flex-wrap: wrap; }
        .control-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .period-selector {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #bae6fd;
          margin-bottom: 20px;
        }
      `}</style>

      <div className="dashboard-header">
        <div className="header-top">
          <div>
            <h2 className="header-title">📊 Class Roster</h2>
            <p className="header-subtitle">
              Grade {selectedClass.grade} - Section {selectedClass.section} | {subjects.length} Subjects | Total Students: {students.length}
            </p>
          </div>
          <div className="header-controls">
            <button
              onClick={() => setSaveSpace(!saveSpace)}
              className="control-btn"
              style={{
                background: saveSpace ? '#059669' : '#e5e7eb',
                color: saveSpace ? 'white' : '#333'
              }}
            >
              <Settings size={18} />
              {saveSpace ? 'Compact' : 'Full'}
            </button>
            <button 
              onClick={() => setSelectedClass(null)} 
              className="control-btn"
              style={{ background: '#f3f4f6', color: '#0891b2' }}
            >
              <ChevronLeft size={18} /> Classes
            </button>
          </div>
        </div>
        
        <div className="period-selector">
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={20} style={{color: '#0891b2'}} />
            <span className="font-semibold text-gray-700">Academic Period Selection:</span>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => {
                const exportData = [];
                filteredStudents.forEach(s => {
                  const s1Marks = semester1Marks[s._id] || {};
                  const s2Marks = semester2Marks[s._id] || {};
                  
                  subjects.forEach(subject => {
                    const subjectName = subject.name || subject;
                    const s1Subject = s1Marks[subjectName] || {};
                    const s2Subject = s2Marks[subjectName] || {};
                    
                    exportData.push({
                      'Roll No': s.rollNumber,
                      'Student Name': s.name,
                      'Gender': s.sex || '-',
                      'Age': s.age || '-',
                      'Semester': 'Semester 1',
                      'Subject': subjectName,
                      'Total': calculateSubjectTotal(s1Subject),
                      'Grade': getGrade(calculateSubjectTotal(s1Subject)).letter,
                    });
                  });
                  
                  subjects.forEach(subject => {
                    const subjectName = subject.name || subject;
                    const s2Subject = s2Marks[subjectName] || {};
                    
                    exportData.push({
                      'Roll No': s.rollNumber,
                      'Student Name': s.name,
                      'Gender': s.sex || '-',
                      'Age': s.age || '-',
                      'Semester': 'Semester 2',
                      'Subject': subjectName,
                      'Total': calculateSubjectTotal(s2Subject),
                      'Grade': getGrade(calculateSubjectTotal(s2Subject)).letter,
                    });
                  });
                });
                
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Roster');
                XLSX.writeFile(wb, `Class_Roster_${selectedClass.grade}_${selectedClass.section}.xlsx`);
                toast.success('Export successful!');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <FileSpreadsheet size={18} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
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
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
            <p className="text-sm text-cyan-700 font-semibold">Total Students</p>
            <p className="text-3xl font-bold text-cyan-700">{students.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold">Semester 1 Average</p>
            <p className="text-3xl font-bold text-blue-700">
              {students.length > 0 ? (
                (students.reduce((sum, s) => sum + calculateOverallTotal(s._id, 'Semester 1'), 0) / students.length).toFixed(1)
              ) : '−'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <p className="text-sm text-green-700 font-semibold">Semester 2 Average</p>
            <p className="text-3xl font-bold text-green-700">
              {students.length > 0 ? (
                (students.reduce((sum, s) => sum + calculateOverallTotal(s._id, 'Semester 2'), 0) / students.length).toFixed(1)
              ) : '−'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <p className="text-sm text-purple-700 font-semibold">Subjects</p>
            <p className="text-3xl font-bold text-purple-700">{subjects.length}</p>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-white  shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading class roster...</p>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No students found</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search term</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                <tr>
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600">Roll No</th>
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600">Photo</th>
                  <th className="p-3 text-left text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Student Name</th>
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Semester</th>
                  {!saveSpace && (
                    <>
                      <th className="p-3 text-left text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Gender</th>
                      <th className="p-3 text-left text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Age</th>
                    </>
                  )}
                  {subjects.map((subject, idx) => {
                    const subjectName = subject.name || subject;
                    return (
                      <th key={idx} className="p-3 text-center text-sm font-bold border border-cyan-600" title={subjectName} style={{ whiteSpace: 'nowrap' }}>
                        {subjectName.length > 8 ? subjectName.substring(0, 8) + '...' : subjectName}
                      </th>
                    );
                  })}
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Total</th>
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Grade</th>
                  <th className="p-3 text-center text-sm font-bold border border-cyan-600" style={{ whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const s1Marks = semester1Marks[student._id] || {};
                  const s2Marks = semester2Marks[student._id] || {};
                  
                  const s1Total = subjects.reduce((sum, subject) => {
                    const subjectName = subject.name || subject;
                    return sum + calculateSubjectTotal(s1Marks[subjectName] || {});
                  }, 0);
                  
                  const s2Total = subjects.reduce((sum, subject) => {
                    const subjectName = subject.name || subject;
                    return sum + calculateSubjectTotal(s2Marks[subjectName] || {});
                  }, 0);
                  
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
                    return (
                      <tr 
                        key={`${student._id}-${sem.name}`} 
                        className={`hover:bg-cyan-50 transition ${idx === 0 ? 'border-t-2 border-gray-200' : ''}`}
                      >
                        {idx === 0 ? (
                          <td className="p-3 text-center text-sm font-semibold text-gray-700 border border-gray-200" rowSpan="2">
                            {student.rollNumber}
                          </td>
                        ) : null}
                        {idx === 0 ? (
                          <td className="p-3 text-center border border-gray-200" rowSpan="2">
                            <img 
                              src={studentImage} 
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-cyan-200 mx-auto cursor-pointer"
                              onClick={() => handleViewDetails(student)}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0E7490&color=fff&size=40&font-size=0.5&bold=true`;
                              }}
                            />
                          </td>
                        ) : null}
                        {idx === 0 ? (
                          <td className="p-3 text-sm font-medium text-gray-900 border border-gray-200" rowSpan="2">
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="hover:text-cyan-600 hover:underline transition"
                              style={{ whiteSpace: 'nowrap' }}
                            >
                              {student.name}
                            </button>
                          </td>
                        ) : null}
                        <td className={`p-3 text-sm font-semibold text-center border border-gray-200 ${sem.bg}`} style={{ whiteSpace: 'nowrap' }}>
                          {sem.name}
                        </td>
                        {!saveSpace && (
                          <>
                            {idx === 0 ? (
                              <td className="p-3 text-sm text-center border border-gray-200" rowSpan="2" style={{ whiteSpace: 'nowrap' }}>
                                {student.sex || '-'}
                              </td>
                            ) : null}
                            {idx === 0 ? (
                              <td className="p-3 text-sm text-center border border-gray-200" rowSpan="2" style={{ whiteSpace: 'nowrap' }}>
                                {student.age || '-'}
                              </td>
                            ) : null}
                          </>
                        )}
                        
                        {subjects.map((subject, subIdx) => {
                          const subjectName = subject.name || subject;
                          const subjectMarks = sem.marks[subjectName] || {};
                          const total = calculateSubjectTotal(subjectMarks);
                          return (
                            <td key={subIdx} className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                              <span className="text-sm font-medium text-blue-600">
                                {total > 0 ? total : '-'}
                              </span>
                            </td>
                          );
                        })}
                        
                        <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-sm font-bold text-cyan-700">{sem.total}</span>
                        </td>
                        <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                          <span 
                            className="px-2 py-1 rounded text-xs font-bold"
                            style={{background: sem.grade.bg, color: sem.grade.color}}
                          >
                            {sem.grade.letter}
                          </span>
                        </td>
                        {idx === 0 ? (
                          <td className="p-2 text-center border border-gray-200" rowSpan="2" style={{ whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => handleViewDetails(student)}
                              className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-700 text-white text-xs font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-800 transition flex items-center gap-1 mx-auto"
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
                  <td colSpan={saveSpace ? 4 : 6} className="p-3 text-sm font-bold text-gray-700 border border-gray-200">
                    Semester 1 Averages
                  </td>
                  {subjects.map((subject, idx) => {
                    const subjectName = subject.name || subject;
                    const scores = filteredStudents
                      .map(s => {
                        const marks = semester1Marks[s._id]?.[subjectName] || {};
                        return calculateSubjectTotal(marks);
                      })
                      .filter(s => s > 0);
                    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                    return (
                      <td key={`s1-avg-${idx}`} className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                        <span className="text-xs font-medium text-gray-600">
                          {avg > 0 ? avg.toFixed(1) : '-'}
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-xs font-medium text-gray-600">
                      {filteredStudents.length > 0 ? 
                        (filteredStudents.reduce((sum, s) => sum + calculateOverallTotal(s._id, 'Semester 1'), 0) / filteredStudents.length).toFixed(1) 
                        : '-'}
                    </span>
                  </td>
                  <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-xs font-medium text-gray-600">-</span>
                  </td>
                  <td className="p-2 text-center border border-gray-200"></td>
                </tr>
                <tr>
                  <td colSpan={saveSpace ? 4 : 6} className="p-3 text-sm font-bold text-gray-700 border border-gray-200">
                    Semester 2 Averages
                  </td>
                  {subjects.map((subject, idx) => {
                    const subjectName = subject.name || subject;
                    const scores = filteredStudents
                      .map(s => {
                        const marks = semester2Marks[s._id]?.[subjectName] || {};
                        return calculateSubjectTotal(marks);
                      })
                      .filter(s => s > 0);
                    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                    return (
                      <td key={`s2-avg-${idx}`} className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                        <span className="text-xs font-medium text-gray-600">
                          {avg > 0 ? avg.toFixed(1) : '-'}
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-xs font-medium text-gray-600">
                      {filteredStudents.length > 0 ? 
                        (filteredStudents.reduce((sum, s) => sum + calculateOverallTotal(s._id, 'Semester 2'), 0) / filteredStudents.length).toFixed(1) 
                        : '-'}
                    </span>
                  </td>
                  <td className="p-2 text-center border border-gray-200" style={{ whiteSpace: 'nowrap' }}>
                    <span className="text-xs font-medium text-gray-600">-</span>
                  </td>
                  <td className="p-2 text-center border border-gray-200"></td>
                </tr>
                <tr>
                  <td colSpan={saveSpace ? 4 : 6} className="p-3 text-sm font-bold text-gray-700 border border-gray-200">
                    Total Students
                  </td>
                  <td colSpan={subjects.length + 3} className="p-3 text-center border border-gray-200">
                    <span className="text-sm font-bold text-cyan-700" style={{ whiteSpace: 'nowrap' }}>
                      {filteredStudents.length} Students | {subjects.length} Subjects
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassRosterMarkList;