import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Download, Search, ChevronLeft, Eye, FileSpreadsheet, Award, Trophy, Calendar, FileText, Printer, Settings, ChevronRight, ChevronsLeft, ChevronsRight, Shield, Star, CheckCircle, Zap, BookOpen, Target, TrendingUp, BarChart3, QrCode, Stamp, PenTool, ShieldCheck, User, Mail, Phone, Users, School, MapPin, GraduationCap, Edit2, RefreshCw, X, Save, Trash2, Home, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import * as XLSX from 'xlsx';

const FailedStudentsReport = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [semester1Marks, setSemester1Marks] = useState({});
  const [semester2Marks, setSemester2Marks] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudentsData, setAllStudentsData] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [semester, setSemester] = useState('Semester 1');
  const [academicYear, setAcademicYear] = useState('2024-2025');

  const [saveSpace, setSaveSpace] = useState(() => {
    return localStorage.getItem('failed_students_save_space') === 'true';
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
    loadClasses(); 
  }, []);
  
  useEffect(() => {
    localStorage.setItem('failed_students_save_space', saveSpace);
  }, [saveSpace]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, semester, academicYear, selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      handleClassSelect(selectedClass);
    }
  }, [semester, academicYear]);

  const fetchAllStudents = async () => {
    try {
      const response = await api.get('/users/role/student');
      setAllStudentsData(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const loadClasses = async () => {
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

  // ✅ EXACT SAME fetchMarksForSemester as ClassRosterMarkList
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

  // ✅ EXACT SAME handleClassSelect as ClassRosterMarkList
  const handleClassSelect = async (cls) => {
    setLoading(true);
    setSelectedClass(cls);
    setSearchTerm('');
    setViewMode('all');
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

  // ✅ EXACT SAME calculateSubjectTotal as ClassRosterMarkList
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

  // ✅ EXACT SAME calculateOverallTotal as ClassRosterMarkList
  const calculateOverallTotal = (studentId, semester) => {
    const marksMap = semester === 'Semester 1' ? semester1Marks : semester2Marks;
    const studentMarks = marksMap[studentId] || {};
    let total = 0;
    Object.keys(studentMarks).forEach(subject => {
      total += calculateSubjectTotal(studentMarks[subject]);
    });
    return total;
  };

  // ✅ EXACT SAME getGrade as ClassRosterMarkList
  const getGrade = (total) => {
    if (total >= 90) return { letter: 'A+', color: '#059669', bg: '#d1fae5' };
    if (total >= 80) return { letter: 'A', color: '#0891b2', bg: '#cffafe' };
    if (total >= 75) return { letter: 'B+', color: '#2563eb', bg: '#dbeafe' };
    if (total >= 70) return { letter: 'B', color: '#7c3aed', bg: '#ede9fe' };
    if (total >= 60) return { letter: 'C', color: '#f59e0b', bg: '#fef3c7' };
    if (total >= 50) return { letter: 'D', color: '#f97316', bg: '#ffedd5' };
    return { letter: 'F', color: '#dc2626', bg: '#fee2e2' };
  };

  // ✅ EXACT SAME getStudentImage as ClassRosterMarkList
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

  // ✅ Get failed students based on overall average
  const getFailedStudents = () => {
    const subjects = getClassSubjects(selectedClass || {});
    
    return filteredStudents
      .map(student => {
        const s1Total = calculateOverallTotal(student._id, 'Semester 1');
        const s2Total = calculateOverallTotal(student._id, 'Semester 2');
        const overallTotal = (s1Total + s2Total) / 2;
        const s1Avg = subjects.length > 0 ? s1Total / subjects.length : 0;
        const s2Avg = subjects.length > 0 ? s2Total / subjects.length : 0;
        const overallAvg = subjects.length > 0 ? overallTotal / subjects.length : 0;
        const grade = getGrade(overallAvg);
        return { 
          ...student, 
          s1Total, 
          s2Total, 
          overallTotal,
          s1Avg,
          s2Avg,
          overallAvg,
          grade,
          numberOfSubjects: subjects.length 
        };
      })
      .filter(student => student.overallAvg < 50) // ✅ ONLY FAILED STUDENTS (below 50%)
      .sort((a, b) => a.overallAvg - b.overallAvg) // Sort lowest to highest
      .map((student, index, array) => {
        let rank = index + 1;
        if (index > 0 && student.overallAvg === array[index - 1].overallAvg) {
          rank = array[index - 1].rank;
        }
        return { ...student, rank };
      });
  };

  const handleExportToExcel = () => {
    const failedStudents = getFailedStudents();
    const subjects = getClassSubjects(selectedClass || {});
    
    const exportData = failedStudents.map(student => {
      const subjectColumns = {};
      subjects.forEach(subject => {
        const subjectName = subject.name || subject;
        const s1Marks = semester1Marks[student._id]?.[subjectName] || {};
        const s2Marks = semester2Marks[student._id]?.[subjectName] || {};
        const s1Total = calculateSubjectTotal(s1Marks);
        const s2Total = calculateSubjectTotal(s2Marks);
        const avgTotal = (s1Total + s2Total) / 2;
        subjectColumns[`${subjectName} (Sem1)`] = s1Total || '-';
        subjectColumns[`${subjectName} (Sem2)`] = s2Total || '-';
        subjectColumns[`${subjectName} (Avg)`] = avgTotal > 0 ? avgTotal.toFixed(1) : '-';
      });
      
      return {
        'Rank': student.rank,
        'Roll No': student.rollNumber,
        'Student Name': student.name,
        'Gender': student.sex || 'Not Specified',
        'Age': student.age || '-',
        ...subjectColumns,
        'Semester 1 Avg': student.s1Avg.toFixed(1) + '%',
        'Semester 2 Avg': student.s2Avg.toFixed(1) + '%',
        'Overall Avg': student.overallAvg.toFixed(1) + '%',
        'Grade': student.grade.letter,
        'Status': 'FAILED',
        'Semester': semester,
        'Academic Year': academicYear
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Failed_Students_${selectedClass.grade}_${selectedClass.section}_${semester}_${academicYear}`);
    XLSX.writeFile(wb, `Failed_Students_${selectedClass.grade}_${selectedClass.section}_${semester}_${academicYear}.xlsx`);
    toast.success('Exported to Excel');
  };

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toString().includes(searchTerm)
  );

  const failedStudents = getFailedStudents();
  const totalPages = Math.ceil(failedStudents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedStudents = failedStudents.slice(startIndex, startIndex + rowsPerPage);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // ==========================================
  // STUDENT DETAIL VIEW
  // ==========================================
  if (viewMode === 'student' && selectedStudent) {
    const subjects = getClassSubjects(selectedClass);
    const s1Marks = semester1Marks[selectedStudent._id] || {};
    const s2Marks = semester2Marks[selectedStudent._id] || {};
    const studentImage = getStudentImage(selectedStudent);
    const numberOfSubjects = subjects.length;
    
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
    
    const s1Average = numberOfSubjects > 0 ? s1Total / numberOfSubjects : 0;
    const s2Average = numberOfSubjects > 0 ? s2Total / numberOfSubjects : 0;
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
          .cert-btn-back { background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 14px; }
          .cert-btn-back:hover { background: #4b5563; transform: translateY(-2px); }
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

        <div className="detail-header">
          <div className="detail-header-content">
            <div className="student-header-info flex items-center gap-4">
              <img
                src={studentImage}
                alt={selectedStudent.name}
                className="w-40 h-40 rounded-full object-cover border-2 border-white"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=4F46E5&color=fff&size=64&font-size=0.5&bold=true`;
                }}
              />
              <div>
                <h3>{selectedStudent.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="detail-badge">Roll No: {selectedStudent.rollNumber}</span>
                  <span className="detail-badge">Class: {selectedClass.grade}-{selectedClass.section}</span>
                  <span className="detail-badge">{semester}</span>
                  <span className="detail-badge">{academicYear}</span>
                  <span className="detail-badge bg-red-500">❌ Failed</span>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button 
                onClick={() => { setSelectedStudent(null); setViewMode('all'); }} 
                className="cert-btn-back"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{borderTopColor: '#3b82f6'}}>
            <div className="stat-card-label">Semester 1 Total</div>
            <div className="stat-card-value" style={{color: '#3b82f6'}}>{s1Total}</div>
            <p className="text-sm" style={{color: getGrade(s1Average).color}}>Avg: {s1Average.toFixed(1)} | Grade: {getGrade(s1Average).letter}</p>
          </div>
          <div className="stat-card" style={{borderTopColor: '#22c55e'}}>
            <div className="stat-card-label">Semester 2 Total</div>
            <div className="stat-card-value" style={{color: '#22c55e'}}>{s2Total}</div>
            <p className="text-sm" style={{color: getGrade(s2Average).color}}>Avg: {s2Average.toFixed(1)} | Grade: {getGrade(s2Average).letter}</p>
          </div>
          <div className="stat-card" style={{borderTopColor: '#8b5cf6'}}>
            <div className="stat-card-label">Overall Avg</div>
            <div className="stat-card-value" style={{color: '#8b5cf6'}}>{overallAverage.toFixed(1)}%</div>
            <p className="text-sm" style={{color: overallGrade.color}}>Grade: {overallGrade.letter}</p>
          </div>
          <div className="stat-card" style={{borderTopColor: '#dc2626'}}>
            <div className="stat-card-label">Status</div>
            <div className="stat-card-value" style={{color: '#dc2626'}}>FAILED</div>
          </div>
        </div>

        {/* Semester 1 Table */}
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
                    <span className="px-2 py-1 rounded text-xs font-bold" style={{background: getGrade(s1Average).bg, color: getGrade(s1Average).color}}>
                      {getGrade(s1Average).letter}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Semester 2 Table */}
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
                    <span className="px-2 py-1 rounded text-xs font-bold" style={{background: getGrade(s2Average).bg, color: getGrade(s2Average).color}}>
                      {getGrade(s2Average).letter}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
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
              <AlertCircle size={48} />
            </div>
            <h2 className="hero-title">❌ Failed Students Report</h2>
            <p className="hero-subtitle">Select a class to view students who scored below 50% average</p>
          </div>
          
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p className="ml-4 text-gray-600 font-medium">Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p className="text-lg font-semibold">No classes found</p>
              <p className="text-sm mt-2">Please add classes first</p>
            </div>
          ) : (
            <div className="classes-grid">
              {classes.map((cls, idx) => (
                <div key={cls._id} className="class-card">
                  <div className="class-icon">📚</div>
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
                    View Failed Students →
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
  // MAIN DASHBOARD VIEW - FAILED STUDENTS ONLY
  // ==========================================
  const subjects = getClassSubjects(selectedClass);
  const failedStudentsList = getFailedStudents();
  const totalFailed = failedStudentsList.length;

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
        .period-controls {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          align-items: center;
        }
        .period-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: 2px solid #bae6fd;
          background: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }
        .period-btn.active {
          background: linear-gradient(135deg, #0e7490, #0891b2);
          color: white;
          border-color: #0891b2;
          transform: scale(1.05);
        }
        .period-btn:hover:not(.active) {
          border-color: #0891b2;
          color: #0891b2;
        }
      `}</style>
      
      <div className="dashboard-header">
        <div className="header-top">
          <div>
            <h2 className="header-title">❌ Failed Students Report</h2>
            <p className="header-subtitle">Grade {selectedClass.grade} - Section {selectedClass.section}</p>
            <p className="text-sm text-red-600 mt-1 font-semibold">
              Total Failed Students: {totalFailed} 
              {students.length > 0 && ` (${((totalFailed / students.length) * 100).toFixed(1)}% of class)`}
            </p>
            <p className="text-xs text-gray-500 mt-1">* Students with average below 50%</p>
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
          <div className="period-controls">
            <button
              onClick={() => setSemester('Semester 1')}
              className={`period-btn ${semester === 'Semester 1' ? 'active' : ''}`}
            >
              📘 Semester 1
            </button>
            <button
              onClick={() => setSemester('Semester 2')}
              className={`period-btn ${semester === 'Semester 2' ? 'active' : ''}`}
            >
              📗 Semester 2
            </button>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      {!loading && failedStudentsList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
            <p className="text-sm text-red-700 font-semibold">Failed Students</p>
            <p className="text-3xl font-bold text-red-700">{totalFailed}</p>
            <p className="text-xs text-red-600 mt-1">{((totalFailed/students.length)*100).toFixed(1)}% of class</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-700 font-semibold">Average Score</p>
            <p className="text-3xl font-bold text-orange-700">
              {totalFailed > 0 ? (failedStudentsList.reduce((sum, s) => sum + s.overallAvg, 0) / totalFailed).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-orange-600">Below 50% passing</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
            <p className="text-sm text-cyan-700 font-semibold">Total Students</p>
            <p className="text-3xl font-bold text-cyan-700">{students.length}</p>
            <p className="text-xs text-cyan-600">In this class</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700 font-semibold">Current Period</p>
            <p className="text-lg font-bold text-blue-700">{semester}</p>
            <p className="text-xs text-blue-600">{academicYear}</p>
          </div>
        </div>
      )}
      
      {!loading && failedStudentsList.length === 0 && students.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 mb-6 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
          <p className="text-green-700 text-lg font-semibold">🎉 No Failed Students!</p>
          <p className="text-sm text-green-600 mt-1">All students passed {semester} for {academicYear}</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
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
          <div className="flex flex-wrap gap-3 mt-3">
            <button 
              onClick={handleExportToExcel} 
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              disabled={loading || failedStudentsList.length === 0}
            >
              <FileSpreadsheet size={18} />
              <span>Export to Excel</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading marks for {semester} - {academicYear}...</p>
            </div>
          </div>
        ) : failedStudentsList.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <p className="text-green-600 text-lg font-semibold">🎉 No Failed Students!</p>
            <p className="text-sm text-gray-400 mt-2">All students passed {semester} for {academicYear}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <tr>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Rank</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Photo</th>
                    <th className="p-3 text-left text-sm font-bold border border-cyan-600">Roll No</th>
                    <th className="p-3 text-left text-sm font-bold border border-cyan-600">Student Name</th>
                    <th className="p-3 text-left text-sm font-bold border border-cyan-600">Gender</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Sem 1 Avg</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Sem 2 Avg</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Overall Avg</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Grade</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Status</th>
                    <th className="p-3 text-center text-sm font-bold border border-cyan-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStudents.map((student, idx) => {
                    const grade = student.grade;
                    const bgColor = idx % 2 === 0 ? '#ffffff' : '#f0f9ff';
                    const studentImage = getStudentImage(student);
                    
                    return (
                      <tr key={student._id} style={{background: bgColor}} className="hover:bg-cyan-50 transition">
                        <td className="p-3 text-center border border-gray-200">
                          <span className="inline-block w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold text-center leading-8">
                            {student.rank}
                          </span>
                        </td>
                        <td className="p-3 text-center border border-gray-200">
                          <img
                            src={studentImage}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-cyan-200 mx-auto"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4F46E5&color=fff&size=40&font-size=0.5&bold=true`;
                            }}
                          />
                        </td>
                        <td className="p-3 font-mono font-semibold text-gray-900 border border-gray-200">{student.rollNumber}</td>
                        <td className="p-3 font-medium text-gray-900 border border-gray-200">{student.name}</td>
                        <td className="p-3 text-gray-600 border border-gray-200">{student.sex || '-'}</td>
                        <td className="p-3 text-center border border-gray-200">
                          <span className="font-bold text-cyan-700">{student.s1Avg.toFixed(1)}%</span>
                        </td>
                        <td className="p-3 text-center border border-gray-200">
                          <span className="font-bold text-cyan-700">{student.s2Avg.toFixed(1)}%</span>
                        </td>
                        <td className="p-3 text-center border border-gray-200">
                          <span className="font-bold text-red-600">{student.overallAvg.toFixed(1)}%</span>
                        </td>
                        <td className="p-3 text-center border border-gray-200">
                          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: grade.bg, color: grade.color}}>
                            {grade.letter}
                          </span>
                        </td>
                        <td className="p-3 text-center border border-gray-200">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            ❌ FAILED
                          </span>
                        </td>
                        <td className="p-3 text-center border border-gray-200">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setViewMode('student');
                            }}
                            className="px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition text-sm font-medium"
                          >
                            <Eye size={14} className="inline mr-1" /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="8" className="p-3 text-sm font-bold text-gray-700 border border-gray-200">Total Failed Students</td>
                    <td colSpan="3" className="p-3 text-center text-sm font-bold text-red-600 border border-gray-200">
                      {failedStudentsList.length} Students
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Pagination */}
            {failedStudentsList.length > 0 && (
              <div className="border-t border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="px-3 py-1 border border-gray-300 rounded-lg"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronsLeft size={18} />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <span className="px-4 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, failedStudentsList.length)} of {failedStudentsList.length} failed students
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FailedStudentsReport;